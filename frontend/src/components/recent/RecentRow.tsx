import type { FileNode } from "../../types/drive";
import FolderContextMenu from "../folder/FolderContextMenu";
import { fmtBytes, fmtDate, fileTypeLabel, iconFor } from "../../utils/fileFormat";

interface Props {
  file: FileNode;
  onPreview: (f: FileNode) => void;
  onDownload: (f: FileNode) => void;
  onRename: (f: FileNode) => void;
  onDelete: (f: FileNode) => void;
}

export default function RecentRow({
  file,
  onPreview,
  onDownload,
  onRename,
  onDelete,
}: Props) {
  const Icon = iconFor(file.mimeType);
  const type = fileTypeLabel(file.mimeType);

  return (
    <li
      className="group grid grid-cols-[1fr_40px] items-center gap-4 px-5 py-3 transition hover:bg-slate-50 md:grid-cols-[1fr_120px_120px_180px_40px]"
      onDoubleClick={() => onPreview(file)}
    >
      <button
        type="button"
        onClick={() => onPreview(file)}
        className="flex min-w-0 items-center gap-3 text-left"
        aria-label={`Preview ${file.name}`}
      >
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-white">
          <Icon className="h-4 w-4 text-slate-700" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-900">
            {file.name}
          </div>
          <div className="truncate text-xs text-slate-500 md:hidden">
            {type} • {fmtBytes(file.size)} • {fmtDate(file.updatedAt)}
          </div>
        </div>
      </button>

      <div className="hidden text-sm text-slate-600 md:block">{type}</div>
      <div className="hidden text-sm text-slate-600 md:block">
        {fmtBytes(file.size)}
      </div>
      <div className="hidden text-sm text-slate-600 md:block">
        {fmtDate(file.updatedAt)}
      </div>

      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <FolderContextMenu
          onPreview={() => onPreview(file)}
          onDownload={() => onDownload(file)}
          onRename={() => onRename(file)}
          onDelete={() => onDelete(file)}
        />
      </div>
    </li>
  );
}
