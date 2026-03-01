import { prisma } from "../../prisma";
import { NodeType } from "../../../generated/prisma";
import { storageService } from "../../services/storage/index";
import { logger } from "../../utils/logger";
import { quotaService } from "../QuotaService";

export class FolderService {
  async createFolder(userId: string, name: string, parentId?: string) {
    logger.info(`User ${userId} creating folder ${name}`);

    if (parentId) {
      const parent = await prisma.node.findUnique({ where: { id: parentId } });
      if (
        !parent ||
        parent.type !== NodeType.FOLDER ||
        parent.userId !== userId
      ) {
        logger.warn(`Invalid parent folder access by user ${userId}`);
        throw new Error("Invalid parent folder");
      }
    }

    const folder = await prisma.node.create({
      data: {
        name,
        type: NodeType.FOLDER,
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

    if (!folder || folder.type !== NodeType.FOLDER) {
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
    logger.info(`User ${userId} deleting folder ${folderId}`);

    const folder = await prisma.node.findUnique({ where: { id: folderId } });

    if (!folder || folder.type !== NodeType.FOLDER) {
      logger.warn(`Folder ${folderId} not found`);
      throw new Error("Folder not found");
    }

    if (folder.userId !== userId) {
      logger.warn(`Unauthorized delete attempt by user ${userId}`);
      throw new Error("Unauthorized");
    }

    await this.deleteRecursively(folderId, userId);

    const deleted = await prisma.node.delete({
      where: { id: folderId },
    });

    logger.info(`Folder ${folderId} deleted successfully`);

    return deleted;
  }

  private async deleteRecursively(parentId: string, userId: string) {
    const children = await prisma.node.findMany({
      where: { parentId },
    });

    for (const child of children) {
      if (child.type === NodeType.FILE && child.key) {
        try {
          await storageService.deleteFile(child.key);
          logger.info(`Deleted file from S3: ${child.id}`);
        } catch (err) {
          logger.error(`Failed deleting S3 file ${child.id}`, err);
          throw err;
        }
      }

      if (child.type == NodeType.FOLDER) {
        await this.deleteRecursively(child.id, userId);
      }
      await quotaService.decreaseUsed(userId, child?.size ? child.size : 0);

      await prisma.node.delete({
        where: { id: child.id },
      });

      logger.info(`Deleted node ${child.id} from database`);
    }
  }
}

export const folderService = new FolderService();
