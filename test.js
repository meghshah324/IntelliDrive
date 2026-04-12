import fs from "fs";

const BASE = "http://localhost:5000/api/files";
const FILE_PATH = "./Manali.mp4";
const CHUNK_SIZE = 5 * 1024 * 1024;
const CONCURRENCY = 5;
const YOUR_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NGNiZmY2MS03MjYyLTRmNjItOWMwMC0xOTQ1NjdhY2UzZGQiLCJpYXQiOjE3NzM0MjIyNTksImV4cCI6MTc3MzUwODY1OX0.t7Nr_SNu4MyDrK0Z-D8aLlRyXY_zMh6AtDrS90QDHok";
function splitFile(buffer) {
  const chunks = [];
  let start = 0;
  while (start < buffer.length) {
    chunks.push(buffer.slice(start, start + CHUNK_SIZE));
    start += CHUNK_SIZE;
  }
  return chunks;
}

function formatBytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function formatTime(ms) {
  return ms >= 1000 ? (ms / 1000).toFixed(2) + "s" : ms + "ms";
}

async function safeJson(res) {
  const text = await res.text();
  if (!res.ok) throw new Error("HTTP " + res.status + ": " + text);
  return JSON.parse(text);
}

async function uploadWithConcurrency(chunks, urls, concurrency) {
  const uploadedParts = [];
  let index = 0;

  async function uploadNext() {
    if (index >= chunks.length) return;

    const currentIndex = index++;
    const chunkStart = Date.now();

    const res = await fetch(urls[currentIndex].url, {
      method: "PUT",
      body: chunks[currentIndex],
    });

    if (!res.ok) throw new Error("Part " + (currentIndex + 1) + " failed: " + res.status);

    const etag = res.headers.get("ETag");
    const elapsed = formatTime(Date.now() - chunkStart);
    const speed = (
      (chunks[currentIndex].length / (Date.now() - chunkStart)) *
      1000 / (1024 * 1024)
    ).toFixed(2);

    console.log(
      "  Part " + String(currentIndex + 1).padStart(3) + " | " +
      formatBytes(chunks[currentIndex].length) + " | " +
      elapsed + " | ~" + speed + " MB/s"
    );

    uploadedParts[currentIndex] = {
      ETag: etag,
      PartNumber: currentIndex + 1,
    };

    await uploadNext();
  }

  const workers = Array(Math.min(concurrency, chunks.length))
    .fill(null)
    .map(() => uploadNext());

  await Promise.all(workers);
  return uploadedParts;
}

async function run() {
  const totalStart = Date.now();
  const fileBuffer = fs.readFileSync(FILE_PATH);

  console.log("\nFile: " + FILE_PATH);
  console.log("Size: " + formatBytes(fileBuffer.length));
  console.log("Chunk Size: " + formatBytes(CHUNK_SIZE));
  console.log("Concurrency: " + CONCURRENCY + " parallel uploads\n");

  // STEP 1 - START MULTIPART
  let t = Date.now();
  const startRes = await fetch(BASE + "/upload/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + YOUR_TOKEN,
    },
    body: JSON.stringify({
      fileName: "Manali.mp4",
      mimeType: "video/mp4",
      size: fileBuffer.length,
    }),
  });
  const startData = await safeJson(startRes);
  const uploadId = startData.data.uploadId;
  const key = startData.data.key;
  const fileId = startData.data.fileId;
  console.log("[" + formatTime(Date.now() - t) + "] Upload started - uploadId: " + uploadId);

  // STEP 2 - SPLIT FILE
  t = Date.now();
  const chunks = splitFile(fileBuffer);
  console.log("[" + formatTime(Date.now() - t) + "] Split into " + chunks.length + " chunks");

  // STEP 3 - REQUEST PRESIGNED URLS
  t = Date.now();
  const urlRes = await fetch(BASE + "/upload/parts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + YOUR_TOKEN,
    },
    body: JSON.stringify({
      uploadId,
      key,
      parts: chunks.map((_, i) => i + 1),
    }),
  });
  const urlData = await safeJson(urlRes);
  const urls = urlData.data;
  console.log("[" + formatTime(Date.now() - t) + "] Got " + urls.length + " presigned URLs");

  // STEP 4 - CONCURRENT UPLOAD
  console.log("\nUploading " + chunks.length + " chunks (max " + CONCURRENCY + " at a time)...");
  t = Date.now();
  const uploadedParts = await uploadWithConcurrency(chunks, urls, CONCURRENCY);
  console.log("\n[" + formatTime(Date.now() - t) + "] All chunks uploaded");

  // STEP 5 - COMPLETE MULTIPART
  t = Date.now();
  const completeRes = await fetch(BASE + "/upload/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + YOUR_TOKEN,
    },
    body: JSON.stringify({
      uploadId,
      key,
      parts: uploadedParts,
    }),
  });
  await safeJson(completeRes);
  console.log("[" + formatTime(Date.now() - t) + "] Multipart upload completed");

  // STEP 6 - CONFIRM UPLOAD
  t = Date.now();
  const confirmRes = await fetch(BASE + "/confirm-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + YOUR_TOKEN,
    },
    body: JSON.stringify({
      fileId,
      name: "Manali.mp4",
      key,
      size: fileBuffer.length,
      mimeType: "video/mp4",
    }),
  });
  await safeJson(confirmRes);
  console.log("[" + formatTime(Date.now() - t) + "] Upload confirmed");

  const totalTime = formatTime(Date.now() - totalStart);
  const avgSpeed = (
    (fileBuffer.length / (Date.now() - totalStart)) *
    1000 / (1024 * 1024)
  ).toFixed(2);
  console.log("\nDone! Total: " + totalTime + " | Avg speed: ~" + avgSpeed + " MB/s\n");
}

run().catch(console.error);