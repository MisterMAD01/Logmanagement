// src/pages/TestPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../services/api";
import "./TestPage.css";

const logTemplates = {
  firewall: `<134>Aug 20 12:44:56 fw01 vendor=demo product=ngfw action=deny src=10.0.1.10 dst=8.8.8.8 spt=5353 dpt=53 proto=udp msg=DNS blocked\npolicy=Block-DNS`,
  network: `<190>Aug 20 13:01:02 r1 if=ge-0/0/1 event=link-down mac=aa:bb:cc:dd:ee:ff reason=carrier-loss`,
  http: `{
"tenant":"demoA",
"source":"api",
"event_type":"app_login_failed",
"user":"alice",
"ip":"203.0.113.7",
"reason":"wrong_password",
"@timestamp":"2025-08-20T07:20:00Z"
}`,
  crowdstrike: `{
"tenant":"demoA",
"source":"crowdstrike",
"event_type":"malware_detected",
"host":"WIN10-01",
"process":"powershell.exe",
"severity":8,
"sha256":"abc...",
"action":"quarantine",
"@timestamp":"2025-08-20T08:00:00Z"
}`,
  aws: `{
"tenant":"demoB",
"source":"aws",
"cloud":{"service":"iam","account_id":"123456789012","region":"ap-southeast-1"},
"event_type":"CreateUser",
"user":"admin",
"@timestamp":"2025-08-20T09:10:00Z",
"raw": {"eventName":"CreateUser","requestParameters":{"userName":"temp-user"}}
}`,
  m365: `{
"tenant":"demoB",
"source":"m365",
"event_type":"UserLoggedIn",
"user":"bob@demo.local",
"ip":"198.51.100.23",
"status":"Success",
"workload":"Exchange",
"@timestamp":"2025-08-20T10:05:00Z"
}`,
  ad: `{
"tenant":"demoA",
"source":"ad",
"event_id":4625,
"event_type":"LogonFailed",
"user":"demo\\\\eve",
"host":"DC01",
"ip":"203.0.113.77",
"logon_type":3,
"@timestamp":"2025-08-20T11:11:11Z"
}`,
};

const TestPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [logType, setLogType] = useState("firewall");
  const [logContent, setLogContent] = useState(logTemplates.firewall);

  const handleApiCall = async (endpoint, method, data) => {
    setMessage("Processing...");
    try {
      let response;
      if (method === "post") {
        response = await api.post(`/run/${endpoint}`, data || {});
      } else if (method === "delete") {
        response = await api.delete(`/run/${endpoint}`);
      }
      setMessage(
        `✅ Success: ${response.data.message || "Operation successful."}`
      );
    } catch (error) {
      setMessage(
        `❌ Error: ${
          error.response?.data?.error || "An unexpected error occurred."
        }`
      );
    }
  };

  const handleLogTypeChange = (e) => {
    const type = e.target.value;
    setLogType(type);
    setLogContent(logTemplates[type]);
  };

  return (
    <div className="test-container">
      <div className="test-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back
        </button>
        <h2>Test API Endpoints</h2>
      </div>

      <div className="test-buttons">
        <button
          className="test-btn"
          onClick={() => handleApiCall("syslog", "post")}
        >
          Test Send Syslog
        </button>
        <button
          className="test-btn"
          onClick={() => handleApiCall("ingest", "post")}
        >
          Test Ingest Folder
        </button>
        <button
          className="test-btn"
          onClick={() => handleApiCall("logs-index", "delete")}
        >
          Test Delete Logs
        </button>
        <button
          className="test-btn"
          onClick={() => handleApiCall("logs-old", "delete")}
          style={{ backgroundColor: "#dc3545" }}
        >
          Test Delete Old Logs
        </button>
        {/* ปุ่มไปยังหน้าค้นหา log */}
        <button
          className="test-btn"
          onClick={() => navigate("/logs-search")}
          style={{ backgroundColor: "#28a745" }}
        >
          Go to Log Search
        </button>
      </div>

      <hr />

      <h3>Simulater Log</h3>
      <label>Select Log Type:</label>
      <select value={logType} onChange={handleLogTypeChange}>
        <option value="firewall">Firewall/Syslog</option>
        <option value="network">Network (Router Syslog)</option>
        <option value="http">HTTP API</option>
        <option value="crowdstrike">CrowdStrike</option>
        <option value="aws">AWS CloudTrail</option>
        <option value="m365">Microsoft 365 Audit</option>
        <option value="ad">Microsoft AD/Windows Security</option>
      </select>

      <textarea
        rows={10}
        value={logContent}
        onChange={(e) => setLogContent(e.target.value)}
        style={{ width: "100%", marginTop: "10px" }}
      />

      <button
        className="test-btn"
        style={{ marginTop: "10px" }}
        onClick={() =>
          handleApiCall("ingest-file", "post", { file: logContent })
        }
      >
        Ingest Selected Log
      </button>

      {message && <div className="test-message">{message}</div>}
    </div>
  );
};

export default TestPage;
