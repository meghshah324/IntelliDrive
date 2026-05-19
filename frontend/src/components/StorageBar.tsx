import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUploads } from "../context/UploadContext";

type StorageBarProps = {
  /** Override the bytes used (otherwise read from the authenticated user). */
  usedBytes?: number;
  /** Override the byte quota (otherwise read from the authenticated user). */
  totalBytes?: number;
};

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;
const TB = GB * 1024;

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes >= TB) return `${(bytes / TB).toFixed(1)} TB`;
  if (bytes >= GB) return `${(bytes / GB).toFixed(1)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatPercent(pct: number): string {
  if (pct <= 0) return "0%";
  if (pct < 0.1) return "<0.1%";
  if (pct < 1) return `${pct.toFixed(1)}%`;
  if (pct < 10) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}

export default function StorageBar({ usedBytes, totalBytes }: StorageBarProps) {
  const { user, refresh } = useAuth();
  const { onCompleted } = useUploads();

  // Keep the bar in sync after uploads finish, without forcing a reload.
  useEffect(() => {
    const unsubscribe = onCompleted(() => {
      void refresh();
    });
    return unsubscribe;
  }, [onCompleted, refresh]);

  const used = usedBytes ?? user?.usedStorage ?? 0;
  const total = totalBytes ?? user?.storageLimit ?? 0;
  const safeTotal = total <= 0 ? 1 : total;
  const pct = Math.max(0, Math.min(100, (used / safeTotal) * 100));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold tracking-tight text-slate-700">
          Storage
        </span>
        <span className="font-medium text-slate-500">
          {formatBytes(used)} of {formatBytes(total)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
          aria-label="Storage used"
        />
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        {formatPercent(pct)} of your quota used
      </p>
    </div>
  );
}

