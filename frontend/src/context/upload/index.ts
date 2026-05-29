/**
 * upload/index.ts
 * ─────────────────────────────────────────────────────────
 * Barrel export — consumers import from "context/upload".
 * Re-exports exactly the same public API as the old monolithic file.
 */

export { UploadProvider, useUploads } from "./UploadProvider";
export type { UploadItem, UploadStatus, UploadContextValue } from "./types";
