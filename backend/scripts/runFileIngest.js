const path = require("path");
const client = require("../config/config"); // OpenSearch client
const { ingestFolder } = require("../ingest/sampleFile_ingest");

async function main() {
  try {
    const folderPath = path.resolve(__dirname, "../samples"); // folder samples
    console.log("📂 Ingesting folder:", folderPath);
    await ingestFolder(client, folderPath);

    console.log("✅ All ingestion completed");
  } catch (err) {
    console.error("❌ Ingestion script failed:", err);
  }
}

main();
