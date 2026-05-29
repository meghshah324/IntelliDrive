import { useCallback, useEffect, useRef, useState } from "react";
import { recentService } from "../services/recentService";
import { fileService } from "../services/fileService";
import type { FileNode } from "../types/drive";

export type RecentStatus = "idle" | "loading" | "ready" | "error";

export interface UseRecentFiles {
  files: FileNode[];
  status: RecentStatus;
  error: string | null;

  refresh: () => Promise<void>;

  rename: (fileId: string, newName: string) => Promise<void>;
  remove: (fileId: string) => Promise<void>;
  preview: (fileId: string) => Promise<string>;
  download: (file: FileNode) => Promise<void>;
}

/**
 * Owns the recent-files list and the file actions that mutate it.
 *
 * We do not reuse `useFolder()` here because the recent view is not bound to
 * a single folder — its source of truth is the Redis-backed
 * `/recent-files` endpoint.
 */
export function useRecentFiles(): UseRecentFiles {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [status, setStatus] = useState<RecentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Guard against stale responses overwriting newer ones.
  const seq = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++seq.current;
    setStatus("loading");
    setError(null);
    try {
      const data = await recentService.list();
      if (id !== seq.current) return;
      setFiles(data);
      setStatus("ready");
    } catch (err) {
      if (id !== seq.current) return;
      setError(err instanceof Error ? err.message : "Failed to load");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rename = useCallback(
    async (fileId: string, newName: string) => {
      // Optimistic update with rollback.
      const snapshot = files;
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f)),
      );
      try {
        await fileService.rename(fileId, newName);
        await refresh();
      } catch (err) {
        setFiles(snapshot);
        throw err;
      }
    },
    [files, refresh],
  );

  const remove = useCallback(
    async (fileId: string) => {
      const snapshot = files;
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      try {
        await fileService.remove(fileId);
      } catch (err) {
        setFiles(snapshot);
        throw err;
      }
    },
    [files],
  );

  const preview = useCallback(async (fileId: string) => {
    const url = await fileService.getPreviewUrl(fileId);
    // Backend bumps Redis recency on preview/download → resync after a beat.
    void refresh();
    return url;
  }, [refresh]);

  const download = useCallback(async (file: FileNode) => {
    const url = await fileService.getDownloadUrl(file.id);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.rel = "noopener";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
    void refresh();
  }, [refresh]);

  return { files, status, error, refresh, rename, remove, preview, download };
}
