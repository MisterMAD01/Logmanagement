const client = require("../config/config"); // OpenSearch client

async function getLogs(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const filters = [];

    // Tenant filter
    if (req.user.role === "Admin" && req.query.tenant) {
      filters.push({ term: { "tenant.keyword": req.query.tenant } });
    } else if (req.user.role === "Viewer") {
      filters.push({ term: { "tenant.keyword": req.user.tenant } });
    }

    // Source filter (optional)
    if (req.query.source) {
      filters.push({ term: { "source.keyword": req.query.source } });
    }

    // Time range filter
    if (req.query.fromTime && req.query.toTime) {
      filters.push({
        range: {
          "@timestamp": {
            gte: req.query.fromTime,
            lte: req.query.toTime,
          },
        },
      });
    }

    const queryBody = filters.length
      ? { bool: { filter: filters } }
      : { match_all: {} };

    const indexExists = await client.indices.exists({ index: "logs" });
    if (!indexExists.body) return res.json([]);

    const result = await client.search({
      index: "logs",
      body: { query: queryBody, size: 50 },
    });

    const hits = result.body?.hits?.hits || [];
    const logs = hits.map((h) => h._source || {});
    res.json(logs);
  } catch (err) {
    console.error("Error searching logs:", err);
    res.status(500).json({ error: err.toString() });
  }
}

module.exports = { getLogs };
