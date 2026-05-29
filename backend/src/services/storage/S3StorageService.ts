import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CompleteMultipartUploadCommand,
  UploadPartCommand,
  CreateMultipartUploadCommand,
  AbortMultipartUploadCommand,
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
      expiresIn: 60 * 60,
    });
  }

  async generateDownloadURL(options: GenerateDownloadOptions): Promise<string> {
    const { key } = options;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60,
    });
  }

  async startMultipartUpload(options: GenerateUploadOptions) : Promise<{ uploadId: string }> {
    const { key, contentType } = options;

    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const response = await s3Client.send(command);

    if (!response.UploadId) {
      throw new Error("S3 did not return an UploadId");
    }

    return {
      uploadId: response.UploadId
    };
  }

  async getPartUploadUrl(options: {
    key: string;
    uploadId: string;
    partNumber: number;
  }) : Promise<string> {
    const { key, uploadId, partNumber } = options;

    const command = new UploadPartCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    return getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60 * 2,
    });
  }

  async completeMultipartUpload(options: {
    key: string;
    uploadId: string;
    parts: { ETag: string; PartNumber: number }[];
  }) : Promise<void> {
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

  async abortMultipartUpload(options: { key: string; uploadId: string }) : Promise<void> {
    const { key, uploadId } = options;
    try {
      logger.info(`Aborting multipart upload for key: ${key}`);
      const command = new AbortMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
      });
      await s3Client.send(command);
      logger.info(`Multipart upload aborted for key: ${key}`);
    } catch (err) {
      logger.warn(`Failed to abort multipart upload for ${key}`, err);
    }
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

  async getPreviewSignedURL(key : string) : Promise<string> {
        const command = new GetObjectCommand({
           Bucket : this.bucketName,
           Key : key,
           ResponseContentDisposition : "inline",
        });

        return await getSignedUrl(s3Client, command, {
          expiresIn : 60 * 60, // 1 hour
        });
  }

  async getDownloadSignedURL(key: string, filename: string): Promise<string> {
    const safeName = filename.replace(/"/g, "");
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeName}"`,
    });

    return await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60, 
    });
  }
}
