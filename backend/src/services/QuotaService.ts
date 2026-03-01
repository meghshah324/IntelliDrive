import { prisma } from "../prisma";
import { logger } from "../utils/logger";

export class QuotaService {

  async checkLimit(userId: string, fileSize: number) {
    try {
      logger.info("Checking storage quota", { userId, fileSize });

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.warn("Quota check failed. User not found", { userId });
        throw new Error("User not found");
      }

      if (user.usedStorage + fileSize > user.storageLimit) {
        logger.warn("Quota exceeded", {
          userId,
          usedStorage: user.usedStorage,
          fileSize,
          storageLimit: user.storageLimit
        });
        throw new Error("Storage Quota Exceeded");
      }

      logger.info("Quota check passed", { userId });

    } catch (error) {
      logger.error("Quota check error", { userId, error });
      throw error;
    }
  }

  async increaseUsed(userId: string, fileSize: number) {
    try {
      logger.info("Increasing used storage", { userId, fileSize });

      return await prisma.user.update({
        where: { id: userId },
        data: {
          usedStorage: { increment: fileSize },
        },
      });

    } catch (error) {
      logger.error("Failed to increase storage", { userId, error });
      throw error;
    }
  }

  async decreaseUsed(userId: string, fileSize: number) {
    try {
      logger.info("Decreasing used storage", { userId, fileSize });

      return await prisma.user.update({
        where: { id: userId },
        data: {
          usedStorage: { decrement: fileSize },
        },
      });

    } catch (error) {
      logger.error("Failed to decrease storage", { userId, error });
      throw error;
    }
  }
}

export const quotaService = new QuotaService();