const express = require("express");
const router = express.Router();
const runController = require("../controllers/runController");

// ============================
// Syslog
// ============================
router.post("/syslog", runController.sendSyslog);

// ============================
// Ingestion
// ============================

// Ingest folder เข้า OpenSearch
router.post("/ingest", runController.ingestFolder);

// Ingest ไฟล์เดียวเข้า OpenSearch
router.post("/ingest-file", runController.ingestFile);

// ============================
// Logs Management
// ============================

// ลบ index logs
router.delete("/logs-index", runController.deleteLogs);

// ลบ log เก่าตามเงื่อนไข
router.delete("/logs-old", runController.deleteOldLogs);

module.exports = router;
