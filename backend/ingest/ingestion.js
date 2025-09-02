// src/ingestion.js
function parseKeyValueString(str) {
  const obj = {};
  if (!str) return obj;
  str.split(/\s+/).forEach((part) => {
    const [key, ...rest] = part.split("=");
    if (key && rest.length) obj[key.trim()] = rest.join("=");
  });
  return obj;
}

function normalizeLog(log = {}) {
  const raw =
    typeof log.raw === "string" ? { message: log.raw } : log.raw || {};
  const kv = parseKeyValueString(raw.message || "");

  return {
    "@timestamp": log["@timestamp"] || new Date().toISOString(),
    tenant: log.tenant || "default",
    source: log.source || "",
    vendor: kv.vendor || log.vendor || "",
    product: kv.product || log.product || "",
    event_type: log.event_type || kv.event_type || "",
    event_subtype: log.event_subtype || kv.event_subtype || "",
    severity: log.severity != null ? log.severity : "-",
    action: log.action || kv.action || "",
    src_ip: kv.src || log.src_ip || log.ip || "",
    src_port: kv.spt || log.src_port || "",
    dst_ip: kv.dst || log.dst_ip || "",
    dst_port: kv.dpt || log.dst_port || "",
    protocol: kv.proto || log.protocol || "",
    user: log.user || kv.user || "",
    host: log.host || kv.host || "",
    process: log.process || kv.process || "",
    url: log.url || kv.url || "",
    http_method: log.http_method || kv.http_method || "",
    status_code: log.status_code || kv.status_code || "",
    rule_name: log.rule_name || kv.policy || "",
    rule_id: log.rule_id || kv.rule_id || "",
    cloud: {
      account_id: log.cloud?.account_id || kv["cloud.account_id"] || "",
      region: log.cloud?.region || kv["cloud.region"] || "",
      service: log.cloud?.service || kv["cloud.service"] || "",
    },
    raw,
    _tags: log._tags || [],
  };
}

async function ingestLog(client, log) {
  try {
    const normalized = normalizeLog(log);
    await client.index({ index: "logs", body: normalized });
    console.log("✅ Ingested log:", JSON.stringify(normalized, null, 2));
    return normalized;
  } catch (err) {
    console.error("❌ Error ingesting log:", err.message, log);
    throw err;
  }
}

module.exports = { normalizeLog, ingestLog };
