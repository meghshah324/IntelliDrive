import { useEffect, useRef, useState } from "react";
import { FileText, Folder, Plus, Upload } from "lucide-react";

type CreateDropdownProps = {
  onCreateFolder?: () => void;
  onUploadFile?: () => void;
  onUploadFolder?: () => void;
};

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-slate-800 transition-all duration-200 hover:bg-slate-100"
    >
      <span className="text-slate-700">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="px-2.5 pb-1 pt-1 text-xs font-semibold text-slate-500">{children}</div>;
}

export default function CreateDropdown({
  onCreateFolder,
  onUploadFile,
  onUploadFolder,
}: CreateDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current && !rootRef.current.contains(target)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create
      </button>

      <div
        role="menu"
        className={[
          "absolute right-0 z-50 mt-2 w-[220px] origin-top-right rounded-lg bg-white p-2 shadow-md ring-1 ring-slate-200 transition-all duration-200",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        ].join(" ")}
      >
        <SectionTitle>Create</SectionTitle>
        <MenuItem
          icon={<Folder className="h-4 w-4" aria-hidden="true" />}
          label="Folder"
          onClick={() => {
            onCreateFolder?.();
            setOpen(false);
          }}
        />

        <div className="my-2 h-px bg-slate-200" />

        <SectionTitle>Upload</SectionTitle>
        <MenuItem
          icon={<FileText className="h-4 w-4" aria-hidden="true" />}
          label="Upload File"
          onClick={() => {
            onUploadFile?.();
            setOpen(false);
          }}
        />
        <MenuItem
          icon={<Upload className="h-4 w-4" aria-hidden="true" />}
          label="Upload Folder"
          onClick={() => {
            onUploadFolder?.();
            setOpen(false);
          }}
        />
      </div>
    </div>
  );
}

