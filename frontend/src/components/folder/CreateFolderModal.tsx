import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Modal from "../ui/Modal";
import { useFolder } from "../../context/FolderContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateFolderModal({ open, onClose }: Props) {
  const { createFolder } = useFolder();
  const [name, setName] = useState("Untitled folder");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("Untitled folder");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createFolder(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New folder">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          placeholder="Folder name"
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
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
