import { Request, Response } from "express";
import { recentService } from "../services/RecentService";
import { HttpStatus } from "../constants/httpStatus";
import { sendResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const getRecentFiles = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    logger.info("List recent acess files request", {
      userId,
    });

    const files = await recentService.getRecentFiles(userId);

    logger.info(" recent acess files listed successfully ", {
      userId,
    });
    sendResponse(res, HttpStatus.OK, "Recent Files", files);
  } catch (error: any) {
    logger.error("List recent access file failed", {
      userId: req.userId,
      error: error.message,
    });
    sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
  }
};
