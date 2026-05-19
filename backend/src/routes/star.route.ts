import { Router } from "express";
import {
  starNode,
  unstarNode,
  listStarred,
} from "../controller/star.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/", authMiddleware, listStarred);
router.post("/:nodeId", authMiddleware, starNode);
router.delete("/:nodeId", authMiddleware, unstarNode);

export default router;
