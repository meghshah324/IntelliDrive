import { Router } from "express";
import { AuthController } from "../controller/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/register", (req, res) => authController.register(req, res));
authRouter.post("/login", (req, res) => authController.login(req, res));
authRouter.post("/logout", (req, res) => authController.logout(req, res));
authRouter.get("/me", authMiddleware, (req, res) => authController.me(req, res));

export default authRouter;