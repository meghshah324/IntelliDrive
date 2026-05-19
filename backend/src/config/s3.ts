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
  // AWS SDK v3 (>=3.729) injects x-amz-sdk-checksum-* headers into presigned
  // URLs by default. Browsers don't send those headers, so S3 returns 403
  // SignatureDoesNotMatch (or fails CORS preflight). Disable default checksums
  // for presigned PUT / UploadPart so the browser request matches the signature.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});