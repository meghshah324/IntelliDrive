import { Router } from "express";
import { listFolderContents, searchNodes } from "../controller/node.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/", authMiddleware, listFolderContents);
router.get("/search", authMiddleware, searchNodes);

export default router;
