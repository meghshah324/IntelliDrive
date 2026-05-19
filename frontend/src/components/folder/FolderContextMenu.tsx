import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const MENU_WIDTH = 192; // matches w-48
const MENU_OFFSET = 6;

/**
 * Per-folder kebab menu rendered into a portal so it escapes any `overflow:hidden`
 * / `overflow:auto` ancestor and never gets clipped by the scroll container.
 */
export default function FolderContextMenu({
  onRename,
  onDelete,
  onPreview,
  onDownload,
  onToggleStar,
  isStarred,
}: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Compute position relative to the viewport (the menu uses position: fixed).
  const positionMenu = () => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    // Estimate menu height (5 items + divider). Real height is measured after mount.
    const estimatedH = menuRef.current?.offsetHeight ?? 280;

    // Default: open below-right of the button.
    let top = rect.bottom + MENU_OFFSET;
    if (top + estimatedH > viewportH - 8) {
      // Not enough space below — open above.
      top = Math.max(8, rect.top - MENU_OFFSET - estimatedH);
    }

    // Right-align under the trigger.
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    if (left + MENU_WIDTH > viewportW - 8) left = viewportW - MENU_WIDTH - 8;

    setCoords({ top, left });
  };

  useLayoutEffect(() => {
    if (open) positionMenu();
  }, [open]);

  // Re-measure after the menu mounts (so we know its real height).
  useLayoutEffect(() => {
    if (open && menuRef.current) positionMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScrollOrResize = () => positionMenu();

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  const menu =
    open && coords
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
            className="fixed z-50 rounded-xl bg-white p-1 shadow-lg ring-1 ring-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem
              icon={<Eye className="h-4 w-4" />}
              label="Preview"
              disabled={!onPreview}
              onClick={() => {
                onPreview?.();
                close();
              }}
            />
            <MenuItem
              icon={<Download className="h-4 w-4" />}
              label="Download"
              disabled={!onDownload}
              onClick={() => {
                onDownload?.();
                close();
              }}
            />
            <MenuItem
              icon={<Pencil className="h-4 w-4" />}
              label="Rename"
              onClick={() => {
                onRename();
                close();
              }}
            />
            <MenuItem
              icon={
                <Star
                  className={[
                    "h-4 w-4",
                    isStarred ? "fill-amber-400 text-amber-500" : "",
                  ].join(" ")}
                />
              }
              label={isStarred ? "Remove from Starred" : "Add to Starred"}
              disabled={!onToggleStar}
              onClick={() => {
                onToggleStar?.();
                close();
              }}
            />

            <div className="my-1 h-px bg-slate-100" />

            <MenuItem
              icon={<Trash2 className="h-4 w-4" />}
              label="Delete"
              danger
              onClick={() => {
                onDelete();
                close();
              }}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
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
      {menu}
    </>
  );
}

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

