import { useState } from "react";
import { AlertTriangle, Loader2, Star } from "lucide-react";
import { useStarred } from "../../hooks/useStarred";
import { useFolder } from "../../context/FolderContext";
import FolderTable from "../folder/FolderTable";
import FileTable from "../file/FileTable";
import RenameFileModal from "../file/RenameFileModal";
import DeleteFileModal from "../file/DeleteFileModal";
import RenameFolderModal from "../folder/RenameFolderModal";
import DeleteFolderModal from "../folder/DeleteFolderModal";
import type { FileNode, FolderNode } from "../../types/drive";

/**
 * Dedicated "Starred" view — lists all starred files & folders for the user.
 * Reuses the standard `FileTable` / `FolderTable` so the look-and-feel matches
 * the explorer exactly. Opening a folder navigates into the regular explorer.
 */
export default function StarredContent() {
  const {
    folders,
    files,
    status,
    error,
    refresh,
    toggleStar,
    rename,
    remove,
    preview,
    download,
  } = useStarred();
  const { navigateTo } = useFolder();

  const [renameFileTarget, setRenameFileTarget] = useState<FileNode | null>(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState<FileNode | null>(null);
  const [renameFolderTarget, setRenameFolderTarget] = useState<FolderNode | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<FolderNode | null>(null);

  const isEmpty = folders.length === 0 && files.length === 0;

  const handlePreview = async (f: FileNode) => {
    try {
      const url = await preview(f);
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

  const handleToggleStar = async (n: FileNode | FolderNode) => {
    try {
      await toggleStar(n);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update star");
    }
  };

  const openFolder = (f: FolderNode) =>
    navigateTo({ id: f.id, name: f.name });

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 bg-white/60 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm">
            <Star className="h-3.5 w-3.5 fill-white" />
          </span>
          Starred
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
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              Loading starred items…
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" /> Could not load starred items
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
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md shadow-amber-200">
              <Star className="h-5 w-5 fill-white" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No starred items yet
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Star a file or folder to find it quickly here.
            </p>
          </div>
        )}

        {status === "ready" && folders.length > 0 && (
          <section className="mb-6">
            <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Folders
            </h3>
            <FolderTable
              folders={folders}
              onOpen={openFolder}
              onRename={setRenameFolderTarget}
              onDelete={setDeleteFolderTarget}
              onToggleStar={handleToggleStar}
            />
          </section>
        )}

        {status === "ready" && files.length > 0 && (
          <section>
            <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Files
            </h3>
            <FileTable
              files={files}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onRename={setRenameFileTarget}
              onDelete={setDeleteFileTarget}
              onToggleStar={handleToggleStar}
            />
          </section>
        )}
      </div>

      <RenameFileModal
        open={!!renameFileTarget}
        file={renameFileTarget}
        onClose={() => setRenameFileTarget(null)}
        onSubmit={(_, newName) =>
          renameFileTarget ? rename(renameFileTarget, newName) : Promise.resolve()
        }
      />
      <DeleteFileModal
        open={!!deleteFileTarget}
        file={deleteFileTarget}
        onClose={() => setDeleteFileTarget(null)}
        onConfirm={() =>
          deleteFileTarget ? remove(deleteFileTarget) : Promise.resolve()
        }
      />
      <RenameFolderModal
        open={!!renameFolderTarget}
        folder={renameFolderTarget}
        onClose={() => setRenameFolderTarget(null)}
        onSubmit={(_, newName) =>
          renameFolderTarget
            ? rename(renameFolderTarget, newName)
            : Promise.resolve()
        }
      />
      <DeleteFolderModal
        open={!!deleteFolderTarget}
        folder={deleteFolderTarget}
        onClose={() => setDeleteFolderTarget(null)}
        onConfirm={() =>
          deleteFolderTarget ? remove(deleteFolderTarget) : Promise.resolve()
        }
      />
    </div>
  );
}
