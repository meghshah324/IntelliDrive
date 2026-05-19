import {
  Folder as FolderIcon,
  File as FileIcon,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { DriveNode } from "../../types/drive";

interface Props {
  items: DriveNode[];
  onRestore: (n: DriveNode) => void;
  onPermanentDelete: (n: DriveNode) => void;
}

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const fmtBytes = (n: number | null | undefined) => {
  if (!n) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
};

/**
 * Single combined table for the Trash view. Mirrors the visual rhythm of
 * `FileTable` / `FolderTable` but offers Restore / Delete-forever actions
 * inline rather than the standard preview / rename context menu.
 */
export default function TrashTable({ items, onRestore, onPermanentDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="hidden grid-cols-[1fr_120px_180px_120px] items-center gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid">
        <span>Name</span>
        <span>Size</span>
        <span>Trashed</span>
        <span className="text-right">Actions</span>
      </div>

      <ul role="list" className="divide-y divide-slate-100">
        {items.map((n) => {
          const isFolder = n.type === "FOLDER";
          return (
            <li
              key={n.id}
              className="group grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 transition hover:bg-slate-50 md:grid-cols-[1fr_120px_180px_120px]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={[
                    "flex h-9 w-9 flex-none items-center justify-center rounded-xl ring-1",
                    isFolder
                      ? "bg-gradient-to-br from-amber-100 to-amber-50 ring-amber-100"
                      : "bg-gradient-to-br from-indigo-100 to-blue-50 ring-indigo-100",
                  ].join(" ")}
                >
                  {isFolder ? (
                    <FolderIcon className="h-4 w-4 text-amber-700" />
                  ) : (
                    <FileIcon className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {n.name}
                  </div>
                  <div className="truncate text-xs text-slate-500 md:hidden">
                    {isFolder ? "Folder" : fmtBytes(n.size)} • {fmtDate(n.trashedAt)}
                  </div>
                </div>
              </div>

              <div className="hidden text-sm text-slate-600 md:block">
                {isFolder ? "—" : fmtBytes(n.size)}
              </div>
              <div className="hidden text-sm text-slate-600 md:block">
                {fmtDate(n.trashedAt)}
              </div>

              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => onRestore(n)}
                  title="Restore"
                  aria-label={`Restore ${n.name}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Restore</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPermanentDelete(n)}
                  title="Delete forever"
                  aria-label={`Delete ${n.name} forever`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
