import { prisma } from "../../prisma";
import { node_type } from "../../../generated/prisma";
import { storageService } from "../storage";
import { quotaService } from "../QuotaService";
import { recentService } from "../RecentService";
import { folderService } from "./FolderService";
import { trashCleanupQueue } from "../trashCleanup.queue";
import { logger } from "../../utils/logger";

export class TrashService {

  async listTrash(userId: string) {
    logger.info("Listing trash", { userId });

    const trashed = await prisma.node.findMany({
      where: { userId, isTrashed: true },
      orderBy: { trashedAt: "desc" },
    });

    if (trashed.length === 0) return [];

    const trashedIds = new Set(trashed.map((n) => n.id));
    return trashed.filter(
      (n) => !n.parentId || !trashedIds.has(n.parentId),
    );
  }

  async restore(nodeId: string, userId: string) {
    logger.info("Restore request", { userId, nodeId });

    const node = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!node) throw new Error("Item not found");
    if (node.userId !== userId) throw new Error("Unauthorized");
    if (!node.isTrashed) return node;

    // // Re-parent to root if original parent is missing or itself trashed.
    // let restoreParentId: string | null = node.parentId;
    // if (restoreParentId) {
    //   const parent = await prisma.node.findUnique({
    //     where: { id: restoreParentId },
    //   });
    //   if (!parent || parent.isTrashed || parent.userId !== userId) {
    //     restoreParentId = null;
    //   }
    // }

    if (node.type === node_type.FOLDER) {
      const descendantIds = await folderService.collectDescendantIds(node.id);
      const allIds = [node.id, ...descendantIds];

      await prisma.node.updateMany({
        where: { id: { in: allIds }, userId, isTrashed: true },
        data: { isTrashed: false, trashedAt: null },
      });
    } else {
      await prisma.node.update({
        where: { id: node.id },
        data: { isTrashed: false, trashedAt: null },
      });
    }

    // // Patch parentId on the top-level restored node if we had to re-root.
    // if (restoreParentId !== node.parentId) {
    //   await prisma.node.update({
    //     where: { id: node.id },
    //     data: { parentId: restoreParentId },
    //   });
    // }

    // remove from trashQueue if present (e.g. if restore is called before the scheduled purge runs)
    await trashCleanupQueue.remove(`trash-${node.type.toLowerCase()}-${node.id}`);

    logger.info("Restore complete", { userId, nodeId });

    return prisma.node.findUnique({ where: { id: node.id } });
  }

  async permanentDelete(nodeId: string, userId: string) {
    logger.info("Permanent delete request", { userId, nodeId });

    const node = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!node) throw new Error("Item not found");
    if (node.userId !== userId) throw new Error("Unauthorized");
    if (!node.isTrashed) throw new Error("Item is not in trash");

    await this.purgeNode(node.id, userId);

    // remove from trashQueue if present (e.g. if permanentDelete is called before the scheduled purge runs)
    await trashCleanupQueue.remove(`trash-${node.type.toLowerCase()}-${node.id}`);

    logger.info("Permanent delete complete", { userId, nodeId });
  }

  async emptyTrash(userId: string) {
    logger.info("Empty trash request", { userId });

    const tops = await this.listTrash(userId);
    let firstError: any = null;

    for (const top of tops) {
      try {
        await this.purgeNode(top.id, userId);
      } catch (err: any) {
        logger.error("Empty trash: failed to purge node", {
          userId,
          nodeId: top.id,
          error: err?.message,
        });
        if (!firstError) firstError = err;
      }
    }

    if (firstError) throw firstError;
  }

  /**
   * Hard-delete a node and every descendant from the DB + S3 + quota.
   * Safe to call on any trashed node (file or folder).
   */
  private async purgeNode(nodeId: string, userId: string) {
    const root = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!root) return;

    const descendantIds =
      root.type === node_type.FOLDER
        ? await folderService.collectDescendantIds(nodeId)
        : [];

    // Load all involved nodes so we can delete their S3 keys + adjust quota.
    const all = await prisma.node.findMany({
      where: { id: { in: [nodeId, ...descendantIds] } },
    });

    for (const n of all) {
      if (n.type === node_type.FILE && n.key) {
        try {
          await storageService.deleteFile(n.key);
          logger.info("Permanently removed file from storage", { id: n.id });
        } catch (err: any) {
          // Don't block DB cleanup on a storage failure; surface in logs.
          logger.error("Failed to delete S3 object during purge", {
            id: n.id,
            key: n.key,
            error: err?.message,
          });
        }
      }
      if (n.type === node_type.FILE && n.size) {
        try {
          await quotaService.decreaseUsed(userId, n.size);
        } catch (err: any) {
          logger.warn("Failed to decrement quota during purge", {
            id: n.id,
            error: err?.message,
          });
        }
      }
      try {
        await recentService.removeRecentFile(userId, n.id);
      } catch {
        // recents removal is best-effort
      }
    }

    // Cascade FK on parentId means deleting the root removes all descendants.
    await prisma.node.delete({ where: { id: nodeId } });
  }

}

export const trashService = new TrashService();
