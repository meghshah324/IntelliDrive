import { prisma } from "../../prisma";
import { recentService } from "../RecentService";
import { starService } from "../StarService";
import { logger } from "../../utils/logger";

export class NodeService {
  async listFolderContents(userId: string, parentId?: string) {
    try {
      logger.info("Listing folder contents", { userId, parentId });

      const nodes = await prisma.node.findMany({
        where: {
          userId,
          parentId: parentId ?? null,
          isTrashed: false,
        },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      });

      const starredIds = await starService.getStarredNodeIds(
        userId,
        nodes.map((n) => n.id),
      );

      const result = nodes.map((n) => ({
        ...n,
        isStarred: starredIds.has(n.id),
      }));

      logger.info("Folder contents fetched successfully", {
        userId,
        count: result.length,
      });

      return result;
    } catch (error: any) {
      logger.error("Failed to list folder contents", {
        userId,
        parentId,
        error: error.message,
      });
      throw error;
    }
  }

  async getNodeById(nodeId: string, userId: string) {
    try {
      logger.info("Fetching node by id", { nodeId, userId });

      const node = await prisma.node.findUnique({
        where: { id: nodeId },
      });

      if (!node || node.userId !== userId || node.isTrashed) {
        logger.warn("Node not found or unauthorized access", {
          nodeId,
          userId,
        });
        throw new Error("Not found");
      }

      try {
        await recentService.addRecentFile(userId, nodeId);
      } catch (err: any) {
        logger.warn("Failed to add recent file", {
          nodeId,
          userId,
          error: err.message,
        });
      }

      logger.info("Node fetched successfully", { nodeId, userId });

      return node;
    } catch (error: any) {
      logger.error("Failed to fetch node", {
        nodeId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  async searchNodes(userId: string, query: string) {
    try {
      logger.info("Searching nodes", { userId, query });

      const files = await prisma.node.findMany({
        where: {
          userId,
          isTrashed: false,
          name: {
            contains: query,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const starredIds = await starService.getStarredNodeIds(
        userId,
        files.map((f) => f.id),
      );

      const result = files.map((f) => ({
        ...f,
        isStarred: starredIds.has(f.id),
      }));

      logger.info("Search completed", {
        userId,
        query,
        resultCount: result.length,
      });

      return result;
    } catch (error: any) {
      logger.error("Search failed", {
        userId,
        query,
        error: error.message,
      });
      throw error;
    }
  }

    async getBreadcrumb(nodeId: string, userId: string) {
      const path: any[] = [];

      let current = await prisma.node.findFirst({
        where: { id: nodeId, userId },
      });

      if (!current) throw new Error("Not found");

      while (current) {
        path.unshift({
          id: current.id,
          name: current.name,
          type: current.type,
        });

        if (!current.parentId) break;

        current = await prisma.node.findFirst({
          where: {
            id: current.parentId,
            userId,
          },
        });
      }

      return path;
    }
}

export const nodeService = new NodeService();
