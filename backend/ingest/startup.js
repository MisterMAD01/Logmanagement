// src/startup.js
const { startUDP } = require("./syslogUDP_ingest");
const client = require("../config/config");

async function waitForOpenSearch(retries = 20, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await client.cluster.health();
      console.log("✅ OpenSearch is ready");
      return;
    } catch {
      console.log("⏳ Waiting for OpenSearch...");
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("❌ OpenSearch not available");
}

async function startup() {
  await waitForOpenSearch();
  startUDP(client);
  console.log("🚀 Startup completed");
}

module.exports = { startup };
