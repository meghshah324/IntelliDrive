import { Response } from "express";
import { trashService } from "../services/FileItemService/TrashService";
import { HttpStatus } from "../constants/httpStatus";
import { sendResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const listTrash = async (req: any, res: Response) => {
  try {
    const userId = req.userId as string;
    logger.info("List trash request", { userId });

    const items = await trashService.listTrash(userId);

    sendResponse(res, HttpStatus.OK, "Trash items", items);
  } catch (error: any) {
    logger.error("List trash failed", {
      userId: req.userId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const restoreNode = async (req: any, res: Response) => {
  try {
    const userId = req.userId as string;
    const { nodeId } = req.params;
    logger.info("Restore request", { userId, nodeId });

    const node = await trashService.restore(nodeId, userId);

    sendResponse(res, HttpStatus.OK, "Item restored", node);
  } catch (error: any) {
    logger.warn("Restore failed", {
      userId: req.userId,
      nodeId: req.params?.nodeId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const permanentDelete = async (req: any, res: Response) => {
  try {
    const userId = req.userId as string;
    const { nodeId } = req.params;
    logger.info("Permanent delete request", { userId, nodeId });

    await trashService.permanentDelete(nodeId, userId);

    sendResponse(res, HttpStatus.OK, "Item permanently deleted");
  } catch (error: any) {
    logger.warn("Permanent delete failed", {
      userId: req.userId,
      nodeId: req.params?.nodeId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const emptyTrash = async (req: any, res: Response) => {
  try {
    const userId = req.userId as string;
    logger.info("Empty trash request", { userId });

    await trashService.emptyTrash(userId);

    sendResponse(res, HttpStatus.OK, "Trash emptied");
  } catch (error: any) {
    logger.warn("Empty trash failed", {
      userId: req.userId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};
