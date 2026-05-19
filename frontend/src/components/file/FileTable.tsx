import { useState } from "react";
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  File as FileIcon,
  Star,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import type { FileNode } from "../../types/drive";
import FolderContextMenu from "../folder/FolderContextMenu";

interface Props {
  files: FileNode[];
  onRename: (file: FileNode) => void;
  onDelete: (file: FileNode) => void;
  onPreview: (file: FileNode) => void;
  onDownload: (file: FileNode) => void;
  onToggleStar?: (file: FileNode) => void;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const fmtBytes = (n: number | null | undefined) => {
  if (!n) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
};

const iconFor = (mime: string | null | undefined): ComponentType<LucideProps> => {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("image/")) return FileImage;
  if (m.startsWith("video/")) return FileVideo;
  if (m.startsWith("audio/")) return FileAudio;
  if (m.includes("zip") || m.includes("tar") || m.includes("rar")) return FileArchive;
  if (m.includes("sheet") || m.includes("csv") || m.includes("excel"))
    return FileSpreadsheet;
  if (
    m.includes("javascript") ||
    m.includes("typescript") ||
    m.includes("json") ||
    m.includes("xml") ||
    m.includes("html")
  )
    return FileCode;
  if (m.startsWith("text/") || m.includes("pdf") || m.includes("document"))
    return FileText;
  return FileIcon;
};

export default function FileTable({
  files,
  onRename,
  onDelete,
  onPreview,
  onDownload,
  onToggleStar,
}: Props) {
  const [busyPreviewId, setBusyPreviewId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="hidden grid-cols-[1fr_120px_180px_40px_40px] items-center gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid">
        <span>Name</span>
        <span>Size</span>
        <span>Modified</span>
        <span className="sr-only">Star</span>
        <span className="sr-only">Actions</span>
      </div>

      <ul role="list" className="divide-y divide-slate-100">
        {files.map((f) => {
          const Icon = iconFor(f.mimeType);
          return (
            <li
              key={f.id}
              className="group grid grid-cols-[1fr_40px_40px] items-center gap-4 px-5 py-3 transition hover:bg-slate-50 md:grid-cols-[1fr_120px_180px_40px_40px]"
              onDoubleClick={async () => {
                setBusyPreviewId(f.id);
                try {
                  await onPreview(f);
                } finally {
                  setBusyPreviewId(null);
                }
              }}
            >
              <button
                type="button"
                onClick={async () => {
                  setBusyPreviewId(f.id);
                  try {
                    await onPreview(f);
                  } finally {
                    setBusyPreviewId(null);
                  }
                }}
                className="flex min-w-0 items-center gap-3 text-left"
                aria-label={`Preview ${f.name}`}
                disabled={busyPreviewId === f.id}
              >
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-50 ring-1 ring-indigo-100 transition group-hover:from-indigo-200 group-hover:to-blue-100">
                  <Icon className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {f.name}
                  </div>
                  <div className="truncate text-xs text-slate-500 md:hidden">
                    {fmtBytes(f.size)} • {fmtDate(f.updatedAt)}
                  </div>
                </div>
              </button>

              <div className="hidden text-sm text-slate-600 md:block">
                {fmtBytes(f.size)}
              </div>
              <div className="hidden text-sm text-slate-600 md:block">
                {fmtDate(f.updatedAt)}
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

              <div
                className="flex justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                <FolderContextMenu
                  onRename={() => onRename(f)}
                  onDelete={() => onDelete(f)}
                  onPreview={() => onPreview(f)}
                  onDownload={() => onDownload(f)}
                  onToggleStar={onToggleStar ? () => onToggleStar(f) : undefined}
                  isStarred={!!f.isStarred}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
