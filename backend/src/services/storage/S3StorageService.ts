import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CompleteMultipartUploadCommand,
  UploadPartCommand,
  CreateMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../config/s3";
import {
  StorageService,
  GenerateDownloadOptions,
  GenerateUploadOptions,
} from "./StorageService";
import { logger } from "../../utils/logger";

export class S3StorageService implements StorageService {
  private bucketName: string;

  constructor() {
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error("AWS_BUCKET_NAME is missing");
    }

    this.bucketName = process.env.AWS_BUCKET_NAME;
  }

  async generateUploadURL(options: GenerateUploadOptions): Promise<string> {
    const { key, contentType } = options;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(s3Client, command, {
      expiresIn: 320,
    });
  }

  async generateDownloadURL(options: GenerateDownloadOptions): Promise<string> {
    const { key } = options;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(s3Client, command, {
      expiresIn: 320,
    });
  }

  async startMultipartUpload(options: GenerateUploadOptions) {
    const { key, contentType } = options;

    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const response = await s3Client.send(command);

    return {
      uploadId: response.UploadId,
    };
  }

  async getPartUploadUrl(options: {
    key: string;
    uploadId: string;
    partNumber: number;
  }) {
    const { key, uploadId, partNumber } = options;

    const command = new UploadPartCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    return getSignedUrl(s3Client, command, {
      expiresIn: 320,
    });
  }

  async completeMultipartUpload(options: {
    key: string;
    uploadId: string;
    parts: { ETag: string; PartNumber: number }[];
  }) {
    const { key, uploadId, parts } = options;

    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    });

    await s3Client.send(command);
  }

  async deleteFile(key: string): Promise<void> {
    try {
      logger.info(`Deleting file from S3: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await s3Client.send(command);
      logger.info(`File deleted successfully: ${key}`);
    } catch (err: unknown) {
      logger.error(`S3 delete failed for key: ${key}`, err);
      throw new Error("Failed to delete file from S3");
    }
  }
}
