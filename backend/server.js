require("dotenv").config(); // โหลดค่า .env
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");

const authRoutes = require("./routes/authRoutes");
const ingestRoutes = require("./routes/ingestRoutes");
const logsRoutes = require("./routes/logRoutes");
const alertsRoutes = require("./routes/alertsRoutes");
const runRoutes = require("./routes/runRoutes");
const searchRoutes = require("./routes/searchRoutes");

const { startup } = require("./ingest/startup");
const { startUDP } = require("./ingest/syslogUDP_ingest");
const client = require("./config/config");

// ฟังก์ชันลบ log เก่ากว่า X วัน จาก env
async function deleteOldLogs() {
  const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 7;
  const cutoff = new Date(
    Date.now() - retentionDays * 24 * 60 * 60 * 1000
  ).toISOString();

  try {
    const result = await client.deleteByQuery({
      index: "logs",
      body: {
        query: { range: { "@timestamp": { lt: cutoff } } },
      },
    });
    console.log("🗑️ Deleted old logs:", result.deleted || 0);
  } catch (err) {
    console.error("❌ Failed to delete old logs:", err);
  }
}

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(bodyParser.json());

app.use("/search", searchRoutes);
app.use("/alerts", alertsRoutes);
app.use("/auth", authRoutes);
app.use("/ingest", ingestRoutes);
app.use("/logs", logsRoutes);
app.use("/run", runRoutes);
app.use("/test", runRoutes);

async function main() {
  try {
    console.log("⏳ Starting backend...");

    await startup();
    startUDP(client, 514);

    const PORT = process.env.PORT;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Backend running on port ${PORT}`);
    });

    // Cron job ทุกวันเที่ยงคืน
    cron.schedule("0 0 * * *", () => {
      console.log("⏰ Running daily old log cleanup...");
      deleteOldLogs();
    });
  } catch (err) {
    console.error("❌ Backend startup failed:", err);
    process.exit(1);
  }
}

main();
