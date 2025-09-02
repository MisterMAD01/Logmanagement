// B:\Coding\Logmanagement\backend\scripts\fileIngest.js
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const client = require("../config/config"); // OpenSearch client
const { normalizeLog } = require("../ingest/ingestion"); // ฟังก์ชัน normalize log

const INDEX_NAME = "logs";

// ฟังก์ชัน ingest log 1 entry
async function ingestLine(line) {
  let parsed;
  try {
    parsed = JSON.parse(line); // ลอง parse เป็น JSON
  } catch {
    parsed = { raw: line }; // ถ้าไม่ใช่ JSON
  }

  const normalized = normalizeLog(parsed);

  try {
    await client.index({
      index: INDEX_NAME,
      body: normalized,
    });
    console.log("✅ Log ingested:", normalized);
  } catch (err) {
    console.error("❌ Failed to ingest log:", err.message);
  }
}

// ฟังก์ชัน ingest จากไฟล์ รองรับบรรทัดต่อเนื่อง (merge policy/continuation)
async function ingestFile(filePath) {
  console.log("📂 Ingesting file:", filePath);

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let currentLog = "";

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (line.startsWith("<") || line.startsWith("{")) {
      // ถ้าเจอบรรทัดใหม่ JSON หรือ syslog timestamp เริ่ม log ใหม่
      if (currentLog) {
        await ingestLine(currentLog);
      }
      currentLog = line;
    } else {
      // ถ้าเป็นบรรทัด policy หรือ continuation ต่อเข้ากับ log ก่อนหน้า
      currentLog += " " + line.trim();
    }
  }

  // ingest log สุดท้าย
  if (currentLog) {
    await ingestLine(currentLog);
  }

  console.log("🎉 File ingestion completed:", filePath);
}

// ฟังก์ชัน ingest จาก string (จาก frontend)
async function ingestFromString(logString) {
  console.log("📂 Ingesting from string input");
  const lines = logString
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let currentLog = "";

  for (const line of lines) {
    if (line.startsWith("<") || line.startsWith("{")) {
      if (currentLog) await ingestLine(currentLog);
      currentLog = line;
    } else {
      currentLog += " " + line;
    }
  }

  if (currentLog) await ingestLine(currentLog);

  console.log("🎉 String ingestion completed");
}

// main runner (รับ argument เป็น path หรือ string)
async function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.error(
      "❌ Usage: node fileIngest.js <path-to-log-file | log-string>"
    );
    process.exit(1);
  }

  if (fs.existsSync(arg)) {
    const absPath = path.resolve(arg);
    await ingestFile(absPath);
  } else {
    // treat as string log
    await ingestFromString(arg);
  }
}

main().catch((err) => {
  console.error("🚨 Unexpected error:", err);
  process.exit(1);
});

module.exports = { ingestFile, ingestFromString };
