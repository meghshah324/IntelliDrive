import { prisma } from "../prisma";
import { logger } from "../utils/logger";
import { redisClient } from "../config/redis";

export interface RecentFileMeta {
  id: string;
  name: string;
  key: string;
  mimeType: string | null;
  size: number | null;
  type: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

class RecentService {
  private MAX_RECENT = 20;
  // TTL of 7 days for cached metadata
  private META_TTL_SECONDS = 7 * 24 * 60 * 60;

  /** Sorted set key — tracks access order for a user */
  private orderKey(userId: string) {
    return `recent:files:${userId}`;
  }

  /** Hash key — stores all metadata for a specific file of a user */
  private metaKey(userId: string, fileId: string) {
    return `recent:file:meta:${userId}:${fileId}`;
  }

  async addRecentFile(userId: string, file: RecentFileMeta) {
    const orderK = this.orderKey(userId);
    const metaK  = this.metaKey(userId, file.id);
    const timestamp = Date.now();
    const accessedAt = new Date(timestamp);

    try {
      logger.info("Adding recent file", { userId, fileId: file.id });

      // ── 1. Persist to DB (upsert) so data survives Redis restarts ──────────
      await prisma.recent_file.upsert({
        where:  { userId_nodeId: { userId, nodeId: file.id } },
        update: { name: file.name, key: file.key, mimeType: file.mimeType, size: file.size, accessedAt },
        create: { id: `${userId}_${file.id}`, userId, nodeId: file.id, name: file.name, key: file.key, mimeType: file.mimeType, size: file.size, accessedAt },
      });

      // Trim DB to MAX_RECENT rows per user — delete oldest beyond the limit
      const oldest = await prisma.recent_file.findMany({
        where:   { userId },
        orderBy: { accessedAt: "desc" },
        skip:    this.MAX_RECENT,
        select:  { id: true },
      });
      if (oldest.length > 0) {
        await prisma.recent_file.deleteMany({ where: { id: { in: oldest.map((r) => r.id) } } });
      }

      // ── 2. Cache metadata in Redis hash ────────────────────────────────────
      await redisClient.hset(metaK, {
        id:        file.id,
        name:      file.name,
        key:       file.key,
        mimeType:  file.mimeType ?? "",
        size:      file.size !== null ? String(file.size) : "",
        type:      file.type,
        userId:    file.userId,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      });
      await redisClient.expire(metaK, this.META_TTL_SECONDS);

      // ── 3. Update sorted set order ─────────────────────────────────────────
      await redisClient.zadd(orderK, timestamp, file.id);

      // Evict from sorted set beyond MAX_RECENT and clean up their hashes
      const removed = await redisClient.zrange(orderK, 0, -(this.MAX_RECENT + 1));
      await redisClient.zremrangebyrank(orderK, 0, -(this.MAX_RECENT + 1));
      for (const evictedId of removed) {
        await redisClient.del(this.metaKey(userId, evictedId));
      }
    } catch (error) {
      logger.error("Failed to add recent file", { userId, fileId: file.id, error });
      throw error;
    }
  }

  async getRecentFiles(userId: string): Promise<RecentFileMeta[]> {
    const orderK = this.orderKey(userId);

    try {
      logger.info("Fetching recent files", { userId });

      // Get fileIds ordered most-recent first
      const fileIds = await redisClient.zrevrange(orderK, 0, -1);

      if (fileIds.length === 0) {
        logger.info("No recent files in Redis, checking DB", { userId });
        return this.hydrateFromDB(userId);
      }

      const results: RecentFileMeta[] = [];
      const cacheMisses: string[] = [];

      // Try to resolve each file from Redis first
      for (const fileId of fileIds) {
        const metaK = this.metaKey(userId, fileId);
        const raw = await redisClient.hgetall(metaK);

        if (raw && raw.id) {
          results.push(this.deserializeMeta(raw));
        } else {
          cacheMisses.push(fileId);
        }
      }

      // For cache misses, fetch from DB and re-cache
      if (cacheMisses.length > 0) {
        logger.info("Cache miss for some files, fetching from DB", { userId, count: cacheMisses.length });

        const dbFiles = await prisma.node.findMany({
          where: { id: { in: cacheMisses }, userId, isTrashed: false },
        });

        for (const node of dbFiles) {
          const meta: RecentFileMeta = {
            id:        node.id,
            name:      node.name,
            key:       node.key as string,
            mimeType:  node.mimeType,
            size:      node.size,
            type:      node.type,
            userId:    node.userId,
            createdAt: node.createdAt,
            updatedAt: node.updatedAt,
          };

          // Re-cache the metadata
          const metaK = this.metaKey(userId, node.id);
          await redisClient.hset(metaK, {
            id:        meta.id,
            name:      meta.name,
            key:       meta.key,
            mimeType:  meta.mimeType ?? "",
            size:      meta.size !== null ? String(meta.size) : "",
            type:      meta.type,
            userId:    meta.userId,
            createdAt: meta.createdAt.toISOString(),
            updatedAt: meta.updatedAt.toISOString(),
          });
          await redisClient.expire(metaK, this.META_TTL_SECONDS);

          results.push(meta);
        }
      }

      // Preserve the access-time order from the sorted set
      const orderMap = new Map(fileIds.map((id, i) => [id, i]));
      results.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));

      return results;
    } catch (error) {
      logger.error("Failed to fetch recent files", { userId, error });
      throw error;
    }
  }

  async removeRecentFile(userId: string, fileId: string) {
    const orderK = this.orderKey(userId);
    const metaK  = this.metaKey(userId, fileId);

    try {
      logger.info("Removing recent file", { userId, fileId });

      await Promise.all([
        redisClient.zrem(orderK, fileId),
        redisClient.del(metaK),
      ]);
    } catch (error) {
      logger.error("Failed to remove recent file", { userId, fileId, error });
      throw error;
    }
  }

  /** Cold start: user has no Redis data — seed from DB and cache everything */
  private async hydrateFromDB(userId: string): Promise<RecentFileMeta[]> {
    const dbFiles = await prisma.recent_file.findMany({
      where: { userId },
      orderBy: { accessedAt: "desc" },
      take: this.MAX_RECENT,
    });

    if (dbFiles.length === 0) return [];

    const orderK = this.orderKey(userId);

    for (const row of dbFiles) {
      const meta: RecentFileMeta = {
        id:        row.nodeId,
        name:      row.name,
        key:       row.key,
        mimeType:  row.mimeType,
        size:      row.size,
        type:      "FILE",
        userId:    row.userId,
        createdAt: row.accessedAt,
        updatedAt: row.accessedAt,
      };

      const metaK = this.metaKey(userId, row.nodeId);
      await redisClient.hset(metaK, {
        id:        meta.id,
        name:      meta.name,
        key:       meta.key,
        mimeType:  meta.mimeType ?? "",
        size:      meta.size !== null ? String(meta.size) : "",
        type:      meta.type,
        userId:    meta.userId,
        createdAt: meta.createdAt.toISOString(),
        updatedAt: meta.updatedAt.toISOString(),
      });
      await redisClient.expire(metaK, this.META_TTL_SECONDS);
      await redisClient.zadd(orderK, row.accessedAt.getTime(), row.nodeId);
    }

    logger.info("Hydrated recent files from DB into Redis", { userId, count: dbFiles.length });
    return dbFiles.map((row) => ({
      id:        row.nodeId,
      name:      row.name,
      key:       row.key,
      mimeType:  row.mimeType,
      size:      row.size,
      type:      "FILE",
      userId:    row.userId,
      createdAt: row.accessedAt,
      updatedAt: row.accessedAt,
    }));
  }

  private deserializeMeta(raw: Record<string, string>): RecentFileMeta {
    return {
      id:        raw.id,
      name:      raw.name,
      key:       raw.key,
      mimeType:  raw.mimeType || null,
      size:      raw.size ? Number(raw.size) : null,
      type:      raw.type,
      userId:    raw.userId,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    };
  }
}

export const recentService = new RecentService();
