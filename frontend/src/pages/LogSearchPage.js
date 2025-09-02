import React, { useState } from "react";
import api from "../services/api";
import "./LogSearchPage.css";

const LogSearchPage = () => {
  const [filters, setFilters] = useState({
    query: "",
    tenant: "",
    source: "",
    vendor: "",
    product: "",
    event_type: "",
    event_subtype: "",
    severity_min: "",
    severity_max: "",
    action: "",
    src_ip: "",
    src_port: "",
    dst_ip: "",
    dst_port: "",
    protocol: "",
    user: "",
    host: "",
    process: "",
    url: "",
    http_method: "",
    status_code: "",
    rule_name: "",
    rule_id: "",
    cloud_account_id: "",
    cloud_region: "",
    cloud_service: "",
    from: "",
    to: "",
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const { from, to, severity_min, severity_max, ...restFilters } = filters;

      const body = {
        ...restFilters,
        limit: 50,
      };

      if (from) body.from = new Date(from).toISOString();
      if (to) body.to = new Date(to).toISOString();
      if (severity_min || severity_max) {
        body.severity = {
          min: severity_min ? parseInt(severity_min) : 0,
          max: severity_max ? parseInt(severity_max) : 10,
        };
      }

      const res = await api.post("/search", body);
      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Search failed");
      setLogs([]);
    }
    setLoading(false);
  };

  return (
    <div className="log-search-container">
      <h2>Search Logs</h2>

      <div className="filters">
        <input
          type="text"
          name="query"
          placeholder="Search query"
          value={filters.query}
          onChange={handleChange}
        />
        <input
          type="text"
          name="tenant"
          placeholder="Tenant"
          value={filters.tenant}
          onChange={handleChange}
        />
        <input
          type="text"
          name="source"
          placeholder="Source"
          value={filters.source}
          onChange={handleChange}
        />
        <input
          type="text"
          name="vendor"
          placeholder="Vendor"
          value={filters.vendor}
          onChange={handleChange}
        />
        <input
          type="text"
          name="product"
          placeholder="Product"
          value={filters.product}
          onChange={handleChange}
        />

        <input
          type="text"
          name="action"
          placeholder="Action"
          value={filters.action}
          onChange={handleChange}
        />
        <input
          type="text"
          name="src_ip"
          placeholder="Source IP"
          value={filters.src_ip}
          onChange={handleChange}
        />
        <input
          type="datetime-local"
          name="from"
          value={filters.from}
          onChange={handleChange}
        />
        <input
          type="datetime-local"
          name="to"
          value={filters.to}
          onChange={handleChange}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <table className="logs-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Tenant</th>
            <th>Source</th>
            <th>Vendor</th>
            <th>Product</th>
            <th>Event Type</th>
            <th>Action</th>
            <th>Src IP</th>
            <th>Dst IP</th>
            <th>Rule</th>
            <th>Raw</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>
                No logs found
              </td>
            </tr>
          ) : (
            logs.map((log, idx) => (
              <tr key={idx}>
                <td>{log["@timestamp"]}</td>
                <td>{log.tenant}</td>
                <td>{log.source}</td>
                <td>{log.vendor}</td>
                <td>{log.product}</td>
                <td>{log.event_type}</td>
                <td>{log.action}</td>
                <td>{log.src_ip}</td>
                <td>{log.dst_ip}</td>
                <td>{log.rule_name}</td>
                <td>
                  <pre className="raw-log">{log.raw?.message}</pre>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LogSearchPage;
