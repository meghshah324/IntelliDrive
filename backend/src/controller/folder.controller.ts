import { Request, Response } from "express";
import { folderService } from "../services/FileItemService/FolderService";
import { sendResponse } from "../utils/apiResponse";
import { HttpStatus } from "../constants/httpStatus";
import { logger } from "../utils/logger";

export const createFolder = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { name, parentId } = req.body;
    logger.info("Create folder request", {
      userId,
      name,
      parentId,
    });

    const folder = await folderService.createFolder(userId, name, parentId);
    logger.info("Folder created successfully", {
      userId,
      folderId: folder?.id,
    });

    sendResponse(
      res,
      HttpStatus.CREATED,
      "Folder Created Successfully",
      folder,
    );
  } catch (error: any) {
    logger.error("Folder creation failed", {
      userId: req.userId,
      name: req.body?.name,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const renameFolder = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { folderId } = req.params;
    const { newName } = req.body;
    logger.info("Rename folder request", {
      userId,
      folderId,
      newName,
    });

    const folder = await folderService.renameFolder(folderId, userId, newName);
    logger.info("Folder renamed successfully", {
      userId,
      folderId,
    });

    sendResponse(res, HttpStatus.CREATED, "Folder Rename Successfully", folder);
  } catch (error: any) {
    logger.warn("Folder rename failed", {
      userId: req.userId,
      folderId: req.params?.folderId,
      error: error.message,
    });

    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const deleteFolder = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { folderId } = req.params;

    logger.info("Delete folder request", {
      userId,
      folderId,
    });

    await folderService.deleteFolder(folderId, userId);
    logger.info("Folder deleted successfully", {
      userId,
      folderId,
    });

    sendResponse(res, HttpStatus.CREATED, "Folder Deleted Successfully");
  } catch (error: any) {
    logger.error("Folder deletion failed", {
      userId: req.userId,
      folderId: req.params?.folderId,
      error: error.message,
    });

    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};
