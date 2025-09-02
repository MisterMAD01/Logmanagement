const client = require("../config/config"); // OpenSearch client

// ตรวจสอบ login fail ล่าสุดภายใน 5 นาที พร้อม debug
async function checkLoginFail(req, res) {
  const { user, ip, tenant } = req.body;
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

  // query สำหรับ OpenSearch
  const must = [
    { term: { event_type: "web_login_failed" } },
    { range: { "@timestamp": { gte: fiveMinutesAgo } } },
  ];

  if (user) must.push({ term: { "user.keyword": user } });

  if (ip) {
    must.push({
      bool: {
        should: [
          { term: { "ip.keyword": ip } },
          { term: { "src_ip.keyword": ip } },
        ],
      },
    });
  }

  if (tenant) must.push({ term: { "tenant.keyword": tenant } });

  try {
    console.log("🚀 checkLoginFail query:", JSON.stringify(must, null, 2));

    const result = await client.search({
      index: "logs",
      ignore_unavailable: true, // handle กรณี index ยังไม่มี
      body: { query: { bool: { must } } },
    });

    // debug: แสดง document ที่ match
    const hits = result.body.hits.hits || [];
    console.log(`🔎 Found ${hits.length} failed login(s) in last 5 minutes:`);
    hits.forEach((h) => console.log(h._source));

    const totalFailed = hits.length;

    if (totalFailed >= 3) {
      const alertMsg = `⚠️ User ${
        user || "unknown"
      } failed login ${totalFailed} times`;
      console.log("📢 Alert triggered:", alertMsg);
      return res.json({ alert: alertMsg });
    }

    console.log("✅ No alert triggered");
    res.json({ alert: null });
  } catch (err) {
    console.error("Alert check error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function getAllAlerts(req, res) {
  try {
    // กำหนด tenant จาก token สำหรับ Viewer
    let tenantFilter = {};
    if (req.user.role === "Viewer") {
      tenantFilter = { term: { "tenant.keyword": req.user.tenant } };
    }

    const result = await client.search({
      index: "logs",
      ignore_unavailable: true,
      size: 0,
      body: {
        query: {
          bool: {
            must: [
              { term: { "event_type.keyword": "web_login_failed" } },
              ...(req.user.role === "Viewer" ? [tenantFilter] : []),
            ],
          },
        },
        aggs: {
          user_ip: {
            composite: {
              size: 50,
              sources: [
                { user: { terms: { field: "user.keyword" } } },
                { ip: { terms: { field: "src_ip.keyword" } } },
              ],
            },
            aggs: {
              fail_count: { value_count: { field: "user.keyword" } },
              filter_5: {
                bucket_selector: {
                  buckets_path: { count: "fail_count" },
                  script: "params.count >= 5",
                },
              },
            },
          },
        },
      },
    });

    const buckets = result.body.aggregations?.user_ip?.buckets || [];
    const alerts = buckets.map((b) => ({
      id: `${b.key.user}-${b.key.ip}-${Date.now()}`,
      tenant: req.user.role === "Viewer" ? req.user.tenant : "demoAlert",
      user: b.key.user || "unknown",
      ip: b.key.ip || "unknown",
      reason: `Failed login ${b.fail_count.value} times from same IP`,
      timestamp: new Date().toISOString(),
      source: "web_login_failed",
      action: "Alert",
    }));

    res.json(alerts);
  } catch (err) {
    console.error("Get all alerts error:", err);
    res.json([]);
  }
}

module.exports = { checkLoginFail, getAllAlerts };
