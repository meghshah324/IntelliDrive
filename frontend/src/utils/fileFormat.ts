import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  File as FileIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const fmtBytes = (n: number | null | undefined) => {
  if (!n) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
};

export const iconFor = (
  mime: string | null | undefined,
): ComponentType<LucideProps> => {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("image/")) return FileImage;
  if (m.startsWith("video/")) return FileVideo;
  if (m.startsWith("audio/")) return FileAudio;
  if (m.includes("zip") || m.includes("tar") || m.includes("rar")) return FileArchive;
  if (m.includes("sheet") || m.includes("csv") || m.includes("excel"))
    return FileSpreadsheet;
  if (
    m.includes("javascript") ||
    m.includes("typescript") ||
    m.includes("json") ||
    m.includes("xml") ||
    m.includes("html")
  )
    return FileCode;
  if (m.startsWith("text/") || m.includes("pdf") || m.includes("document"))
    return FileText;
  return FileIcon;
};

/** Coarse human-readable type label derived from the MIME type. */
export const fileTypeLabel = (mime: string | null | undefined): string => {
  const m = (mime || "").toLowerCase();
  if (!m) return "File";
  if (m.startsWith("image/")) return "Image";
  if (m.startsWith("video/")) return "Video";
  if (m.startsWith("audio/")) return "Audio";
  if (m.includes("pdf")) return "PDF";
  if (m.includes("zip") || m.includes("tar") || m.includes("rar")) return "Archive";
  if (m.includes("sheet") || m.includes("csv") || m.includes("excel"))
    return "Spreadsheet";
  if (m.includes("presentation") || m.includes("powerpoint")) return "Presentation";
  if (m.includes("word") || m.includes("document")) return "Document";
  if (m.startsWith("text/")) return "Text";
  return m.split("/")[1]?.toUpperCase() || "File";
};
