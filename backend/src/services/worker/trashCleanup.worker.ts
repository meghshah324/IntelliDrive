import { TRASH_CLEANUP_QUEUE_NAME } from "../trashCleanup.queue";
import { Worker } from "bullmq";
import { redisClient } from "../../config/redis";
import { trashService } from "../FileItemService/TrashService";
import { logger } from "../../utils/logger";

console.log("WORKER STARTED");

export const trashCleanupWorker = new Worker(
  TRASH_CLEANUP_QUEUE_NAME,
  async (job) => {
    try {
        const { userId, nodeId} = job.data;
        console.log(`Processing trash cleanup for user ${userId} and node ${nodeId}`);
        // Permanently delete the file/folder  from storage
        await trashService.permanentDelete(nodeId, userId);

        logger.info(`Successfully cleaned up trash for user ${userId} and node ${nodeId}`);

    } catch (error) {
        logger.error("Error in trash cleanup worker", {
            error: (error as Error).message,
        });
        throw error;
    }
  },
  {
    connection: redisClient,
  },
);
