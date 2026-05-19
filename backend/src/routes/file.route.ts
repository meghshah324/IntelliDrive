import { Router } from "express";
import {
  generateUploadURL,
  startMultipartUpload,
  getMultipartPresignedUrls,
  completeMultipartUpload,
  abortMultipartUpload,
  confirmUpload,
  renameFile,
  deleteFile,
  getFilePreviewURL,
} from "../controller/file.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Single-PUT presign (small files)
router.post("/upload-url", authMiddleware, generateUploadURL);

// Multipart flow
router.post("/upload/start", authMiddleware, startMultipartUpload);
router.post("/upload/parts", authMiddleware, getMultipartPresignedUrls);
router.post("/upload/complete", authMiddleware, completeMultipartUpload);
router.post("/upload/abort", authMiddleware, abortMultipartUpload);

// Persist after S3 upload
router.post("/confirm-upload", authMiddleware, confirmUpload);

// File CRUD
router.patch("/:fileId/rename", authMiddleware, renameFile);
router.delete("/:fileId", authMiddleware, deleteFile);
router.get("/preview/:fileId", authMiddleware, getFilePreviewURL);

export default router;
