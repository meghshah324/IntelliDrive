import { useEffect, useRef, useState } from "react";
import {
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

interface Props {
  onRename: () => void;
  onDelete: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  onToggleStar?: () => void;
  isStarred?: boolean;
}

/** Per-folder kebab (three-dot) menu with actions like rename, delete, etc. */
export default function FolderContextMenu({
  onRename,
  onDelete,
  onPreview,
  onDownload,
  onToggleStar,
  isStarred,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click or Escape key
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    // Relative container so the absolute menu positions relative to this
    <div ref={wrapRef} className="relative">
      {/* Trigger button (three-dot icon) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Dropdown menu — absolutely positioned below the trigger */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl bg-white p-1 shadow-lg ring-1 ring-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem
            icon={<Eye className="h-4 w-4" />}
            label="Preview"
            disabled={!onPreview}
            onClick={() => { onPreview?.(); close(); }}
          />
          <MenuItem
            icon={<Download className="h-4 w-4" />}
            label="Download"
            disabled={!onDownload}
            onClick={() => { onDownload?.(); close(); }}
          />
          <MenuItem
            icon={<Pencil className="h-4 w-4" />}
            label="Rename"
            onClick={() => { onRename(); close(); }}
          />
          <MenuItem
            icon={
              <Star
                className={`h-4 w-4 ${isStarred ? "fill-amber-400 text-amber-500" : ""}`}
              />
            }
            label={isStarred ? "Remove from Starred" : "Add to Starred"}
            disabled={!onToggleStar}
            onClick={() => { onToggleStar?.(); close(); }}
          />

          <div className="my-1 h-px bg-slate-100" />

          <MenuItem
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete"
            danger
            onClick={() => { onDelete(); close(); }}
          />
        </div>
      )}
    </div>
  );
}

// --- Helper component for each menu item ---

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

function MenuItem({ icon, label, onClick, danger, disabled }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition",
        disabled
          ? "cursor-not-allowed text-slate-400"
          : danger
            ? "text-red-600 hover:bg-red-50"
            : "text-slate-800 hover:bg-slate-100",
      ].join(" ")}
    >
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

