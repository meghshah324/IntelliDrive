import type { Request, Response, CookieOptions } from "express";
import { AuthService } from "../services/AuthService.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import type { AuthRequest } from "../middlewares/auth.js";

const authService = new AuthService();

const COOKIE_NAME = "token";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: ONE_DAY_MS,
  path: "/",
};

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!email || !password || !name) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Name, email and password are required",
        );
      }

      logger.info("Register request received", { email });

      const registeredUser = await authService.register({ name, email, password });

      logger.info("User registered successfully", {
        email,
        userId: registeredUser?.id,
      });

      return sendResponse(
        res,
        HttpStatus.CREATED,
        "User registered successfully",
        registeredUser,
      );
    } catch (error: any) {
      logger.error("User registration failed", {
        email: req.body?.email,
        error: error.message,
      });

      return sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          "Email and password are required",
        );
      }

      logger.info("Login request received", { email });

      const { token, user } = await authService.login(email, password);

      res.cookie(COOKIE_NAME, token, cookieOptions);

      logger.info("Login successful", { email, userId: user.id });

      return sendResponse(res, HttpStatus.OK, "Login successful", { user });
    } catch (error: any) {
      logger.warn("Login failed", {
        email: req.body?.email,
        error: error.message,
      });

      return sendResponse(res, HttpStatus.UNAUTHORIZED, error.message);
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    return sendResponse(res, HttpStatus.OK, "Logged out successfully");
  }

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return sendResponse(res, HttpStatus.UNAUTHORIZED, "Not authenticated");
      }

      const user = await authService.getById(req.userId);

      if (!user) {
        return sendResponse(res, HttpStatus.UNAUTHORIZED, "User not found");
      }

      return sendResponse(res, HttpStatus.OK, "Current user", { user });
    } catch (error: any) {
      logger.error("Failed to fetch current user", { error: error.message });
      return sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Failed to fetch user",
      );
    }
  }
}

