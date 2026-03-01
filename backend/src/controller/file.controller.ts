import { Request, Response } from "express";
import { fileService } from "../services/FileItemService/FileService";
import { sendResponse } from "../utils/apiResponse";
import { HttpStatus } from "../constants/httpStatus";
import { logger } from "../utils/logger";

export const generateUploadURL = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { fileName, mimeType, size, parentId } = req.body;

    logger.info("Generate upload URL request", {
      userId,
      fileName,
      size,
      parentId,
    });

    const result = await fileService.generateUploadURL({
      userId,
      fileName,
      mimeType,
      size,
      parentId,
    });

    logger.info("Upload URL generated successfully", {
      userId,
      fileName,
    });

    sendResponse(res, HttpStatus.CREATED, "URL Generated Successfully", result);
  } catch (error: any) {
    logger.error("Failed to generate upload URL", {
      userId: req.userId,
      error: error.message,
    });

    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const confirmUpload = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { fileId, name, key, size, mimeType, parentId } = req.body;
    logger.info("Confirm upload request", {
      userId,
      fileId,
      size,
    });

    const file = await fileService.confirmUpload({
      fileId,
      userId,
      name,
      key,
      size,
      mimeType,
      parentId,
    });

    logger.info("File upload confirmed", {
      userId,
      fileId,
    });

    sendResponse(res, HttpStatus.CREATED, "File Uploaded Successfully", file);
  } catch (error: any) {
    logger.error("File upload confirmation failed", {
      userId: req.userId,
      fileId: req.body?.fileId,
      error: error.message,
    });

    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const renameFile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { fileId } = req.params;
    const { newName } = req.body;

    logger.info("Rename file request", {
      userId,
      fileId,
      newName,
    });

    const file = await fileService.renameFile(fileId, userId, newName);

    logger.info("File renamed successfully", {
      userId,
      fileId,
    });

    sendResponse(res, HttpStatus.CREATED, "File Rename Successfully", file);
  } catch (error: any) {
    logger.warn("File rename failed", {
      userId: req.userId,
      fileId: req.params?.fileId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const deleteFile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { fileId } = req.params;
    logger.info("Delete file request", {
      userId,
      fileId,
    });

    await fileService.deleteFile(fileId, userId);
    logger.info("File deleted successfully", {
      userId,
      fileId,
    });

    sendResponse(res, HttpStatus.CREATED, "File Deleted Successfully");
  } catch (error: any) {
    logger.warn("File deletion failed", {
      userId: req.userId,
      fileId: req.params?.fileId,
      error: error.message,
    });

    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};
