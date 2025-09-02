require("dotenv").config();
const dgram = require("dgram");
const fs = require("fs");
const readline = require("readline");
const path = require("path");

// อ่านค่า host/port จาก .env หรือใช้ค่า default
const UDP_HOST = process.env.UDP_HOST;
const UDP_PORT = process.env.UDP_PORT;

// path ของไฟล์ log ยังคงกำหนดตรง ๆ
const FILE_PATH = path.resolve(__dirname, "../samples/firewall/firewall.log");

const client = dgram.createSocket("udp4");

// อ่านไฟล์ทีละบรรทัดและส่ง UDP
async function sendLogs() {
  if (!fs.existsSync(FILE_PATH)) {
    console.error("❌ Log file not found:", FILE_PATH);
    return;
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(FILE_PATH),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    const message = Buffer.from(line);
    client.send(message, UDP_PORT, UDP_HOST, (err) => {
      if (err) console.error("❌ Error sending syslog:", err);
      else console.log("📤 Syslog message sent:", line);
    });

    // delay เล็กน้อย 100ms
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("✅ All logs sent");
  client.close();
}

sendLogs().catch(console.error);
