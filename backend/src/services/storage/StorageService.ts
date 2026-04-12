export interface GenerateUploadOptions {
  key: string;
  contentType: string;
}

export interface GenerateDownloadOptions {
  key: string;
}

export interface StorageService {
  generateUploadURL(options: GenerateUploadOptions): Promise<String>;
  generateDownloadURL(options: GenerateDownloadOptions): Promise<string>;
  deleteFile(key: string): Promise<void>;


  startMultipartUpload(
    options: GenerateUploadOptions,
  ): Promise<{ uploadId: string | undefined }>;

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
}
