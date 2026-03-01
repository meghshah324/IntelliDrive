import { Router } from "express";
import { getRecentFiles } from "../controller/recent.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/",authMiddleware, getRecentFiles);

export default router;