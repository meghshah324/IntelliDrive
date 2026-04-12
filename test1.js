import fs from "fs";
import path from "path";


const API_BASE = "http://localhost:5000/api/files";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NGNiZmY2MS03MjYyLTRmNjItOWMwMC0xOTQ1NjdhY2UzZGQiLCJpYXQiOjE3NzM0MjIyNTksImV4cCI6MTc3MzUwODY1OX0.t7Nr_SNu4MyDrK0Z-D8aLlRyXY_zMh6AtDrS90QDHok";
const FILE_PATH = "./Manali.mp4";

async function safeJson(res) {
  const text = await res.text();
  if (!res.ok) throw new Error("HTTP " + res.status + "\n" + text);
  return JSON.parse(text);
}

async function run() {
  const file = fs.readFileSync(FILE_PATH);
  const stats = fs.statSync(FILE_PATH);
  const fileName = path.basename(FILE_PATH);

  console.log("File: " + fileName);
  console.log("Size: " + (stats.size / 1024 / 1024).toFixed(2) + " MB\n");

  console.time("Total Upload Time");

  // STEP 1 - Get presigned URL
  const uploadRes = await fetch(API_BASE + "/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({ fileName, mimeType: "video/mp4", size: stats.size }),
  });
  const uploadData = await safeJson(uploadRes);
  const { uploadUrl, key, fileId } = uploadData.data; // ✅ fixed
  console.log("Upload URL received");

  // STEP 2 - Upload directly to S3
  console.time("S3 Upload");

 

  const s3Res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
    },
    body: file,
  });

  if (!s3Res.ok) {
    const errText = await s3Res.text();
    throw new Error("S3 upload failed: " + s3Res.status + "\n" + errText);
  }
  console.timeEnd("S3 Upload");
  if (!s3Res.ok) throw new Error("S3 upload failed: " + s3Res.status);
  console.timeEnd("S3 Upload");

  // STEP 3 - Confirm upload
  const confirmRes = await fetch(API_BASE + "/confirm-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      fileId,
      name: fileName,
      key,
      size: stats.size,
      mimeType: "video/mp4",
    }),
  });
  const confirmData = await safeJson(confirmRes);
  console.log("Upload confirmed:", confirmData.data.id);

  console.timeEnd("Total Upload Time");
}

run().catch(console.error);
