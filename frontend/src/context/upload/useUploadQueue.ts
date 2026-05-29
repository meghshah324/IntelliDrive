/**
 * upload/useUploadQueue.ts
 * ─────────────────────────────────────────────────────────
 * WHY: Owns all React state for the upload queue (items list,
 * add/remove/retry mutations) and wires the scheduler to state.
 * Keeps the context provider thin — just exposing the value.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uploadScheduler } from "./scheduler";
import type { UploadItem, UploadContextValue } from "./types";
import type { FileNode } from "../../types/drive";

// ─── Helpers ────────────────────────────────────────────

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// ─── Hook ───────────────────────────────────────────────

export function useUploadQueue(): UploadContextValue {
  const [items, setItems] = useState<UploadItem[]>([]);

  // Mutable ref so the scheduler always reads fresh state.
  const itemsRef = useRef<UploadItem[]>([]);
  itemsRef.current = items;

  // Wire scheduler ↔ React state (once on mount).
  useEffect(() => {
    uploadScheduler.connect({
      getItems: () => itemsRef.current,
      setItems: (next) => {
        itemsRef.current = next;
        setItems(next);
      },
      updateItem: (id, patch) => {
        // Update the ref synchronously so the scheduler always reads fresh
        // state. Mutating the ref inside a functional setState updater would
        // defer the write until React flushes, letting schedule()'s full-array
        // replace clobber a just-completed item back to "uploading".
        const next = itemsRef.current.map((it) =>
          it.id === id ? { ...it, ...patch } : it,
        );
        itemsRef.current = next;
        setItems(next);
      },
    });
  }, []);

  // Trigger scheduler whenever items change.
  useEffect(() => {
    uploadScheduler.schedule();
  }, [items]);

  // ─── Actions ────────────────────────────────────────

  const enqueue = useCallback((files: File[], parentId: string | null) => {
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
  }, []);

  const cancel = useCallback((id: string) => {
    if (uploadScheduler.isRunning(id)) {
      uploadScheduler.abort(id);
    } else {
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
          ? { ...it, status: "pending", error: null, loadedBytes: 0, speed: 0 }
          : it,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    uploadScheduler.abort(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

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
    return uploadScheduler.onCompleted(cb);
  }, []);

  // ─── Derived state ────────────────────────────────────

  const hasActive = useMemo(
    () => items.some((i) => i.status === "pending" || i.status === "uploading"),
    [items],
  );

  // ─── Browser unload protection ────────────────────────

  useEffect(() => {
    if (!hasActive) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasActive]);

  // ─── Context value ────────────────────────────────────

  return useMemo(
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
}
