import { useState } from "react";
import { AlertTriangle, Clock3, Loader2 } from "lucide-react";
import { useRecentFiles } from "../../hooks/useRecentFiles";
import RecentTable from "./RecentTable";
import RenameFileModal from "../file/RenameFileModal";
import DeleteFileModal from "../file/DeleteFileModal";
import type { FileNode } from "../../types/drive";

export default function RecentContent() {
  const { files, status, error, refresh, rename, remove, preview, download } =
    useRecentFiles();

  const [renameTarget, setRenameTarget] = useState<FileNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileNode | null>(null);

  const handlePreview = async (f: FileNode) => {
    try {
      const url = await preview(f.id);
      window.open(url, "_blank", "noopener");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to open preview");
    }
  };

  const handleDownload = async (f: FileNode) => {
    try {
      await download(f);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to download");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 bg-white/60 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-sm">
            <Clock3 className="h-3.5 w-3.5" />
          </span>
          Recent files
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          Refresh
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6">
        {status === "loading" && (
          <div className="flex h-full items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Loading recent files…
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" /> Could not load recent files
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

        {status === "ready" && files.length === 0 && (
          <div className="mx-auto mt-16 max-w-sm rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm backdrop-blur">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-md shadow-indigo-200">
              <Clock3 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No recent files yet
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Files you preview or download will show up here.
            </p>
          </div>
        )}

        {status === "ready" && files.length > 0 && (
          <RecentTable
            files={files}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onRename={setRenameTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <RenameFileModal
        open={!!renameTarget}
        file={renameTarget}
        onClose={() => setRenameTarget(null)}
        onSubmit={(id, newName) => rename(id, newName)}
      />
      <DeleteFileModal
        open={!!deleteTarget}
        file={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(id) => remove(id)}
      />
    </div>
  );
}
