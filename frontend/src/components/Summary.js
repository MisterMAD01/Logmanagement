// src/components/Summary.js
import React from "react";
import { FaUser, FaNetworkWired, FaExclamationTriangle } from "react-icons/fa";
import "./Summary.css";

const iconMap = {
  topIPs: <FaNetworkWired size={24} color="#4caf50" />,
  topUsers: <FaUser size={24} color="#2196f3" />,
  topEventTypes: <FaExclamationTriangle size={24} color="#ff9800" />,
};

const titleMap = {
  topIPs: "Top IP",
  topUsers: "Top User",
  topEventTypes: "Top Event Type",
};

const Summary = ({ summaryData }) => {
  if (!summaryData) {
    return null;
  }

  return (
    <div className="dashboard-summary">
      {["topIPs", "topUsers", "topEventTypes"].map((key) => {
        const topItem = summaryData[key][0];
        if (!topItem) {
          return (
            <div className="summary-card" key={key}>
              <div className="summary-header">
                {iconMap[key]}
                <h3>{titleMap[key]}</h3>
              </div>
              <p className="summary-value">No data</p>
            </div>
          );
        }

        return (
          <div className="summary-card" key={key}>
            <div className="summary-header">
              {iconMap[key]}
              <h3>{titleMap[key]}</h3>
            </div>
            <p className="summary-value">
              {topItem.name}: {topItem.count}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Summary;
