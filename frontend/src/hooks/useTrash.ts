import { useCallback, useEffect, useRef, useState } from "react";
import { trashService } from "../services/trashService";
import type { DriveNode, FileNode, FolderNode } from "../types/drive";

export type TrashStatus = "idle" | "loading" | "ready" | "error";

export interface UseTrash {
  items: DriveNode[];
  folders: FolderNode[];
  files: FileNode[];
  status: TrashStatus;
  error: string | null;

  refresh: () => Promise<void>;
  restore: (node: DriveNode) => Promise<void>;
  permanentDelete: (node: DriveNode) => Promise<void>;
  empty: () => Promise<void>;
}

/**
 * Owns the Trash listing and the actions that mutate it.
 * Uses optimistic updates with rollback on failure to keep the UI snappy.
 */
export function useTrash(): UseTrash {
  const [items, setItems] = useState<DriveNode[]>([]);
  const [status, setStatus] = useState<TrashStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const seq = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++seq.current;
    setStatus("loading");
    setError(null);
    try {
      const data = await trashService.list();
      if (id !== seq.current) return;
      setItems(data.map((n) => ({ ...n, isTrashed: true })));
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

  const restore = useCallback(
    async (node: DriveNode) => {
      const snapshot = items;
      setItems((prev) => prev.filter((n) => n.id !== node.id));
      try {
        await trashService.restore(node.id);
      } catch (err) {
        setItems(snapshot);
        throw err;
      }
    },
    [items],
  );

  const permanentDelete = useCallback(
    async (node: DriveNode) => {
      const snapshot = items;
      setItems((prev) => prev.filter((n) => n.id !== node.id));
      try {
        await trashService.permanentDelete(node.id);
      } catch (err) {
        setItems(snapshot);
        throw err;
      }
    },
    [items],
  );

  const empty = useCallback(async () => {
    const snapshot = items;
    setItems([]);
    try {
      await trashService.empty();
    } catch (err) {
      setItems(snapshot);
      throw err;
    }
  }, [items]);

  const folders = items.filter((n): n is FolderNode => n.type === "FOLDER");
  const files = items.filter((n): n is FileNode => n.type === "FILE");

  return {
    items,
    folders,
    files,
    status,
    error,
    refresh,
    restore,
    permanentDelete,
    empty,
  };
}
