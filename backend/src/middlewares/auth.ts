import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/apiResponse.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { logger } from "../utils/logger.js";

export interface AuthRequest extends Request {
  userId?: string;
}

const COOKIE_NAME = "token";

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Prefer HTTP-only cookie; fall back to Authorization header for tooling.
  const cookieToken = (req as any).cookies?.[COOKIE_NAME] as string | undefined;
  const headerToken = req.headers.authorization?.split(" ")[1];
  const token = cookieToken || headerToken;

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

    next();
  } catch (err: any) {
    logger.warn("Invalid token", {
      path: req.originalUrl,
      error: err.message,
    });

    return sendResponse(res, HttpStatus.UNAUTHORIZED, "Invalid Token");
  }
};

