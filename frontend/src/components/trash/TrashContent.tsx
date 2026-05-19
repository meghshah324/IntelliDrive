import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useTrash } from "../../hooks/useTrash";
import TrashTable from "./TrashTable";
import ConfirmModal from "./ConfirmModal";
import type { DriveNode } from "../../types/drive";

/**
 * Dedicated "Trash" view — lists soft-deleted files & folders and offers
 * Restore + Permanent Delete actions. Items removed from Trash skip the
 * recycle bin entirely (storage + DB are purged immediately).
 */
export default function TrashContent() {
  const {
    items,
    status,
    error,
    refresh,
    restore,
    permanentDelete,
    empty,
  } = useTrash();

  const [deleteTarget, setDeleteTarget] = useState<DriveNode | null>(null);
  const [emptyOpen, setEmptyOpen] = useState(false);

  const isEmpty = items.length === 0;

  const handleRestore = async (n: DriveNode) => {
    try {
      await restore(n);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to restore");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 bg-white/60 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-sm">
            <Trash2 className="h-3.5 w-3.5" />
          </span>
          Trash
          <span className="ml-1 text-xs font-normal text-slate-500">
            Items in trash will be auto-deleted after 30 days.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setEmptyOpen(true)}
            disabled={isEmpty || status !== "ready"}
            className="rounded-full border border-red-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Empty trash
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6">
        {status === "loading" && (
          <div className="flex h-full items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              Loading trash…
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" /> Could not load trash
            </div>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-3 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {status === "ready" && isEmpty && (
          <div className="mx-auto mt-16 max-w-sm rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm backdrop-blur">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-md">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Trash is empty
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Items you delete will show up here for 30 days before being
              permanently removed.
            </p>
          </div>
        )}

        {status === "ready" && !isEmpty && (
          <TrashTable
            items={items}
            onRestore={handleRestore}
            onPermanentDelete={setDeleteTarget}
          />
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete forever?"
        destructive
        confirmLabel="Delete forever"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await permanentDelete(deleteTarget);
        }}
        description={
          deleteTarget ? (
            <>
              <span className="font-semibold text-slate-900">
                {deleteTarget.name}
              </span>{" "}
              will be permanently removed
              {deleteTarget.type === "FOLDER"
                ? ", including everything inside it."
                : " from storage."}{" "}
              This action cannot be undone.
            </>
          ) : null
        }
      />

      <ConfirmModal
        open={emptyOpen}
        title="Empty trash?"
        destructive
        confirmLabel="Empty trash"
        onClose={() => setEmptyOpen(false)}
        onConfirm={empty}
        description={
          <>
            All {items.length} item{items.length === 1 ? "" : "s"} in your
            trash will be permanently removed from storage. This action cannot
            be undone.
          </>
        }
      />
    </div>
  );
}
