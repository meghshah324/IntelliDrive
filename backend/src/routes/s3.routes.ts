import { Router, Request, Response } from "express";
import { storageService  } from "../services/storage/index";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/upload-url", async (req: Request, res: Response) => {
  const { fileName, fileType } = req.body;

  const key = `users/${uuidv4()}-${fileName}`;

  const url = await storageService.generateUploadURL({
    key,
    contentType: fileType,
  });

  res.json({ uploadUrl: url, key });
});

router.get("/download-url", async (req: Request, res: Response) => {
  const { key } = req.query;

  if (!key || typeof key !== "string") {
    return res.status(400).json({ message: "Key is required" });
  }

  const url = await storageService.generateDownloadURL({ key });

  res.json({ downloadUrl: url });
});

export default router;