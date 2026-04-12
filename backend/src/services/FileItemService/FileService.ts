import { v4 as uuid } from "uuid";
import { storageService } from "../storage";
import { prisma } from "../../prisma";
import { NodeType } from "../../../generated/prisma";
import { quotaService } from "../QuotaService";
import { logger } from "../../utils/logger";

export class FileService {
  async generateUploadURL(params: {
    userId: string;
    fileName: string;
    mimeType: string;
    size: number;
    parentId?: string;
  }) {
    const { userId, fileName, mimeType, size, parentId } = params;

    logger.info(`Generating upload URL for user ${userId}, file ${fileName}`);

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
  }) {
    const { userId, fileName, mimeType, size, parentId } = params;

    logger.info(
      `Starting multipart upload for user ${userId}, file ${fileName}`,
    );

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

    const increaseLimit = quotaService.increaseUsed(data.userId, data.size);

    const file = await prisma.node.create({
      data: {
        id: data.fileId,
        name: data.name,
        type: NodeType.FILE,
        key: data.key,
        size: data.size,
        mimeType: data.mimeType,
        userId: data.userId,
        parentId: data.parentId ?? null,
      },
    });

    logger.info(`File ${data.fileId} stored in database`);

    return file;
  }

  async renameFile(fileId: string, userId: string, newName: string) {
    logger.info(`User ${userId} renaming file ${fileId}`);

    const file = await prisma.node.findUnique({
      where: { id: fileId },
    });

    if (!file || file.type !== NodeType.FILE) {
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
    logger.info(`User ${userId} deleting file ${fileId}`);

    const file = await prisma.node.findUnique({ where: { id: fileId } });

    if (!file) {
      logger.warn(`Delete failed. File ${fileId} not found`);
      throw new Error("File not found");
    }

    if (file.userId !== userId) {
      logger.warn(`Unauthorized delete attempt by user ${userId}`);
      throw new Error("Unauthorized");
    }

    if (file.key) {
      await storageService.deleteFile(file.key);
      logger.info(`File ${fileId} deleted from S3`);
    }

    await quotaService.decreaseUsed(userId, file.size ? file.size : 0);

    const deleted = await prisma.node.delete({
      where: { id: fileId },
    });

    logger.info(`File ${fileId} removed from database`);

    return deleted;
  }
}

export const fileService = new FileService();
