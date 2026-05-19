export interface GenerateUploadOptions {
  key: string;
  contentType: string;
}

export interface GenerateDownloadOptions {
  key: string;
}

export interface StorageService {
  generateUploadURL(options: GenerateUploadOptions): Promise<string>;
  generateDownloadURL(options: GenerateDownloadOptions): Promise<string>;
  deleteFile(key: string): Promise<void>;

  startMultipartUpload(
    options: GenerateUploadOptions,
  ): Promise<{ uploadId: string }>;

  getPartUploadUrl(options: {
    key: string;
    uploadId: string;
    partNumber: number;
  }): Promise<string>;

  completeMultipartUpload(options: {
    key: string;
    uploadId: string;
    parts: { ETag: string; PartNumber: number }[];
  }): Promise<void>;

  abortMultipartUpload(options: {
    key: string;
    uploadId: string;
  }): Promise<void>;

  getPreviewSignedURL(key: string): Promise<string>;
}
