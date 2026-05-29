import axios from "axios";
import { api } from "./api";
import type { ApiEnvelope } from "./api";
import type { FileNode } from "../types/drive";

const toError = (err: unknown, fallback: string): Error => {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as ApiEnvelope | undefined)?.message;
    return new Error(msg || err.message || fallback);
  }
  return err instanceof Error ? err : new Error(fallback);
};

// ---------- Single PUT (small files) ----------
export interface PresignSingle {
  uploadUrl: string;
  key: string;
  fileId: string;
}

// ---------- Multipart ----------
export interface MultipartStart {
  uploadId: string;
  key: string;
  fileId: string;
}

export interface MultipartPartUrl {
  partNumber: number;
  url: string;
}

export interface CompletedPart {
  PartNumber: number;
  ETag: string;
}

export const fileService = {
  // ----- Simple single-PUT presign (kept for tiny files / fallback) -----
  async getSimpleUploadUrl(params: {
    fileName: string;
    mimeType: string;
    size: number;
    parentId: string | null;
  }): Promise<PresignSingle> {
    try {
      const res = await api.post<ApiEnvelope<PresignSingle>>(
        "/files/upload-url",
        params,
      );
      return res.data.data as PresignSingle;
    } catch (err) {
      throw toError(err, "Failed to get upload URL");
    }
  },

  // ----- Multipart -----
  async startMultipart(params: {
    fileName: string;
    mimeType: string;
    size: number;
    parentId: string | null;
  }): Promise<MultipartStart> {
    try {
      const res = await api.post<ApiEnvelope<MultipartStart>>(
        "/files/upload/start",
        params,
      );
      return res.data.data as MultipartStart;
    } catch (err) {
      throw toError(err, "Failed to start multipart upload");
    }
  },

  async getPartUrls(params: {
    uploadId: string;
    key: string;
    parts: number[];
  }): Promise<MultipartPartUrl[]> {
    try {
      const res = await api.post<ApiEnvelope<MultipartPartUrl[]>>(
        "/files/upload/parts",
        params,
      );
      return res.data.data ?? [];
    } catch (err) {
      throw toError(err, "Failed to get part URLs");
    }
  },

  async completeMultipart(params: {
    uploadId: string;
    key: string;
    parts: CompletedPart[];
  }): Promise<void> {
    try {
      await api.post<ApiEnvelope>("/files/upload/complete", params);
    } catch (err) {
      throw toError(err, "Failed to complete multipart upload");
    }
  },

  async abortMultipart(params: { uploadId: string; key: string }): Promise<void> {
    try {
      await api.post<ApiEnvelope>("/files/upload/abort", params);
    } catch {
      // Best-effort cleanup; ignore failures so the user-facing cancel always succeeds.
    }
  },

  async confirmUpload(params: {
    fileId: string;
    name: string;
    key: string;
    size: number;
    mimeType: string;
    parentId: string | null;
  }): Promise<FileNode> {
    try {
      const res = await api.post<ApiEnvelope<FileNode>>(
        "/files/confirm-upload",
        params,
      );
      return res.data.data as FileNode;
    } catch (err) {
      throw toError(err, "Failed to confirm upload");
    }
  },

  // ----- File CRUD -----
  async rename(fileId: string, newName: string): Promise<FileNode> {
    try {
      const res = await api.patch<ApiEnvelope<FileNode>>(
        `/files/${fileId}/rename`,
        { newName },
      );
      return res.data.data as FileNode;
    } catch (err) {
      throw toError(err, "Failed to rename file");
    }
  },

  async remove(fileId: string): Promise<void> {
    try {
      await api.delete<ApiEnvelope>(`/files/${fileId}`);
    } catch (err) {
      throw toError(err, "Failed to delete file");
    }
  },

  async getPreviewUrl(fileId: string): Promise<string> {
    try {
      const res = await api.get<ApiEnvelope<{ url: string }>>(
        `/files/preview/${fileId}`,
      );
      const url = res.data.data?.url;
      if (!url) throw new Error("No preview URL returned");
      return url;
    } catch (err) {
      throw toError(err, "Failed to get preview URL");
    }
  },

  async getDownloadUrl(fileId: string): Promise<string> {
    try {
      const res = await api.get<ApiEnvelope<{ url: string }>>(
        `/files/download/${fileId}`,
      );
      const url = res.data.data?.url;
      if (!url) throw new Error("No download URL returned");
      return url;
    } catch (err) {
      throw toError(err, "Failed to get download URL");
    }
  },
};
