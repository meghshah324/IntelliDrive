import { v4 as uuid } from "uuid";
import { storageService } from "../storage";
import { prisma } from "../../prisma";
import { node_type } from "../../../generated/prisma";
import { quotaService } from "../QuotaService";
import { recentService } from "../RecentService";
import { logger } from "../../utils/logger";
import {
  TRASH_CLEANUP_QUEUE_NAME,
  trashCleanupQueue,
} from "../trashCleanup.queue";
import { TRASH_RETENTION_DAYS } from "../../constants/trashConstant";

export class FileService {
  async generateUploadURL(params: {
    userId: string;
    fileName: string;
    mimeType: string;
    size: number;
    parentId?: string;
  }): Promise<{ uploadUrl: string; key: string; fileId: string }> {
    const { userId, fileName, mimeType, size, parentId } = params;

    logger.info(`Generating upload URL for user ${userId}, file ${fileName}`);

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

    await quotaService.checkLimit(userId, size);

    const fileId = uuid();
    const key = `users/${userId}/${fileId}-${fileName}`;

    const uploadUrl = await storageService.generateUploadURL({
      key,
      contentType: mimeType,
    });

    logger.info(`Upload URL generated for file ${fileId}`);

    return {
      uploadUrl,
      key,
      fileId,
    };
  }

  async startMultipartUpload(params: {
    userId: string;
    fileName: string;
    mimeType: string;
    size: number;
    parentId?: string;
  }): Promise<{ uploadId: string; key: string; fileId: string }> {
    const { userId, fileName, mimeType, size, parentId } = params;

    logger.info(
      `Starting multipart upload for user ${userId}, file ${fileName}`,
    );

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

    await quotaService.checkLimit(userId, size);

    const fileId = uuid();
    const key = `users/${userId}/${fileId}-${fileName}`;

    const multipart = await storageService.startMultipartUpload({
      key,
      contentType: mimeType,
    });

    logger.info(`Multipart upload started for ${fileId}`);

    return {
      uploadId: multipart.uploadId,
      key,
      fileId,
    };
  }

  async getMultipartPresignedUrls(params: {
    uploadId: string;
    key: string;
    parts: number[];
  }) {
    const { uploadId, key, parts } = params;

    logger.info(`Generating presigned URLs for ${parts.length} parts`);

    const urls = await Promise.all(
      parts.map(async (partNumber) => {
        const url = await storageService.getPartUploadUrl({
          key,
          uploadId,
          partNumber,
        });

        return {
          partNumber,
          url,
        };
      }),
    );

    return urls;
  }

  async completeMultipartUpload(params: {
    uploadId: string;
    key: string;
    parts: { ETag: string; PartNumber: number }[];
  }) {
    const { uploadId, key, parts } = params;

    logger.info(`Completing multipart upload ${uploadId}`);

    await storageService.completeMultipartUpload({
      uploadId,
      key,
      parts,
    });

    logger.info(`Multipart upload completed for key ${key}`);

    return true;
  }

  async abortMultipartUpload(params: { uploadId: string; key: string }) {
    const { uploadId, key } = params;

    logger.info(`Aborting multipart upload ${uploadId}`);

    await storageService.abortMultipartUpload({ uploadId, key });

    return true;
  }

  async confirmUpload(data: {
    fileId: string;
    userId: string;
    name: string;
    key: string;
    size: number;
    mimeType: string;
    parentId?: string;
  }) {
    logger.info(`Confirming upload for file ${data.fileId}`);

    const file = await prisma.$transaction(async (tx) => {
      await quotaService.checkLimit(data.userId, data.size, tx);
      await quotaService.increaseUsed(data.userId, data.size, tx);

      return tx.node.create({
        data: {
          id: data.fileId,
          name: data.name,
          type: node_type.FILE,
          key: data.key,
          size: data.size,
          mimeType: data.mimeType,
          userId: data.userId,
          parentId: data.parentId ?? null,
        },
      });
    });

    logger.info(`File ${data.fileId} stored in database`);

    return file;
  }

  async renameFile(fileId: string, userId: string, newName: string) {
    logger.info(`User ${userId} renaming file ${fileId}`);

    const file = await prisma.node.findUnique({
      where: { id: fileId },
    });

    if (!file || file.type !== node_type.FILE || file.isTrashed) {
      logger.warn(`Rename failed. File ${fileId} not found`);
      throw new Error("File not found");
    }

    if (file.userId !== userId) {
      logger.warn(`Unauthorized rename attempt by user ${userId}`);
      throw new Error("Unauthorized");
    }

    const updated = await prisma.node.update({
      where: { id: fileId },
      data: { name: newName },
    });

    logger.info(`File ${fileId} renamed successfully`);

    return updated;
  }

  async deleteFile(fileId: string, userId: string) {
    logger.info(`User ${userId} trashing file ${fileId}`);

    const file = await prisma.node.findUnique({ where: { id: fileId } });

    if (!file || file.type !== node_type.FILE) {
      logger.warn(`Trash failed. File ${fileId} not found`);
      throw new Error("File not found");
    }

    if (file.userId !== userId) {
      logger.warn(`Unauthorized trash attempt by user ${userId}`);
      throw new Error("Unauthorized");
    }

    if (file.isTrashed) {
      logger.info(`File ${fileId} already in trash`);
      return file;
    }

    const updated = await prisma.node.update({
      where: { id: fileId },
      data: { isTrashed: true, trashedAt: new Date() },
    });

    // Remove from the recents zset so trashed files don't show in Recents.
    try {
      await recentService.removeRecentFile(userId, fileId);
    } catch (err: any) {
      logger.warn("Failed to remove trashed file from recents", {
        userId,
        fileId,
        error: err?.message,
      });
    }

    // add to trash cleanup queue
    try {
      await trashCleanupQueue.add(
        "auto-delete-trash",
        {
          nodeId: fileId,
          userId,
        },
        {
          delay: TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000,
          jobId: `trash-file-${fileId}`,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    } catch (err: any) {
      logger.error("Failed to enqueue trash cleanup job", {
        userId,
        fileId,
        error: err?.message,
      });
    }

    logger.info(`File ${fileId} moved to trash`);

    return updated;
  }

  async getPreviewSignedURL(fileId: string, userId: string) {
    logger.info(`Generating preview URL for file ${fileId} by user ${userId}`);

    const file = await prisma.node.findUnique({ where: { id: fileId } });

    if (!file || file.type !== node_type.FILE || file.isTrashed) {
      logger.warn(`Preview URL generation failed. File ${fileId} not found`);
      throw new Error("File not found");
    }

    if (file.userId !== userId) {
      logger.warn(`Unauthorized preview attempt by user ${userId}`);
      throw new Error("Unauthorized");
    }

    const url = await storageService.getPreviewSignedURL(file.key as string);

    // Record this file in the user's recent set. Failure here must not break
    // preview/download, so the recent service swallows its own errors.
    try {
      await recentService.addRecentFile(userId, fileId);
    } catch (err: any) {
      logger.warn("Failed to record recent file", {
        userId,
        fileId,
        error: err?.message,
      });
    }

    return url;
  }

  async getDownloadSignedURL(fileId: string, userId: string) {
    logger.info(`Generating download URL for file ${fileId} by user ${userId}`);

    const file = await prisma.node.findUnique({ where: { id: fileId } });

    if (!file || file.type !== node_type.FILE || file.isTrashed) {
      logger.warn(`Download URL generation failed. File ${fileId} not found`);
      throw new Error("File not found");
    }

    if (file.userId !== userId) {
      logger.warn(`Unauthorized download attempt by user ${userId}`);
      throw new Error("Unauthorized");
    }

    const url = await storageService.getDownloadSignedURL(
      file.key as string,
      file.name,
    );

    // Record this file in the user's recent set. Failure here must not break
    // the download, so the recent service swallows its own errors.
    try {
      await recentService.addRecentFile(userId, fileId);
    } catch (err: any) {
      logger.warn("Failed to record recent file", {
        userId,
        fileId,
        error: err?.message,
      });
    }

    return url;
  }
}

export const fileService = new FileService();
