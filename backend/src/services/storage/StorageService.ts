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
}
