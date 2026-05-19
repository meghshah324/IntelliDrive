import axios from "axios";
import { api } from "./api";
import type { ApiEnvelope } from "./api";
import type { DriveNode } from "../types/drive";

const toError = (err: unknown, fallback: string): Error => {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as ApiEnvelope | undefined)?.message;
    return new Error(msg || err.message || fallback);
  }
  return err instanceof Error ? err : new Error(fallback);
};

/**
 * Backend keeps starred nodes in a `Star` table with a unique
 * (userId, nodeId) index. The list endpoint returns the full Node payloads
 * (files and folders), each annotated with `isStarred: true`.
 */
export const starService = {
  async list(): Promise<DriveNode[]> {
    try {
      const res = await api.get<ApiEnvelope<DriveNode[]>>("/stars");
      return res.data.data ?? [];
    } catch (err) {
      throw toError(err, "Failed to load starred items");
    }
  },

  async star(nodeId: string): Promise<void> {
    try {
      await api.post<ApiEnvelope>(`/stars/${nodeId}`);
    } catch (err) {
      throw toError(err, "Failed to star item");
    }
  },

  async unstar(nodeId: string): Promise<void> {
    try {
      await api.delete<ApiEnvelope>(`/stars/${nodeId}`);
    } catch (err) {
      throw toError(err, "Failed to unstar item");
    }
  },
};
