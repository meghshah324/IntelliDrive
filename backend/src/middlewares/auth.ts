import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/apiResponse";
import { HttpStatus } from "../constants/httpStatus";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    logger.warn("Token not provided", {
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    return sendResponse(res, HttpStatus.UNAUTHORIZED, "Token not provided");
  }

  if (!process.env.JWT_SECRET) {
    logger.error("JWT_SECRET is not configured");
    return sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, "Server error");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
    };

    req.userId = decoded.userId;

    logger.info("User authenticated successfully", {
      userId: decoded.userId,
      path: req.originalUrl,
    });

    next();
  } catch (err: any) {
    logger.warn("Invalid token", {
      path: req.originalUrl,
      error: err.message,
    });

    return sendResponse(res, HttpStatus.UNAUTHORIZED, "Invalid Token");
  }
};
