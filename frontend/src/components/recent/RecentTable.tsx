import type { FileNode } from "../../types/drive";
import RecentRow from "./RecentRow";

interface Props {
  files: FileNode[];
  onPreview: (f: FileNode) => void;
  onDownload: (f: FileNode) => void;
  onRename: (f: FileNode) => void;
  onDelete: (f: FileNode) => void;
}

export default function RecentTable({
  files,
  onPreview,
  onDownload,
  onRename,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[1fr_120px_120px_180px_40px] items-center gap-4 rounded-t-2xl border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
        <span>Name</span>
        <span>Type</span>
        <span>Size</span>
        <span>Modified</span>
        <span className="sr-only">Actions</span>
      </div>

      <ul role="list" className="divide-y divide-slate-100">
        {files.map((f) => (
          <RecentRow
            key={f.id}
            file={f}
            onPreview={onPreview}
            onDownload={onDownload}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
