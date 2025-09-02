// src/sampleFile_ingest.js
const fs = require("fs").promises;
const path = require("path");
const { ingestLog } = require("./ingestion");

async function ingestFile(client, filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content);
    await ingestLog(client, data);
    console.log("📄 File ingested:", filePath);
    return true;
  } catch (err) {
    console.error("❌ Failed to ingest file:", filePath, err);
    return false;
  }
}

async function ingestFolder(client, folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    for (const file of jsonFiles) {
      await ingestFile(client, path.join(folderPath, file));
    }
  } catch (err) {
    console.error("❌ Failed to ingest folder:", folderPath, err);
  }
}

module.exports = { ingestFile, ingestFolder };
