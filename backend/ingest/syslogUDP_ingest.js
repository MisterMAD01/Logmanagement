// src/syslogUDP_ingest.js
const dgram = require("dgram");
const { ingestLog } = require("./ingestion");

/**
 * แปลง timestamp จาก syslog ข้อความ เช่น "<134>Aug 20 12:44:56 ..."
 */
function parseSyslogTimestamp(msg) {
  const regex = /^<\d+>([A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2})/;
  const match = msg.match(regex);
  if (!match) return new Date().toISOString();

  const syslogTime = match[1]; // "Aug 20 12:44:56"
  const now = new Date();
  const year = now.getFullYear(); // syslog ไม่มีปี ต้องเติมเอง
  const date = new Date(`${syslogTime} ${year}`);
  return date.toISOString();
}

/**
 * แปลงข้อความ Syslog เป็น object แล้วส่งเข้า ingestLog
 */
async function handleSyslogMessage(client, msg) {
  const messageStr = msg.toString().trim();
  if (!messageStr) return;

  const timestamp = parseSyslogTimestamp(messageStr);

  const logData = {
    tenant: "demoFirewall",
    source: "firewall",
    event_type: "syslogUDP",
    "@timestamp": timestamp,
    raw: { message: messageStr },
  };

  console.log("📥 Received syslog message:", messageStr);

  try {
    await ingestLog(client, logData);
    console.log("✅ Ingested syslog message");
  } catch (err) {
    console.error("❌ Failed to ingest syslog message:", err);
  }
}

/**
 * เริ่มฟัง Syslog UDP
 */
function startUDP(client, port = 514) {
  const server = dgram.createSocket("udp4");

  server.on("message", (msg) => handleSyslogMessage(client, msg));

  server.bind(port, () => {
    console.log(`📡 UDP Syslog listening on port ${port}`);
  });
}

module.exports = { startUDP };
