import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useUploads } from "../../context/UploadContext";
import type { UploadItem, UploadStatus } from "../../context/UploadContext";

const fmtBytes = (n: number) => {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
};

const fmtSpeed = (bps: number) =>
  bps > 0 ? `${fmtBytes(bps)}/s` : "—";

const statusBadge: Record<UploadStatus, { label: string; cls: string }> = {
  pending: { label: "Queued", cls: "bg-slate-100 text-slate-600" },
  uploading: { label: "Uploading", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Done", cls: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", cls: "bg-slate-200 text-slate-700" },
};

function StatusIcon({ status }: { status: UploadStatus }) {
  switch (status) {
    case "uploading":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 text-slate-500" />;
    default:
      return <Upload className="h-4 w-4 text-slate-500" />;
  }
}

function UploadRow({ item }: { item: UploadItem }) {
  const { cancel, retry, remove } = useUploads();
  const pct = item.totalBytes
    ? Math.min(100, Math.round((item.loadedBytes / item.totalBytes) * 100))
    : 0;
  const badge = statusBadge[item.status];

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <StatusIcon status={item.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-slate-800">
              {item.displayName}
            </span>
            <span
              className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}
            >
              {badge.label}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-300 ${
                item.status === "failed"
                  ? "bg-red-500"
                  : item.status === "completed"
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {fmtBytes(item.loadedBytes)} / {fmtBytes(item.totalBytes)} • {pct}%
            </span>
            <span>
              {item.status === "uploading" ? fmtSpeed(item.speed) : ""}
            </span>
          </div>
          {item.error && (
            <p className="mt-1 truncate text-[11px] text-red-600" title={item.error}>
              {item.error}
            </p>
          )}
        </div>
        <div className="flex flex-none items-center gap-1">
          {(item.status === "failed" || item.status === "cancelled") && (
            <button
              type="button"
              onClick={() => retry(item.id)}
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              title="Retry"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          {(item.status === "pending" || item.status === "uploading") && (
            <button
              type="button"
              onClick={() => cancel(item.id)}
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              title="Cancel"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

/**
 * Floating bottom-right panel that lists every active or recent upload.
 * Hidden when the queue is empty.
 */
export default function UploadDrawer() {
  const { items, clearCompleted } = useUploads();
  const [collapsed, setCollapsed] = useState(false);

  const summary = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.status === "completed").length;
    const active = items.filter(
      (i) => i.status === "uploading" || i.status === "pending",
    ).length;
    return { total, done, active };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex w-[min(92vw,360px)] flex-col">
      <div className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-900/10 ring-1 ring-black/5 backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-sm">
              <Upload className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {summary.active > 0
                ? `Uploading ${summary.active} of ${summary.total}`
                : `${summary.done} of ${summary.total} uploaded`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {summary.active === 0 && (
              <button
                type="button"
                onClick={clearCompleted}
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="rounded-full p-1.5 text-slate-600 transition hover:bg-slate-200"
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {!collapsed && (
          <ul className="max-h-[50vh] divide-y divide-slate-100 overflow-y-auto">
            {items.map((it) => (
              <UploadRow key={it.id} item={it} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
