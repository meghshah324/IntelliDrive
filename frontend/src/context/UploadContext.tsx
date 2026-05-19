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
import { uploadFileMultipart } from "../utils/uploadEngine";
import type { FileNode } from "../types/drive";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "completed"
  | "failed"
  | "cancelled";

export interface UploadItem {
  id: string;
  file: File;
  displayName: string;
  parentId: string | null;
  status: UploadStatus;
  loadedBytes: number;
  totalBytes: number;
  /** Bytes per second over the last sample window. */
  speed: number;
  startedAt: number | null;
  error: string | null;
  /** Resulting persisted file node (only on success). */
  node: FileNode | null;
}

interface UploadContextValue {
  items: UploadItem[];
  /** Active = pending or uploading. */
  hasActive: boolean;
  enqueue: (files: File[], parentId: string | null) => void;
  cancel: (id: string) => void;
  retry: (id: string) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
  /** Subscribe to "an upload completed" — caller refreshes its list. */
  onCompleted: (cb: (node: FileNode) => void) => () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

const FILE_CONCURRENCY = 2;

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

interface ProviderProps {
  children: ReactNode;
}

export function UploadProvider({ children }: ProviderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);

  // Mutable refs for the scheduler — avoids stale-closure bugs.
  const itemsRef = useRef<UploadItem[]>([]);
  itemsRef.current = items;
  const controllers = useRef(new Map<string, AbortController>());
  const completedListeners = useRef(new Set<(n: FileNode) => void>());
  const activeCount = useRef(0);
  // For speed calc: last sample per item.
  const speedSample = useRef(
    new Map<string, { bytes: number; ts: number }>(),
  );

  const update = useCallback(
    (id: string, patch: Partial<UploadItem>) => {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
    },
    [],
  );

  const runOne = useCallback(
    async (id: string) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item) return;

      activeCount.current++;
      const controller = new AbortController();
      controllers.current.set(id, controller);

      update(id, {
        status: "uploading",
        startedAt: Date.now(),
        error: null,
        loadedBytes: 0,
        speed: 0,
      });
      speedSample.current.set(id, { bytes: 0, ts: Date.now() });

      try {
        const node = await uploadFileMultipart({
          file: item.file,
          displayName: item.displayName,
          parentId: item.parentId,
          signal: controller.signal,
          onProgress: (loaded) => {
            const now = Date.now();
            const prev = speedSample.current.get(id);
            let speed = 0;
            if (prev && now - prev.ts > 250) {
              speed = ((loaded - prev.bytes) / (now - prev.ts)) * 1000;
              speedSample.current.set(id, { bytes: loaded, ts: now });
            } else if (!prev) {
              speedSample.current.set(id, { bytes: loaded, ts: now });
            } else {
              speed = item.speed;
            }
            update(id, { loadedBytes: loaded, speed });
          },
        });

        update(id, {
          status: "completed",
          loadedBytes: item.totalBytes,
          speed: 0,
          node,
        });
        completedListeners.current.forEach((cb) => {
          try {
            cb(node);
          } catch {
            /* ignore listener errors */
          }
        });
      } catch (err) {
        if (controller.signal.aborted) {
          update(id, { status: "cancelled", speed: 0 });
        } else {
          update(id, {
            status: "failed",
            speed: 0,
            error: err instanceof Error ? err.message : "Upload failed",
          });
        }
      } finally {
        controllers.current.delete(id);
        speedSample.current.delete(id);
        activeCount.current--;
        // Drain queue.
        scheduleNext();
      }
    },
    // scheduleNext is defined below; we rely on the ref pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [update],
  );

  const scheduleNext = useCallback(() => {
    while (activeCount.current < FILE_CONCURRENCY) {
      const next = itemsRef.current.find((i) => i.status === "pending");
      if (!next) return;
      // Mark uploading synchronously to prevent double-pickup.
      itemsRef.current = itemsRef.current.map((it) =>
        it.id === next.id ? { ...it, status: "uploading" } : it,
      );
      setItems(itemsRef.current);
      runOne(next.id);
    }
  }, [runOne]);

  // Whenever items change (e.g. new enqueue or retry), try to schedule.
  useEffect(() => {
    scheduleNext();
  }, [items, scheduleNext]);

  const enqueue = useCallback(
    (files: File[], parentId: string | null) => {
      if (files.length === 0) return;
      const newItems: UploadItem[] = files.map((file) => {
        const rel = (file as File & { webkitRelativePath?: string })
          .webkitRelativePath;
        return {
          id: newId(),
          file,
          displayName: rel && rel.length > 0 ? rel : file.name,
          parentId,
          status: "pending",
          loadedBytes: 0,
          totalBytes: file.size,
          speed: 0,
          startedAt: null,
          error: null,
          node: null,
        };
      });
      setItems((prev) => [...prev, ...newItems]);
    },
    [],
  );

  const cancel = useCallback((id: string) => {
    const ctrl = controllers.current.get(id);
    if (ctrl) {
      ctrl.abort();
    } else {
      // Pending — just mark cancelled.
      setItems((prev) =>
        prev.map((it) =>
          it.id === id && it.status === "pending"
            ? { ...it, status: "cancelled" }
            : it,
        ),
      );
    }
  }, []);

  const retry = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id && (it.status === "failed" || it.status === "cancelled")
          ? {
              ...it,
              status: "pending",
              error: null,
              loadedBytes: 0,
              speed: 0,
            }
          : it,
      ),
    );
  }, []);

  const remove = useCallback(
    (id: string) => {
      // Cancel running upload first if needed.
      controllers.current.get(id)?.abort();
      setItems((prev) => prev.filter((it) => it.id !== id));
    },
    [],
  );

  const clearCompleted = useCallback(() => {
    setItems((prev) =>
      prev.filter(
        (it) =>
          it.status !== "completed" &&
          it.status !== "cancelled" &&
          it.status !== "failed",
      ),
    );
  }, []);

  const onCompleted = useCallback((cb: (node: FileNode) => void) => {
    completedListeners.current.add(cb);
    return () => {
      completedListeners.current.delete(cb);
    };
  }, []);

  const hasActive = useMemo(
    () => items.some((i) => i.status === "pending" || i.status === "uploading"),
    [items],
  );

  // Warn the user if they navigate away while uploads are running.
  useEffect(() => {
    if (!hasActive) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasActive]);

  const value: UploadContextValue = useMemo(
    () => ({
      items,
      hasActive,
      enqueue,
      cancel,
      retry,
      remove,
      clearCompleted,
      onCompleted,
    }),
    [items, hasActive, enqueue, cancel, retry, remove, clearCompleted, onCompleted],
  );

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}

export function useUploads() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploads must be used inside <UploadProvider>");
  return ctx;
}
