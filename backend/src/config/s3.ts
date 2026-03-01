import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { logger } from "../utils/logger";
dotenv.config();

 
if (
  !process.env.AWS_REGION ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY
) {
  logger.error("Missing AWS environment variables")
  process.exit(1); 
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});