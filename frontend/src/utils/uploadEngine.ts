import axios from "axios";
import { fileService } from "../services/fileService";
import type { CompletedPart } from "../services/fileService";
import type { FileNode } from "../types/drive";

/** S3 multipart minimum is 5 MB (except the last part). */
export const CHUNK_SIZE = 5 * 1024 * 1024;
/** How many chunks to PUT in parallel for a single file. */
export const PART_CONCURRENCY = 3;
/** Max retry attempts per chunk on transient failure. */
const PART_MAX_RETRIES = 3;

export type ProgressCb = (loadedBytes: number) => void;

export interface UploadEngineParams {
  file: File;
  /** Display name (may include relative path for folder uploads). */
  displayName: string;
  parentId: string | null;
  signal: AbortSignal;
  onProgress: ProgressCb;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Upload a single file using the multipart S3 flow.
 * For small files (<= CHUNK_SIZE) falls back to the single-PUT presigned URL.
 *
 * Pipeline:
 *   1) startMultipart  -> { uploadId, key, fileId }
 *   2) getPartUrls     -> [{ partNumber, url }]
 *   3) PUT each chunk to S3 (parallel, with retry, abortable)
 *   4) completeMultipart with collected ETags
 *   5) confirmUpload   -> persisted FileNode
 */
export async function uploadFileMultipart(
  params: UploadEngineParams,
): Promise<FileNode> {
  const { file, displayName, parentId, signal, onProgress } = params;
  const mimeType = file.type || "application/octet-stream";

  // ---- Small file: single PUT ----
  if (file.size <= CHUNK_SIZE) {
    const presign = await fileService.getSimpleUploadUrl({
      fileName: displayName,
      mimeType,
      size: file.size,
      parentId,
    });

    await axios.put(presign.uploadUrl, file, {
      headers: { "Content-Type": mimeType },
      withCredentials: false,
      signal,
      onUploadProgress: (e) => onProgress(e.loaded),
    });

    return fileService.confirmUpload({
      fileId: presign.fileId,
      name: displayName,
      key: presign.key,
      size: file.size,
      mimeType,
      parentId,
    });
  }

  // ---- Multipart ----
  const session = await fileService.startMultipart({
    fileName: displayName,
    mimeType,
    size: file.size,
    parentId,
  });

  try {
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    const partNumbers = Array.from({ length: totalParts }, (_, i) => i + 1);

    const urls = await fileService.getPartUrls({
      uploadId: session.uploadId,
      key: session.key,
      parts: partNumbers,
    });
    const urlMap = new Map(urls.map((p) => [p.partNumber, p.url]));

    // Track per-part bytes so we can sum into a single overall progress value.
    const partLoaded = new Array<number>(totalParts).fill(0);
    const reportProgress = () => {
      let total = 0;
      for (let i = 0; i < partLoaded.length; i++) total += partLoaded[i];
      onProgress(total);
    };

    const completedParts: CompletedPart[] = new Array(totalParts);

    const uploadOnePart = async (partNumber: number) => {
      const idx = partNumber - 1;
      const partStart = idx * CHUNK_SIZE;
      const partEnd = Math.min(file.size, partStart + CHUNK_SIZE);
      const blob = file.slice(partStart, partEnd);
      const url = urlMap.get(partNumber);
      if (!url) throw new Error(`Missing URL for part ${partNumber}`);

      let attempt = 0;
      // Retry transient failures; abort propagates immediately.
      while (true) {
        try {
          const res = await axios.put(url, blob, {
            headers: { "Content-Type": mimeType },
            withCredentials: false,
            signal,
            onUploadProgress: (e) => {
              partLoaded[idx] = e.loaded;
              reportProgress();
            },
          });

          // ETag is in the response header. Bucket CORS MUST expose it
          // (ExposeHeaders: ["ETag"]) or this will be undefined.
          const etag =
            (res.headers as Record<string, string>)["etag"] ||
            (res.headers as Record<string, string>)["ETag"];
          if (!etag) {
            throw new Error(
              "S3 did not return an ETag header. Add ExposeHeaders: [\"ETag\"] to bucket CORS.",
            );
          }
          completedParts[idx] = {
            PartNumber: partNumber,
            ETag: etag.replace(/^"|"$/g, ""),
          };
          // Snap to full chunk size on success.
          partLoaded[idx] = blob.size;
          reportProgress();
          return;
        } catch (err) {
          if (signal.aborted) throw err;
          attempt++;
          if (attempt > PART_MAX_RETRIES) throw err;
          partLoaded[idx] = 0;
          reportProgress();
          await sleep(500 * attempt);
        }
      }
    };

    // Bounded parallelism: pull from a queue.
    const queue = [...partNumbers];
    const workers: Promise<void>[] = [];
    const runWorker = async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (next === undefined) return;
        await uploadOnePart(next);
      }
    };
    const workerCount = Math.min(PART_CONCURRENCY, totalParts);
    for (let i = 0; i < workerCount; i++) workers.push(runWorker());
    await Promise.all(workers);

    // Complete + confirm.
    await fileService.completeMultipart({
      uploadId: session.uploadId,
      key: session.key,
      parts: completedParts.sort((a, b) => a.PartNumber - b.PartNumber),
    });

    return await fileService.confirmUpload({
      fileId: session.fileId,
      name: displayName,
      key: session.key,
      size: file.size,
      mimeType,
      parentId,
    });
  } catch (err) {
    // Best-effort: free S3 storage held by uploaded parts on cancel/failure.
    fileService.abortMultipart({
      uploadId: session.uploadId,
      key: session.key,
    });
    throw err;
  }
}
