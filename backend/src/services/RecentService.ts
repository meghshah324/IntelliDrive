import { prisma } from "../prisma";
import { logger } from "../utils/logger";
import { redisClient } from "../config/redis";
class RecentService {
  private MAX_RECENT = 5;

  getKey(userId: string) { 
    return `recent:files:${userId}`;
  }

  async addRecentFile(userId: string, fileId: string) {
    const key = this.getKey(userId);
    const timestamp = Date.now();

    try {
      logger.info("Adding recent file", { userId, fileId });

      await redisClient.zadd(key, timestamp, fileId);

      await redisClient.zremrangebyrank(key, 0, -this.MAX_RECENT - 1);
    } catch (error) {
      logger.error("Failed to add recent file", { userId, fileId, error });
      throw error;
    }
  }

  async getRecentFiles(userId: string) {
    const key = this.getKey(userId);

    try {
      logger.info("Fetching recent files", { userId });

      const fileIds = await redisClient.zrevrange(key, 0, -1);

      if (fileIds.length === 0) {
        logger.info("No recent files found", { userId });
        return [];
      }

      const files = await prisma.node.findMany({
        where: {
          id: { in: fileIds },
          userId,
          isTrashed: false,
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
    const key = this.getKey(userId);

    try {
      logger.info("Removing recent file", { userId, fileId });

      await redisClient.zrem(key, fileId);
    } catch (error) {
      logger.error("Failed to remove recent file", { userId, fileId, error });
      throw error;
    }
  }
}

export const recentService = new RecentService();
