import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { folderService, nodeService } from "../services/folderService";
import { fileService } from "../services/fileService";
import { starService } from "../services/starService";
import type {
  BreadcrumbItem,
  DriveNode,
  FileNode,
  FolderNode,
} from "../types/drive";

type Status = "idle" | "loading" | "ready" | "error";

interface FolderContextValue {
  currentFolderId: string | null;
  items: DriveNode[];
  folders: FolderNode[];
  files: FileNode[];
  breadcrumbs: BreadcrumbItem[];
  status: Status;
  error: string | null;

  navigateTo: (folder: { id: string | null; name: string }) => void;
  goUp: () => void;
  refresh: () => Promise<void>;

  createFolder: (name: string) => Promise<FolderNode>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;

  renameFile: (fileId: string, newName: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  previewFile: (fileId: string) => Promise<string>;
  downloadFile: (file: FileNode) => Promise<void>;

  toggleStar: (node: DriveNode) => Promise<void>;
}

const FolderContext = createContext<FolderContextValue | null>(null);

const ROOT_CRUMB: BreadcrumbItem = { id: null, name: "My Drive" };

interface ProviderProps {
  children: ReactNode;
  /** Optional folderId driven by the URL. */
  folderId?: string | null;
  /** Called when navigation should update the URL. */
  onNavigate?: (folderId: string | null) => void;
}

export function FolderProvider({
  children,
  folderId = null,
  onNavigate,
}: ProviderProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    folderId,
  );
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    ROOT_CRUMB,
  ]);
  const [items, setItems] = useState<DriveNode[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Track the latest fetch so stale responses cannot overwrite fresher data.
  const fetchSeq = useRef(0);

  // Keep internal state in sync with the URL-driven folderId.
  useEffect(() => {
    setCurrentFolderId(folderId);
  }, [folderId]);

  const load = useCallback(async (id: string | null) => {
    const seq = ++fetchSeq.current;
    setStatus("loading");
    setError(null);
    try {
      const data = await nodeService.list(id);
      if (seq !== fetchSeq.current) return; // ignore stale
      setItems(data);
      setStatus("ready");
    } catch (err) {
      if (seq !== fetchSeq.current) return;
      setError(err instanceof Error ? err.message : "Failed to load");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load(currentFolderId);
  }, [currentFolderId, load]);

  const navigateTo = useCallback(
    (folder: { id: string | null; name: string }) => {
      setBreadcrumbs((prev) => {
        // If clicking a crumb already in the trail, truncate to it.
        const idx = prev.findIndex((c) => c.id === folder.id);
        if (idx >= 0) return prev.slice(0, idx + 1);
        // Otherwise append.
        return [...prev, { id: folder.id, name: folder.name }];
      });
      setCurrentFolderId(folder.id);
      onNavigate?.(folder.id);
    },
    [onNavigate],
  );

  const goUp = useCallback(() => {
    setBreadcrumbs((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      const last = next[next.length - 1];
      setCurrentFolderId(last.id);
      onNavigate?.(last.id);
      return next;
    });
  }, [onNavigate]);

  const refresh = useCallback(
    () => load(currentFolderId),
    [load, currentFolderId],
  );

  const createFolder = useCallback(
    async (name: string) => {
      const folder = await folderService.create(name, currentFolderId);
      // Optimistic-ish: just append; server is source of truth.
      setItems((prev) => [folder, ...prev]);
      return folder;
    },
    [currentFolderId],
  );

  const renameFolder = useCallback(
    async (folderId: string, newName: string) => {
      // Optimistic update with rollback on failure.
      setItems((prev) =>
        prev.map((n) => (n.id === folderId ? { ...n, name: newName } : n)),
      );
      try {
        await folderService.rename(folderId, newName);
        // Sync with server in case other fields changed (updatedAt, etc.).
        await refresh();
      } catch (err) {
        await refresh();
        throw err;
      }
    },
    [refresh],
  );

  const deleteFolder = useCallback(
    async (folderId: string) => {
      const snapshot = items;
      setItems((prev) => prev.filter((n) => n.id !== folderId));
      try {
        await folderService.remove(folderId);
      } catch (err) {
        setItems(snapshot);
        throw err;
      }
    },
    [items],
  );

  // ---------- File actions ----------
  const renameFile = useCallback(
    async (fileId: string, newName: string) => {
      setItems((prev) =>
        prev.map((n) => (n.id === fileId ? { ...n, name: newName } : n)),
      );
      try {
        await fileService.rename(fileId, newName);
        await refresh();
      } catch (err) {
        await refresh();
        throw err;
      }
    },
    [refresh],
  );

  const deleteFile = useCallback(
    async (fileId: string) => {
      const snapshot = items;
      setItems((prev) => prev.filter((n) => n.id !== fileId));
      try {
        await fileService.remove(fileId);
      } catch (err) {
        setItems(snapshot);
        throw err;
      }
    },
    [items],
  );

  const previewFile = useCallback(
    (fileId: string) => fileService.getPreviewUrl(fileId),
    [],
  );

  const downloadFile = useCallback(async (file: FileNode) => {
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

  /**
   * Optimistically flip `isStarred` and call the API; on failure roll back.
   */
  const toggleStar = useCallback(async (node: DriveNode) => {
    const next = !node.isStarred;
    setItems((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, isStarred: next } : n)),
    );
    try {
      if (next) await starService.star(node.id);
      else await starService.unstar(node.id);
    } catch (err) {
      // Roll back on failure.
      setItems((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, isStarred: !next } : n)),
      );
      throw err;
    }
  }, []);

  const folders = useMemo(
    () => items.filter((item) => item.type === "FOLDER") as FolderNode[],
    [items],
  );

  const files = useMemo(
    () => items.filter((item) => item.type === "FILE") as FileNode[],
    [items],
  );

  const value: FolderContextValue = useMemo(
    () => ({
      currentFolderId,
      items,
      folders,
      files,
      breadcrumbs,
      status,
      error,
      navigateTo,
      goUp,
      refresh,
      createFolder,
      renameFolder,
      deleteFolder,
      renameFile,
      deleteFile,
      previewFile,
      downloadFile,
      toggleStar,
    }),
    [
      currentFolderId,
      items,
      folders,
      files,
      breadcrumbs,
      status,
      error,
      navigateTo,
      goUp,
      refresh,
      createFolder,
      renameFolder,
      deleteFolder,
      renameFile,
      deleteFile,
      previewFile,
      downloadFile,
      toggleStar,
    ],
  );

  return (
    <FolderContext.Provider value={value}>{children}</FolderContext.Provider>
  );
}

export function useFolder() {
  const ctx = useContext(FolderContext);
  if (!ctx) throw new Error("useFolder must be used inside <FolderProvider>");
  return ctx;
}
