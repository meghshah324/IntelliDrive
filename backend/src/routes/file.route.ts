import { Router } from "express";
import {
  generateUploadURL,
  startMultipartUpload,
  getMultipartPresignedUrls,
  completeMultipartUpload,
  confirmUpload,
  renameFile,
  deleteFile,
} from "../controller/file.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/upload-url", authMiddleware, generateUploadURL);
router.post("/confirm-upload", authMiddleware, confirmUpload);
// router.patch("/:fileId/rename", authMiddleware, renameFile);
// router.delete("/:fileId", authMiddleware, deleteFile);

router.post("/upload/start", authMiddleware, startMultipartUpload);

router.post("/upload/parts", authMiddleware, getMultipartPresignedUrls);

router.post("/upload/complete", authMiddleware, completeMultipartUpload);

router.post("/confirm-upload", authMiddleware, confirmUpload);

router.patch("/:fileId/rename", authMiddleware, renameFile);

router.delete("/:fileId", authMiddleware, deleteFile);

export default router;
