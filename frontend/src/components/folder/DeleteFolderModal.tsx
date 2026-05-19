import { useState } from "react";
import Modal from "../ui/Modal";
import { useFolder } from "../../context/FolderContext";
import type { FolderNode } from "../../types/drive";

interface Props {
  open: boolean;
  folder: FolderNode | null;
  onClose: () => void;
  /**
   * Optional override. When provided, this is called instead of the default
   * `useFolder().deleteFolder`. Lets non-explorer views (e.g. Starred) reuse
   * the same UI while owning their own state.
   */
  onConfirm?: (folderId: string) => Promise<void>;
}

export default function DeleteFolderModal({ open, folder, onClose, onConfirm }: Props) {
  const { deleteFolder } = useFolder();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!folder) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (onConfirm) {
        await onConfirm(folder.id);
      } else {
        await deleteFolder(folder.id);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Move folder to trash?">
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{folder.name}</span> and everything
          inside it will be moved to Trash. You can restore it later from the Trash page.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Moving…" : "Move to trash"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
