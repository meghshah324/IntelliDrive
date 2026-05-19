import { Response } from "express";
import { starService } from "../services/StarService";
import { HttpStatus } from "../constants/httpStatus";
import { sendResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const starNode = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { nodeId } = req.params;

    logger.info("Star node request", { userId, nodeId });

    const star = await starService.star(userId, nodeId);

    sendResponse(res, HttpStatus.CREATED, "Node starred", star);
  } catch (error: any) {
    logger.error("Star node failed", {
      userId: req.userId,
      nodeId: req.params?.nodeId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const unstarNode = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { nodeId } = req.params;

    logger.info("Unstar node request", { userId, nodeId });

    await starService.unstar(userId, nodeId);

    sendResponse(res, HttpStatus.OK, "Node unstarred");
  } catch (error: any) {
    logger.error("Unstar node failed", {
      userId: req.userId,
      nodeId: req.params?.nodeId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};

export const listStarred = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    logger.info("List starred request", { userId });

    const items = await starService.listStarred(userId);

    sendResponse(res, HttpStatus.OK, "Starred items", items);
  } catch (error: any) {
    logger.error("List starred failed", {
      userId: req.userId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};
