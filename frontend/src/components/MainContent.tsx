import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useFolder } from "../context/FolderContext";
import { useUploads } from "../context/UploadContext";
import Breadcrumbs from "./folder/Breadcrumbs";
import FolderTable from "./folder/FolderTable";
import EmptyState from "./folder/EmptyState";
import CreateFolderModal from "./folder/CreateFolderModal";
import RenameFolderModal from "./folder/RenameFolderModal";
import DeleteFolderModal from "./folder/DeleteFolderModal";
import FileTable from "./file/FileTable";
import RenameFileModal from "./file/RenameFileModal";
import DeleteFileModal from "./file/DeleteFileModal";
import CreateDropdown from "./CreateDropdown";
import type { FileNode, FolderNode } from "../types/drive";

export default function MainContent() {
  const {
    folders,
    files,
    status,
    error,
    navigateTo,
    refresh,
    previewFile,
    downloadFile,
    toggleStar,
  } = useFolder();
  const { onCompleted } = useUploads();

  const [createOpen, setCreateOpen] = useState(false);
  const [renameFolderTarget, setRenameFolderTarget] = useState<FolderNode | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<FolderNode | null>(null);
  const [renameFileTarget, setRenameFileTarget] = useState<FileNode | null>(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState<FileNode | null>(null);

  const openFolder = (f: FolderNode) => navigateTo({ id: f.id, name: f.name });

  // Refresh listing whenever a queued upload finishes.
  useEffect(() => onCompleted(() => refresh()), [onCompleted, refresh]);

  const handlePreview = async (f: FileNode) => {
    try {
      const url = await previewFile(f.id);
      window.open(url, "_blank", "noopener");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to open preview");
    }
  };

  const handleDownload = async (f: FileNode) => {
    try {
      await downloadFile(f);
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

  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar: breadcrumbs + Create dropdown.
          NOTE: `relative z-20` is required so the CreateDropdown menu (which
          overflows downward into the content area) paints ABOVE the content
          div below it. Without it, the empty-state / table div renders on top
          and silently swallows clicks on the dropdown items. */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 bg-white/60 px-4 py-3 backdrop-blur sm:px-6">
        <Breadcrumbs />
        <CreateDropdown onCreateFolder={() => setCreateOpen(true)} />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6">
        {status === "loading" && (
          <div className="flex h-full items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Loading your files…
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" /> Could not load folder
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
          <EmptyState onCreateFolder={() => setCreateOpen(true)} />
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
              onRename={setRenameFileTarget}
              onDelete={setDeleteFileTarget}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onToggleStar={handleToggleStar}
            />
          </section>
        )}
      </div>

      <CreateFolderModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <RenameFolderModal
        open={!!renameFolderTarget}
        folder={renameFolderTarget}
        onClose={() => setRenameFolderTarget(null)}
      />
      <DeleteFolderModal
        open={!!deleteFolderTarget}
        folder={deleteFolderTarget}
        onClose={() => setDeleteFolderTarget(null)}
      />
      <RenameFileModal
        open={!!renameFileTarget}
        file={renameFileTarget}
        onClose={() => setRenameFileTarget(null)}
      />
      <DeleteFileModal
        open={!!deleteFileTarget}
        file={deleteFileTarget}
        onClose={() => setDeleteFileTarget(null)}
      />
    </div>
  );
}



