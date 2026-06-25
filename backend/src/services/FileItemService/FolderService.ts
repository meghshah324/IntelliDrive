import { prisma } from "../../prisma";
import { node_type } from "../../../generated/prisma";
import { logger } from "../../utils/logger";
import { trashCleanupQueue} from "../trashCleanup.queue";
import { TRASH_RETENTION_DAYS } from "../../constants/trashConstant";

export class FolderService {
  
  async createFolder(userId: string, name: string, parentId?: string) {
    logger.info(`User ${userId} creating folder ${name}`);

    if (parentId) {
      const parent = await prisma.node.findUnique({ where: { id: parentId } });
      if (
        !parent ||
        parent.type !== node_type.FOLDER ||
        parent.userId !== userId
      ) {
        logger.warn(`Invalid parent folder access by user ${userId}`);
        throw new Error("Invalid parent folder");
      }
    }

    const folder = await prisma.node.create({
      data: {
        name,
        type: node_type.FOLDER,
        userId,
        parentId: parentId ?? null,
      },
    });

    logger.info(`Folder ${folder.id} created successfully`);

    return folder;
  }

  async renameFolder(folderId: string, userId: string, newName: string) {
    logger.info(`User ${userId} renaming folder ${folderId}`);

    const folder = await prisma.node.findUnique({ where: { id: folderId } });

    if (!folder || folder.type !== node_type.FOLDER || folder.isTrashed) {
      logger.warn(`Folder ${folderId} not found`);
      throw new Error("Folder not found");
    }

    if (folder.userId !== userId) {
      logger.warn(`Unauthorized rename attempt by user ${userId}`);
      throw new Error("Unauthorized");
    }

    const updated = await prisma.node.update({
      where: { id: folderId },
      data: { name: newName },
    });

    logger.info(`Folder ${folderId} renamed successfully`);

    return updated;
  }


  async deleteFolder(folderId: string, userId: string) {
    logger.info(`User ${userId} trashing folder ${folderId}`);

    const folder = await prisma.node.findUnique({ where: { id: folderId } });

    if (!folder || folder.type !== node_type.FOLDER) {
      logger.warn(`Folder ${folderId} not found`);
      throw new Error("Folder not found");
    }

    if (folder.userId !== userId) {
      logger.warn(`Unauthorized delete attempt by user ${userId}`);
      throw new Error("Unauthorized");
    }

    if (folder.isTrashed) {
      logger.info(`Folder ${folderId} already in trash`);
      return folder;
    }

    const now = new Date();
    const descendantIds = await this.collectDescendantIds(folderId);
    const allIds = [folderId, ...descendantIds];

    await prisma.node.updateMany({
      where: { id: { in: allIds }, userId },
      data: { isTrashed: true, trashedAt: now },
    });

      // add to trash cleanup queue
   await trashCleanupQueue.add("auto-delete-trash",{
        nodeId: folderId,
        userId,
   },{
        delay: TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000,
        jobId: `trash-folder-${folderId}`,
        removeOnComplete: true,
        removeOnFail: false
   });

    logger.info(`Folder ${folderId} (and ${descendantIds.length} descendants) moved to trash`);

    return { ...folder, isTrashed: true, trashedAt: now };
  }

  async collectDescendantIds(rootId: string): Promise<string[]> {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE descendants AS (
        SELECT id FROM \`node\` WHERE \`parentId\` = ${rootId}
        UNION ALL
        SELECT n.id FROM \`node\` n
        INNER JOIN descendants d ON n.\`parentId\` = d.id
      )
      SELECT id FROM descendants
    `;
    return rows.map((r) => r.id);
  }
}

export const folderService = new FolderService();
