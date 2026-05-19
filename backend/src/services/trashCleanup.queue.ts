import { Queue } from "bullmq";
import { redisClient } from "../config/redis";

export const TRASH_CLEANUP_QUEUE_NAME = "trash-cleanup";

export const trashCleanupQueue = new Queue(TRASH_CLEANUP_QUEUE_NAME, {
  connection: redisClient,
});
