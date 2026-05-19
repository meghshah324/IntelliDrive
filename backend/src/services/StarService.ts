import { prisma } from "../prisma";
import { logger } from "../utils/logger";
import { v4 as uuid } from "uuid";

class StarService {
  /**
   * Star a node (file or folder) for the given user.
   * Idempotent — re-starring an already-starred node returns the existing row.
   */
  async star(userId: string, nodeId: string) {
    logger.info("Starring node", { userId, nodeId });

    const node = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!node || node.userId !== userId) {
      logger.warn("Star failed: node not found or unauthorized", {
        userId,
        nodeId,
      });
      throw new Error("Node not found");
    }

    try {
      const star = await prisma.star.upsert({
        where: { userId_nodeId: { userId, nodeId } },
        update: {},
        create: { id: uuid(), userId, nodeId },
      });

      logger.info("Node starred", { userId, nodeId });
      return star;
    } catch (error: any) {
      logger.error("Failed to star node", {
        userId,
        nodeId,
        error: error.message,
      });
      throw error;
    }
  }

  async unstar(userId: string, nodeId: string) {
    logger.info("Unstarring node", { userId, nodeId });

    try {
      await prisma.star.deleteMany({ where: { userId, nodeId } });
      logger.info("Node unstarred", { userId, nodeId });
    } catch (error: any) {
      logger.error("Failed to unstar node", {
        userId,
        nodeId,
        error: error.message,
      });
      throw error;
    }
  }


  async listStarred(userId: string) {
    logger.info("Listing starred nodes", { userId });

    try {
      const stars = await prisma.star.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { node: true },
      });

      return stars
        .filter((s) => s.node && s.node.userId === userId && !s.node.isTrashed)
        .map((s) => ({ ...s.node, isStarred: true }));
    } catch (error: any) {
      logger.error("Failed to list starred nodes", {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Bulk lookup helper used by the explorer to flag isStarred on listings.
   */
  async getStarredNodeIds(
    userId: string,
    nodeIds: string[],
  ): Promise<Set<string>> {
    if (nodeIds.length === 0) return new Set();

    const stars = await prisma.star.findMany({
      where: { userId, nodeId: { in: nodeIds } },
      select: { nodeId: true },
    });

    return new Set(stars.map((s) => s.nodeId));
  }
}

export const starService = new StarService();
