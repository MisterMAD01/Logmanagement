const { ingestLog } = require("../ingest/ingestion");
const client = require("../config/config"); // OpenSearch client

async function ingest(req, res) {
  try {
    const log = req.body || {};

    // กำหนด default สำหรับฟิลด์สำคัญเฉพาะที่ต้องมี
    const payload = {
      tenant: log.tenant || "default",
      source: log.source || "api",
      event_type: log.event_type, // ใช้ค่า frontend ส่งมา
      user: log.user,
      action: log.action || "login", // ใช้ค่า frontend ส่งมา
      ip: log.ip || req.ip || req.headers["x-forwarded-for"] || "unknown",
      reason: log.reason || "-",
      "@timestamp": log["@timestamp"] || new Date().toISOString(),
    };

    // ส่งเข้า ingestLog
    const result = await ingestLog(client, payload);

    res.json({ result: "ok", data: result });
  } catch (err) {
    console.error("❌ Error ingesting log:", err);
    res.status(500).json({ error: err.toString() });
  }
}

module.exports = { ingest };
