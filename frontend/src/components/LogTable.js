import React from "react";
import "./LogTable.css";

const LogTable = ({ logs }) => {
  if (!Array.isArray(logs) || logs.length === 0) {
    return <p className="no-logs-message">No logs available.</p>;
  }

  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = a["@timestamp"] ? new Date(a["@timestamp"]).getTime() : 0;
    const timeB = b["@timestamp"] ? new Date(b["@timestamp"]).getTime() : 0;
    return timeB - timeA;
  });

  const getFieldValue = (log, fields) => {
    for (const field of fields) {
      if (log[field] !== undefined && log[field] !== null) {
        return log[field];
      }
    }
    return "-";
  };

  return (
    <div className="log-table-container">
      <table className="log-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Tenant</th>
            <th>Source</th>
            <th>User</th>
            <th>IP / Host</th>
            <th>Event Type</th>
            <th>Action</th>
            <th>Process</th>
            <th>Rule Name</th>
            <th>Cloud Service</th>
            <th>Cloud Account</th>
            <th>Cloud Region</th>
          </tr>
        </thead>
        <tbody>
          {sortedLogs.map((log, idx) => (
            <tr key={log.id || idx}>
              <td data-label="Timestamp">
                {log["@timestamp"]
                  ? new Date(log["@timestamp"]).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "unknown"}
              </td>

              <td data-label="Tenant">{log.tenant || "unknown"}</td>
              <td data-label="Source">{log.source || "unknown"}</td>
              <td data-label="User">
                {log.user || log.raw?.user || "unknown"}
              </td>
              <td data-label="IP / Host">
                {log.src_ip || log.host || log.raw?.ip || "unknown"}
              </td>
              <td data-label="Event Type">
                {log.event_type || log.raw?.eventType || "unknown"}
              </td>
              <td data-label="Action">
                {log.action || log.raw?.action || "-"}
              </td>
              <td data-label="Process">
                {log.process || log.raw?.process || "-"}
              </td>
              <td data-label="Rule Name">
                {log.rule_name || log.raw?.policy || "-"}
              </td>
              <td data-label="Cloud Service">{log.cloud?.service || "-"}</td>
              <td data-label="Cloud Account">{log.cloud?.account_id || "-"}</td>
              <td data-label="Cloud Region">{log.cloud?.region || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;
