import { Router } from "express";
import {
  generateUploadURL,
  confirmUpload,
  renameFile,
  deleteFile,
} from "../controller/file.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/upload-url", authMiddleware, generateUploadURL);
router.post("/confirm-upload", authMiddleware, confirmUpload);
router.patch("/:fileId/rename", authMiddleware, renameFile);
router.delete("/:fileId", authMiddleware, deleteFile);

export default router;
