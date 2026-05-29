import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ChevronDown, FolderPlus, FolderUp, Plus, Upload } from "lucide-react";
import DropdownItem from "./ui/DropdownItem";
import { useFolder } from "../context/FolderContext";
import { useUploads } from "../context/upload";

interface CreateDropdownProps {
  /** Open the existing "New folder" modal. */
  onCreateFolder: () => void;
}

export default function CreateDropdown({ onCreateFolder }: CreateDropdownProps) {
  const { currentFolderId } = useFolder();
  const { enqueue } = useUploads();
  const [open, setOpen] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleFolder = () => {
    setOpen(false);
    onCreateFolder();
  };

  const handlePickFile = () => {
    setOpen(false);
    fileInputRef.current?.click();
  };

  const handlePickFolder = () => {
    setOpen(false);
    folderInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    enqueue(Array.from(files), currentFolderId);
    // Reset so selecting the same file again still fires onChange
    e.target.value = "";
  };

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
      >
        <Plus className="h-4 w-4" />
        Create
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-60 origin-top-right animate-[fadeIn_120ms_ease-out] rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl shadow-slate-900/5 ring-1 ring-black/5 backdrop-blur"
        >
          <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Create
          </div>
          <DropdownItem icon={FolderPlus} label="Folder" onClick={handleFolder} />

          <div className="my-1 h-px bg-slate-100" />

          <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Upload
          </div>
          <DropdownItem
            icon={Upload}
            label="Upload file"
            onClick={handlePickFile}
          />
          <DropdownItem
            icon={FolderUp}
            label="Upload folder"
            onClick={handlePickFolder}
          />
        </div>
      )}

      {/* Hidden file inputs — kept mounted so refs are stable */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
      />
    </div>
  );
}
