import { useState } from "react";
import Modal from "../ui/Modal";

interface Props {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  /** Set true for destructive confirmations (red button). */
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * Generic confirm dialog used by the Trash page for permanent-delete
 * and empty-trash flows. Handles loading + error state internally.
 */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  onClose,
  onConfirm,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="text-sm text-slate-700">{description}</div>
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
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60",
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-600 hover:bg-indigo-700",
            ].join(" ")}
          >
            {submitting ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
