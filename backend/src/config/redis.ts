import { createClient } from "redis";
import { logger } from "../utils/logger";

export const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error" , {
     error : err.message,
     stack : err.stack
  })
});

redisClient.on("connect", () => {
  logger.info("Redis client connected");
});


export async function connectRedis() {
  try {
    await redisClient.connect();
    logger.info("Connected to Redis successfully");
  } catch (error: any) {
    logger.error("Failed to connect to Redis", {
      error: error.message,
      stack: error.stack,
    });
  }
}