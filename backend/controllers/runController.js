const path = require("path");
const { spawn } = require("child_process");

// helper function สำหรับรัน script
function runScript(scriptPath, res, successMsg, failMsg, args = []) {
  console.log("📂 Running script:", scriptPath, "args:", args);

  const child = spawn("node", [scriptPath, ...args], { stdio: "pipe" });

  let output = "";
  let error = "";

  child.stdout.on("data", (data) => {
    const text = data.toString();
    output += text;
    console.log("stdout:", text);
  });

  child.stderr.on("data", (data) => {
    const text = data.toString();
    error += text;
    console.error("stderr:", text);
  });

  child.on("close", (code) => {
    if (code === 0) {
      res.json({ message: successMsg, output });
    } else {
      res.status(500).json({ message: failMsg, error });
    }
  });

  child.on("error", (err) => {
    console.error("❌ Failed to start process:", err);
    res
      .status(500)
      .json({ message: "Failed to start script", error: err.message });
  });
}

// ============================
// Controller functions
// ============================

// ส่ง Syslog UDP
exports.sendSyslog = (req, res) => {
  const scriptPath = path.resolve(__dirname, "../scripts/sendSyslog.js");
  runScript(
    scriptPath,
    res,
    "✅ Syslog sent successfully",
    "❌ Syslog sending failed"
  );
};

// Ingest folder เข้า OpenSearch
exports.ingestFolder = (req, res) => {
  const scriptPath = path.resolve(__dirname, "../scripts/runFileIngest.js");
  runScript(
    scriptPath,
    res,
    "✅ Ingestion completed successfully",
    "❌ Ingestion failed"
  );
};

// ลบ index logs
exports.deleteLogs = (req, res) => {
  const scriptPath = path.resolve(__dirname, "../scripts/deleteLogs.js");
  runScript(
    scriptPath,
    res,
    "✅ Logs index deleted successfully",
    "❌ Delete logs failed"
  );
};

// ลบ log เก่าตามเงื่อนไข
exports.deleteOldLogs = (req, res) => {
  const scriptPath = path.resolve(__dirname, "../scripts/deleteOldLogs.js");
  runScript(
    scriptPath,
    res,
    "✅ Old logs deleted successfully",
    "❌ Delete old logs failed"
  );
};

// Ingest ไฟล์หรือ log string เข้า OpenSearch
exports.ingestFile = (req, res) => {
  const { file } = req.body; // frontend ส่ง path หรือ log string
  if (!file) {
    return res
      .status(400)
      .json({ message: "❌ Missing file path or log content" });
  }

  const scriptPath = path.resolve(__dirname, "../scripts/fileIngest.js");

  // ส่ง path หรือ string log เป็น argument
  runScript(
    scriptPath,
    res,
    "✅ File ingestion completed successfully",
    "❌ File ingestion failed",
    [file]
  );
};
