import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaBell, FaSyncAlt, FaTimes, FaFlask } from "react-icons/fa";

import Filters from "../components/Filters";
import Summary from "../components/Summary";
import TimelineChart from "../components/TimelineChart";
import LogTable from "../components/LogTable";
import AlertList from "../components/AlertList";

import "./Dashboard.css";

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tenant, setTenant] = useState(
    user.role === "Admin" ? "" : user.tenant
  );
  const [tenants, setTenants] = useState([]);

  const [source, setSource] = useState("");
  const [sources, setSources] = useState([]);

  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const [summaryData, setSummaryData] = useState({
    topIPs: [],
    topUsers: [],
    topEventTypes: [],
    timelineData: [],
  });

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const processLogData = (logData, from, to) => {
    const ipCounts = {};
    const userCounts = {};
    const eventTypeCounts = {};
    const timeline = {};

    logData.forEach((log) => {
      const ip = log.src_ip || "unknown";
      const u = log.user || "unknown";
      const eventType = log.event_type || "unknown";

      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      userCounts[u] = (userCounts[u] || 0) + 1;
      eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;

      const logTimestamp = log["@timestamp"]
        ? new Date(log["@timestamp"])
        : new Date();
      const timeKey = logTimestamp.toISOString(); // ใช้ ISO String เป็น key เพื่อความแม่นยำ
      timeline[timeKey] = (timeline[timeKey] || 0) + 1;
    });

    const sortAndSlice = (obj) =>
      Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    const getTimelineData = () => {
      // สร้างอาร์เรย์ของข้อมูลไทม์ไลน์จาก object ที่เก็บไว้
      return Object.entries(timeline)
        .map(([time, count]) => ({
          timestamp: new Date(time),
          count,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
    };

    setSummaryData({
      topIPs: sortAndSlice(ipCounts),
      topUsers: sortAndSlice(userCounts),
      topEventTypes: sortAndSlice(eventTypeCounts),
      timelineData: getTimelineData(),
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};

      if (user.role === "Admin" && tenant) params.tenant = tenant;
      else if (user.role === "Viewer") params.tenant = user.tenant;

      if (source) params.source = source;

      if (fromTime) params.fromTime = new Date(fromTime).toISOString();
      if (toTime) params.toTime = new Date(toTime).toISOString();

      const [logResponse, alertResponse] = await Promise.all([
        api.get("/logs", { params }),
        api.get("/alerts", { params: { tenant: params.tenant } }),
      ]);

      const logData = logResponse.data || [];
      const alertData = Array.isArray(alertResponse.data)
        ? alertResponse.data
        : [];

      setLogs(logData);
      setAlerts(alertData);

      if (user.role === "Admin")
        setTenants([...new Set(logData.map((l) => l.tenant))].filter(Boolean));
      setSources([...new Set(logData.map((l) => l.source))].filter(Boolean));

      if (logData.length > 0) processLogData(logData, fromTime, toTime);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      else setError("❌ Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenant, source, fromTime, toTime]);

  if (loading) return <div className="loading-message">⏳ Loading data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>
          Welcome, {user.username} {user.tenant && `(Tenant: ${user.tenant})`}
        </h2>

        <div className="header-actions">
          <button onClick={() => setIsAlertOpen(true)} className="alert-btn">
            <FaBell />
            {alerts.length > 0 && (
              <span className="alert-count">{alerts.length}</span>
            )}
          </button>
          <button onClick={() => navigate("/test")} className="test-btn">
            <FaFlask /> Test
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <Summary summaryData={summaryData} />
      <Filters
        tenant={tenant}
        setTenant={setTenant}
        tenants={tenants}
        source={source}
        setSource={setSource}
        sources={sources}
        fromTime={fromTime}
        setFromTime={setFromTime}
        toTime={toTime}
        setToTime={setToTime}
        user={user}
      />

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>📊 Timeline</h3>
          <TimelineChart data={summaryData.timelineData} />
        </div>
      </div>

      <div className="dashboard-tables">
        {logs.length > 0 ? (
          <LogTable logs={logs} />
        ) : (
          <p>No logs available for the selected filters.</p>
        )}
      </div>

      {isAlertOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FaBell style={{ color: "red", marginRight: "8px" }} /> Alerts (
                {alerts.length})
              </h3>
              <div>
                <button onClick={fetchData} className="refresh-btn">
                  <FaSyncAlt /> Refresh
                </button>
                <button
                  onClick={() => setIsAlertOpen(false)}
                  className="close-btn"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <AlertList alerts={alerts} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
