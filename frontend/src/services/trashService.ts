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
 * Backend exposes soft-deleted nodes via /api/trash. The list endpoint only
 * returns the *top-level* trashed items (a child of a trashed folder is
 * surfaced via its parent) so folder structure is preserved visually.
 */
export const trashService = {
  async list(): Promise<DriveNode[]> {
    try {
      const res = await api.get<ApiEnvelope<DriveNode[]>>("/trash");
      return res.data.data ?? [];
    } catch (err) {
      throw toError(err, "Failed to load trash");
    }
  },

  async restore(nodeId: string): Promise<void> {
    try {
      await api.post<ApiEnvelope>(`/trash/${nodeId}/restore`);
    } catch (err) {
      throw toError(err, "Failed to restore item");
    }
  },

  async permanentDelete(nodeId: string): Promise<void> {
    try {
      await api.delete<ApiEnvelope>(`/trash/${nodeId}`);
    } catch (err) {
      throw toError(err, "Failed to permanently delete item");
    }
  },

  async empty(): Promise<void> {
    try {
      await api.delete<ApiEnvelope>("/trash/empty");
    } catch (err) {
      throw toError(err, "Failed to empty trash");
    }
  },
};
