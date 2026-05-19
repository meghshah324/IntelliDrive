import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Modal from "../ui/Modal";
import { useFolder } from "../../context/FolderContext";
import type { FolderNode } from "../../types/drive";

interface Props {
  open: boolean;
  folder: FolderNode | null;
  onClose: () => void;
  /**
   * Optional override. When provided, this is called instead of the default
   * `useFolder().renameFolder`. Lets non-explorer views (e.g. Starred) reuse
   * the same UI while owning their own state.
   */
  onSubmit?: (folderId: string, newName: string) => Promise<void>;
}

export default function RenameFolderModal({ open, folder, onClose, onSubmit }: Props) {
  const { renameFolder } = useFolder();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && folder) {
      setName(folder.name);
      setError(null);
    }
  }, [open, folder]);

  if (!folder) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    if (trimmed === folder.name) {
      onClose();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (onSubmit) {
        await onSubmit(folder.id, trimmed);
      } else {
        await renameFolder(folder.id, trimmed);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Rename folder">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        />
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
            type="submit"
            disabled={submitting}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Renaming…" : "Rename"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
