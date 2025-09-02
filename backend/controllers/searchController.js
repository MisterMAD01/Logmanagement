const client = require("../config/config"); // OpenSearch client

exports.searchLogs = async (req, res) => {
  try {
    const {
      query,
      tenant,
      source,
      vendor,
      product,
      event_type,
      event_subtype,
      severity,
      action,
      src_ip,
      src_port,
      dst_ip,
      dst_port,
      protocol,
      user,
      host,
      process,
      url,
      http_method,
      status_code,
      rule_name,
      rule_id,
      cloud_account_id,
      cloud_region,
      cloud_service,
      from,
      to,
      limit = 50,
    } = req.body;

    const esQuery = { bool: { must: [], filter: [] } };

    // Full-text search
    if (query) {
      esQuery.bool.must.push({
        multi_match: {
          query,
          fields: [
            "vendor",
            "product",
            "event_type",
            "event_subtype",
            "action",
            "src_ip",
            "dst_ip",
            "user",
            "host",
            "process",
            "url",
            "rule_name",
            "rule_id",
            "raw.message",
          ],
          fuzziness: "AUTO",
        },
      });
    }

    // Exact-match filters
    const exactFilters = {
      tenant,
      source,
      vendor,
      product,
      event_type,
      event_subtype,
      action,
      src_ip,
      src_port,
      dst_ip,
      dst_port,
      protocol,
      user,
      host,
      process,
      url,
      http_method,
      status_code,
      rule_name,
      rule_id,
      "cloud.account_id": cloud_account_id,
      "cloud.region": cloud_region,
      "cloud.service": cloud_service,
    };

    for (const [field, value] of Object.entries(exactFilters)) {
      if (value !== undefined && value !== "") {
        esQuery.bool.filter.push({ term: { [field]: value } });
      }
    }

    // Severity range (0-10)
    if (severity) {
      esQuery.bool.filter.push({
        range: {
          severity: { gte: severity.min || 0, lte: severity.max || 10 },
        },
      });
    }

    // Timestamp range
    if (from || to) {
      esQuery.bool.filter.push({
        range: {
          "@timestamp": {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
          },
        },
      });
    }

    const response = await client.search({
      index: "logs",
      size: limit,
      body: {
        query: esQuery,
        sort: [{ "@timestamp": "desc" }],
      },
    });

    const hits = response?.body?.hits?.hits || [];
    const total = response?.body?.hits?.total?.value || 0;

    res.json({ total, logs: hits.map((hit) => hit._source) });
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};
