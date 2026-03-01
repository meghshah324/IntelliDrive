import { Router} from "express";
import { AuthController } from "../controller/auth.controller.js";

const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

export default authRouter;