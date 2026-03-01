import { S3StorageService } from "./S3StorageService";
import { StorageService } from "./StorageService";

export const storageService : StorageService = new S3StorageService();