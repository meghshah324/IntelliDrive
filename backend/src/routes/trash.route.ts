import { Router } from "express";
import {
  listTrash,
  restoreNode,
  permanentDelete,
  emptyTrash,
} from "../controller/trash.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/", authMiddleware, listTrash);
router.post("/:nodeId/restore", authMiddleware, restoreNode);
router.delete("/empty", authMiddleware, emptyTrash);
router.delete("/:nodeId", authMiddleware, permanentDelete);

export default router;
