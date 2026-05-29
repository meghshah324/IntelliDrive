import { useCallback, useEffect, useRef, useState } from "react";
import { starService } from "../services/starService";
import { fileService } from "../services/fileService";
import { folderService } from "../services/folderService";
import type { DriveNode, FileNode, FolderNode } from "../types/drive";

export type StarredStatus = "idle" | "loading" | "ready" | "error";

export interface UseStarred {
  items: DriveNode[];
  folders: FolderNode[];
  files: FileNode[];
  status: StarredStatus;
  error: string | null;

  refresh: () => Promise<void>;

  toggleStar: (node: DriveNode) => Promise<void>;
  rename: (node: DriveNode, newName: string) => Promise<void>;
  remove: (node: DriveNode) => Promise<void>;
  preview: (file: FileNode) => Promise<string>;
  download: (file: FileNode) => Promise<void>;
}

/**
 * Owns the starred-items list and the actions that mutate it.
 *
 * Mirrors the shape of `useRecentFiles` so the Starred view can reuse the same
 * `FileTable` / `FolderTable` components and feel identical to the explorer.
 */
export function useStarred(): UseStarred {
  const [items, setItems] = useState<DriveNode[]>([]);
  const [status, setStatus] = useState<StarredStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const seq = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++seq.current;
    setStatus("loading");
    setError(null);
    try {
      const data = await starService.list();
      if (id !== seq.current) return;
      // The backend already marks isStarred:true, but enforce defensively.
      setItems(data.map((n) => ({ ...n, isStarred: true })));
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

  const toggleStar = useCallback(async (node: DriveNode) => {
    const wasStarred = node.isStarred ?? true;
    // Optimistically remove from the list when unstarring.
    if (wasStarred) {
      const snapshot = items;
      setItems((prev) => prev.filter((n) => n.id !== node.id));
      try {
        await starService.unstar(node.id);
      } catch (err) {
        setItems(snapshot);
        throw err;
      }
    } else {
      try {
        await starService.star(node.id);
        await refresh();
      } catch (err) {
        throw err;
      }
    }
  }, [items, refresh]);

  const rename = useCallback(
    async (node: DriveNode, newName: string) => {
      const snapshot = items;
      setItems((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, name: newName } : n)),
      );
      try {
        if (node.type === "FILE") await fileService.rename(node.id, newName);
        else await folderService.rename(node.id, newName);
        await refresh();
      } catch (err) {
        setItems(snapshot);
        throw err;
      }
    },
    [items, refresh],
  );

  const remove = useCallback(
    async (node: DriveNode) => {
      const snapshot = items;
      setItems((prev) => prev.filter((n) => n.id !== node.id));
      try {
        if (node.type === "FILE") await fileService.remove(node.id);
        else await folderService.remove(node.id);
      } catch (err) {
        setItems(snapshot);
        throw err;
      }
    },
    [items],
  );

  const preview = useCallback(async (file: FileNode) => {
    return fileService.getPreviewUrl(file.id);
  }, []);

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
  }, []);

  const folders = items.filter((n): n is FolderNode => n.type === "FOLDER");
  const files = items.filter((n): n is FileNode => n.type === "FILE");

  return {
    items,
    folders,
    files,
    status,
    error,
    refresh,
    toggleStar,
    rename,
    remove,
    preview,
    download,
  };
}
