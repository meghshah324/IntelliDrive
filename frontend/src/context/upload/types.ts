/**
 * upload/types.ts
 * ─────────────────────────────────────────────────────────
 * WHY: Single source of truth for all upload-related types.
 * Keeps type definitions decoupled from React or runtime logic
 * so any module can import them without pulling in side-effects.
 */

import type { FileNode } from "../../types/drive";

// ─── Upload status lifecycle ────────────────────────────

export type UploadStatus =
  | "pending"
  | "uploading"
  | "completed"
  | "failed"
  | "cancelled";

// ─── Individual upload item ─────────────────────────────

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

// ─── Public context API shape ───────────────────────────

export interface UploadContextValue {
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
