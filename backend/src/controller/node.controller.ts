import { Response } from "express";
import { nodeService } from "../services/FileItemService/NodeService";
import { HttpStatus } from "../constants/httpStatus";
import { sendResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const listFolderContents = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { parentId } = req.query;
    logger.info("List folder contents request", {
      userId,
      parentId,
    });

    const items = await nodeService.listFolderContents(
      userId,
      parentId as string,
    );

    logger.info("Folder contents listed successfully", {
      userId,
      parentId,
      itemCount: items?.length ?? 0,
    });

    sendResponse(res, HttpStatus.OK, "Listed Folder and File", items);
  } catch (error: any) {
    logger.error("List folder contents failed", {
      userId: req.userId,
      parentId: req.query?.parentId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const searchNodes = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { q } = req.query;

    logger.info("Search nodes request", {
      userId,
      query: q,
    });

    const result = await nodeService.searchNodes(userId, q as string);

    logger.info("Search completed successfully", {
      userId,
      query: q,
      resultCount: result?.length ?? 0,
    });

    sendResponse(res, HttpStatus.OK, "Listed Folder and File", result);
  } catch (error: any) {
    logger.error("Search nodes failed", {
      userId: req.userId,
      query: req.query?.q,
      error: error.message,
    });

    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};
