/**
 * upload/scheduler.ts
 * ─────────────────────────────────────────────────────────
 * WHY: Encapsulates the concurrency-limited upload execution
 * logic (scheduling, running, aborting) outside of React.
 * This makes the scheduling algorithm testable in isolation
 * and removes mutable-ref complexity from the context.
 */

import { uploadFileMultipart } from "../../utils/uploadEngine";
import { SpeedTracker } from "./speedTracker";
import type { UploadItem } from "./types";
import type { FileNode } from "../../types/drive";

const FILE_CONCURRENCY = 2;

export type ItemUpdater = (id: string, patch: Partial<UploadItem>) => void;
export type ItemsGetter = () => UploadItem[];
export type ItemsSetter = (items: UploadItem[]) => void;
export type CompletionCallback = (node: FileNode) => void;

export class UploadScheduler {
  private controllers = new Map<string, AbortController>();
  private activeCount = 0;
  private speedTracker = new SpeedTracker();
  private completionListeners = new Set<CompletionCallback>();

  // Injected dependencies — set once by the provider.

  //store React's function inside scheduler
  private getItems!: ItemsGetter;
  private setItems!: ItemsSetter;
  private updateItem!: ItemUpdater;

  /**
   * Wire up the scheduler to the React state layer.
   * Called once during provider mount.
   */
  connect(deps: {
    getItems: ItemsGetter;
    setItems: ItemsSetter;
    updateItem: ItemUpdater;
  }): void {
    this.getItems = deps.getItems;
    this.setItems = deps.setItems;
    this.updateItem = deps.updateItem;
  }

  // ─── Public API ───────────────────────────────────────

  schedule(): void {
    while (this.activeCount < FILE_CONCURRENCY) {
      const items = this.getItems();
      const next = items.find((i) => i.status === "pending");
      if (!next) return;

      // Mark uploading synchronously to prevent double-pickup.
      const updated = items.map((it) =>
        it.id === next.id ? { ...it, status: "uploading" as const } : it,
      );
      this.setItems(updated);
      this.runOne(next.id);
    }
  }

  abort(id: string): void {
    const ctrl = this.controllers.get(id);
    if (ctrl) ctrl.abort();
  }

  isRunning(id: string): boolean {
    return this.controllers.has(id);
  }

  /** Subscribe to upload completions. Returns unsubscribe function. */
  onCompleted(cb: CompletionCallback): () => void {
    this.completionListeners.add(cb);
    return () => {
      this.completionListeners.delete(cb);
    };
  }

  // ─── Internal ─────────────────────────────────────────

  private async runOne(id: string): Promise<void> {
    const item = this.getItems().find((i) => i.id === id);
    if (!item) return;

    this.activeCount++;
    const controller = new AbortController();
    this.controllers.set(id, controller);

    this.updateItem(id, {
      status: "uploading",
      startedAt: Date.now(),
      error: null,
      loadedBytes: 0,
      speed: 0,
    });
    this.speedTracker.reset(id);

    try {
      const node = await uploadFileMultipart({
        file: item.file,
        displayName: item.displayName,
        parentId: item.parentId,
        signal: controller.signal,
        onProgress: (loaded) => {
          const current = this.getItems().find((i) => i.id === id);
          const speed = this.speedTracker.calculate(
            id,
            loaded,
            current?.speed ?? 0,
          );
          this.updateItem(id, { loadedBytes: loaded, speed });
        },
      });

      this.updateItem(id, {
        status: "completed",
        loadedBytes: item.totalBytes,
        speed: 0,
        node,
      });
      this.notifyCompleted(node);
    } catch (err) {
      if (controller.signal.aborted) {
        this.updateItem(id, { status: "cancelled", speed: 0 });
      } else {
        this.updateItem(id, {
          status: "failed",
          speed: 0,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    } finally {
      this.controllers.delete(id);
      this.speedTracker.reset(id);
      this.activeCount--;
      this.schedule();
    }
  }

  private notifyCompleted(node: FileNode): void {
    this.completionListeners.forEach((cb) => {
      try {
        cb(node);
      } catch {
        /* ignore listener errors */
      }
    });
  }
}

/** Singleton scheduler instance shared across the app. */
export const uploadScheduler = new UploadScheduler();
