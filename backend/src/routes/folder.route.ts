import { Router } from "express";
import {
  createFolder,
  renameFolder,
  deleteFolder,
} from "../controller/folder.controller"
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/", authMiddleware, createFolder);
router.patch("/:folderId/rename",authMiddleware , renameFolder);
router.delete("/:folderId",authMiddleware, deleteFolder);

export default router;