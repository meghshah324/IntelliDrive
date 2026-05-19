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

/**
 * Backend stores recent file ids in a Redis sorted set
 * (`recent:files:${userId}`) and hydrates them via Prisma. The endpoint
 * returns the nodes already ordered by most-recent-first.
 */
export const recentService = {
  async list(): Promise<FileNode[]> {
    try {
      const res = await api.get<ApiEnvelope<FileNode[]>>("/recent-files");
      // Defensive: only surface FILE nodes — folders should never land in
      // the recent set, but the backend returns whatever Prisma finds.
      return (res.data.data ?? []).filter(
        (n): n is FileNode => n?.type === "FILE",
      );
    } catch (err) {
      throw toError(err, "Failed to load recent files");
    }
  },
};
