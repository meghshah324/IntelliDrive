import { Request, Response } from "express";
import { fileService } from "../services/FileItemService/FileService";
import { sendResponse } from "../utils/apiResponse";
import { HttpStatus } from "../constants/httpStatus";
import { logger } from "../utils/logger";

export const generateUploadURL = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
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
      userId: req.userId as string,
      error: error.message,
    });

    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const confirmUpload = async (req: any, res: Response) => {
  try {
    const userId = (req as any).userId as string;
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

export const startMultipartUpload = async (req: Request, res: Response) => {
  try {
    const userId =(req as any).userId as string;
    const { fileName, mimeType, size, parentId } = req.body;

    logger.info("Start multipart upload", { userId, fileName });

    const result = await fileService.startMultipartUpload({
      userId,
      fileName,
      mimeType,
      size,
      parentId
    });

    sendResponse(res, 201, "Multipart Upload Started", result);

  } catch (error: any) {
    logger.error("Failed to start multipart upload", {
      userId: (req as any).userId as string,
      error: error.message
    });

    sendResponse(res, 400, error.message);
  }
};

export const getMultipartPresignedUrls = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const { uploadId, key, parts } = req.body;

    logger.info("Generate multipart presigned URLs", {
      userId,
      parts: parts.length
    });

    const urls = await fileService.getMultipartPresignedUrls({
      uploadId,
      key,
      parts
    });

    sendResponse(res, 200, "URLs Generated", urls);

  } catch (error: any) {
    logger.error("Failed to generate URLs", {
      error: error.message
    });

    sendResponse(res, 400, error.message);
  }
};

export const completeMultipartUpload = async (req: Request, res: Response) => {
  try {

    const { uploadId, key, parts } = req.body;

    logger.info("Completing multipart upload", {
      uploadId
    });

    const result = await fileService.completeMultipartUpload({
      uploadId,
      key,
      parts
    });

    sendResponse(res, 200, "Upload Completed", result);

  } catch (error: any) {

    logger.error("Failed to complete upload", {
      error: error.message
    });

    sendResponse(res, 400, error.message);
  }
};

export const renameFile = async (req: any, res: Response) => {
  try {
    const userId = (req as any).userId as string;
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
    const userId = (req as any).userId as string;
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

export const getFilePreviewURL = async (req: Request, res: Response) => {
    try {
       const userId = (req as any).userId as string;
       const { fileId } = req.params;
       
        logger.info("Get file preview URL request", {
          userId,
          fileId,
        });

        const url = await fileService.getPreviewSignedURL(fileId, userId);
        logger.info("Preview URL generated successfully", {
          userId,
          fileId,
        });
        sendResponse(res, HttpStatus.OK, "Preview URL Generated", { url });

    } catch (error) {

      logger.warn("Failed to generate preview URL", {
        userId: req.userId,
        fileId: req.params?.fileId,
        error: (error as any).message,
      });
      
      sendResponse(res, HttpStatus.BAD_REQUEST, (error as any).message);      
    }
};

