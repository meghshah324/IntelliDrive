import { Folder as FolderIcon, Star } from "lucide-react";
import type { FolderNode } from "../../types/drive";
import FolderContextMenu from "./FolderContextMenu";

interface Props {
  folders: FolderNode[];
  onOpen: (folder: FolderNode) => void;
  onRename: (folder: FolderNode) => void;
  onDelete: (folder: FolderNode) => void;
  onToggleStar?: (folder: FolderNode) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/**
 * Clean list/table view for folders. Single column on mobile, three on desktop.
 */
export default function FolderTable({ folders, onOpen, onRename, onDelete, onToggleStar }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Header row (desktop only) */}
      <div className="hidden grid-cols-[1fr_180px_180px_40px_40px] items-center gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid">
        <span>Name</span>
        <span>Modified</span>
        <span>Created</span>
        <span className="sr-only">Star</span>
        <span className="sr-only">Actions</span>
      </div>

      <ul role="list" className="divide-y divide-slate-100">
        {folders.map((f) => (
          <li
            key={f.id}
            className="group grid grid-cols-[1fr_40px_40px] items-center gap-4 px-5 py-3 transition hover:bg-slate-50 md:grid-cols-[1fr_180px_180px_40px_40px]"
            onDoubleClick={() => onOpen(f)}
          >
            <button
              type="button"
              onClick={() => onOpen(f)}
              className="flex min-w-0 items-center gap-3 text-left"
              aria-label={`Open ${f.name}`}
            >
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 ring-1 ring-amber-100 transition group-hover:from-amber-200 group-hover:to-amber-100">
                <FolderIcon className="h-4 w-4 text-amber-700" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-900">
                  {f.name}
                </div>
                <div className="truncate text-xs text-slate-500 md:hidden">
                  {formatDate(f.updatedAt)}
                </div>
              </div>
            </button>

            <div className="hidden text-sm text-slate-600 md:block">
              {formatDate(f.updatedAt)}
            </div>
            <div className="hidden text-sm text-slate-600 md:block">
              {formatDate(f.createdAt)}
            </div>

            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onToggleStar?.(f)}
                disabled={!onToggleStar}
                title={f.isStarred ? "Remove from Starred" : "Add to Starred"}
                aria-label={f.isStarred ? "Unstar" : "Star"}
                aria-pressed={!!f.isStarred}
                className={[
                  "rounded-full p-1.5 transition",
                  f.isStarred
                    ? "text-amber-500 hover:bg-amber-50"
                    : "text-slate-400 hover:bg-slate-100 hover:text-amber-500",
                  onToggleStar ? "" : "cursor-not-allowed opacity-60",
                ].join(" ")}
              >
                <Star
                  className={[
                    "h-4 w-4",
                    f.isStarred ? "fill-amber-400" : "",
                  ].join(" ")}
                />
              </button>
            </div>

            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <FolderContextMenu
                onRename={() => onRename(f)}
                onDelete={() => onDelete(f)}
                onToggleStar={onToggleStar ? () => onToggleStar(f) : undefined}
                isStarred={!!f.isStarred}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
