// src/components/AlertList.js
import React from "react";
import "./AlertList.css";

const AlertList = ({ alerts }) => {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return <p className="no-alerts-message">✅ No alerts available</p>;
  }

  return (
    <div className="alert-list">
      {alerts.map((alert) => {
        const user = alert.user || "unknown";
        const ip = alert.ip || "unknown";
        const tenant = alert.tenant || "unknown"; // เพิ่ม tenant
        const timestamp = new Date(alert.timestamp).toLocaleString();

        // ถ้า alert.reason มีตัวเลขอยู่แล้ว ใช้ fail count นั้น
        const failCountMatch = alert.reason?.match(/\d+/);
        const failCount = failCountMatch ? failCountMatch[0] : null;

        // ข้อความ alert
        const message = failCount
          ? `Failed login ${failCount} times from same IP`
          : `User ${user} failed login multiple times`;

        return (
          <div
            key={alert.id || alert.timestamp || Math.random()}
            className="alert-item"
          >
            <div className="alert-header">
              <span className="alert-icon">⚠️</span>
              <span className="alert-time">{timestamp}</span>
            </div>
            <div className="alert-body">
              <p>
                <strong>User:</strong> {user} | <strong>IP:</strong> {ip} |{" "}
                <strong>Tenant:</strong> {tenant}
              </p>
              <p className="alert-message">{message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertList;
