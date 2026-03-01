import { redisClient } from "../config/redis";
import { prisma } from "../prisma";
import { logger } from "../utils/logger";

class RecentService {
  private MAX_RECENT = 20;

  async addRecentFile(userId: string, fileId: string) {
    const key = `recent:files:${userId}`;
    const timestamp = Date.now();

    try {
      logger.info("Adding recent file", { userId, fileId });

      await redisClient.zAdd(key, {
        score: timestamp,
        value: fileId,
      });

      await redisClient.zRemRangeByRank(key, 0, -this.MAX_RECENT - 1);
    } catch (error) {
      logger.error("Failed to add recent file", { userId, fileId, error });
      throw error;
    }
  }

  async getRecentFiles(userId: string) {
    const key = `recent:files:${userId}`;

    try {
      logger.info("Fetching recent files", { userId });

      const fileIds = await redisClient.zRange(key, 0, -1, {
        REV: true,
      });

      if (fileIds.length === 0) {
        logger.info("No recent files found", { userId });
        return [];
      }

      const files = await prisma.node.findMany({
        where: {
          id: { in: fileIds },
          userId,
        },
      });

      const fileMap = new Map(files.map((f) => [f.id, f]));

      return fileIds.map((id) => fileMap.get(id)).filter(Boolean);
    } catch (error) {
      logger.error("Failed to fetch recent files", { userId, error });
      throw error;
    }
  }

  async removeRecentFile(userId: string, fileId: string) {
    const key = `recent:files:${userId}`;

    try {
      logger.info("Removing recent file", { userId, fileId });

      await redisClient.zRem(key, fileId);
    } catch (error) {
      logger.error("Failed to remove recent file", { userId, fileId, error });
      throw error;
    }
  }
}

export const recentService = new RecentService();
