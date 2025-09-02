const client = require("../config/config"); // OpenSearch client

async function deleteLogsIndex() {
  try {
    const exists = await client.indices.exists({ index: "logs" });
    if (exists.body) {
      await client.indices.delete({ index: "logs" });
      console.log("✅ Index 'logs' deleted successfully");
    } else {
      console.log("ℹ️ Index 'logs' does not exist");
    }
  } catch (err) {
    console.error("❌ Failed to delete index:", err);
  }
}

deleteLogsIndex();
