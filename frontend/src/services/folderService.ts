import axios from "axios";
import { api } from "./api";
import type { ApiEnvelope } from "./api";
import type { DriveNode, FolderNode } from "../types/drive";

const toError = (err: unknown, fallback: string): Error => {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as ApiEnvelope | undefined)?.message;
    return new Error(msg || err.message || fallback);
  }
  return err instanceof Error ? err : new Error(fallback);
};

export const folderService = {
  async create(name: string, parentId: string | null): Promise<FolderNode> {
    try {
      const res = await api.post<ApiEnvelope<FolderNode>>("/folders", {
        name,
        parentId,
      });
      return res.data.data as FolderNode;
    } catch (err) {
      throw toError(err, "Failed to create folder");
    }
  },

  async rename(folderId: string, newName: string): Promise<FolderNode> {
    try {
      const res = await api.patch<ApiEnvelope<FolderNode>>(
        `/folders/${folderId}/rename`,
        { newName },
      );
      return res.data.data as FolderNode;
    } catch (err) {
      throw toError(err, "Failed to rename folder");
    }
  },

  async remove(folderId: string): Promise<void> {
    try {
      await api.delete<ApiEnvelope>(`/folders/${folderId}`);
    } catch (err) {
      throw toError(err, "Failed to delete folder");
    }
  },
};

export const nodeService = {
  /**
   * List children of a folder. Pass `null` to list root-level items.
   */
  async list(parentId: string | null): Promise<DriveNode[]> {
    try {
      const res = await api.get<ApiEnvelope<DriveNode[]>>("/nodes", {
        params: parentId ? { parentId } : {},
      });
      return res.data.data ?? [];
    } catch (err) {
      throw toError(err, "Failed to load folder contents");
    }
  },

  async search(q: string): Promise<DriveNode[]> {
    try {
      const res = await api.get<ApiEnvelope<DriveNode[]>>("/nodes/search", {
        params: { q },
      });
      return res.data.data ?? [];
    } catch (err) {
      throw toError(err, "Search failed");
    }
  },
};
