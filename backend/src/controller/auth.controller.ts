import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { AuthService } from "../services/AuthService.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const user = new User(name, email, password);

      logger.info("Login request received", { email: email });

      const registeredUser = await authService.register(user);

      logger.info("User registered successfully", {
        email,
        userId: registeredUser?.id,
      });

      sendResponse(
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

      sendResponse(res, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      logger.info("Login request received", {
        email,
      });

      const result = await authService.login(email, password);
      logger.info("Login successful", {
        email,
        userId: result?.user?.id,
      });

      sendResponse(res, HttpStatus.OK, "Login successful", result);
    } catch (error: any) {
      logger.warn("Login failed", {
        email: req.body?.email,
        error: error.message,
      });

      sendResponse(res, HttpStatus.UNAUTHORIZED, error.message);
    }
  }
}
