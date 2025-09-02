// src/components/Filters.jsx
import React from "react";
import "./Filters.css";

const Filters = ({
  tenant,
  setTenant,
  tenants,
  source,
  setSource,
  sources,
  fromTime,
  setFromTime,
  toTime,
  setToTime,
  user,
}) => {
  const handleReset = () => {
    setTenant("");
    setSource("");
    setFromTime("");
    setToTime("");
  };

  return (
    <div className="dashboard-filters">
      <label>
        Tenant:
        <select
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
          disabled={user.role === "Viewer"}
        >
          {user.role === "Admin" && <option value="">All</option>}
          {tenants.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label>
        Source:
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label>
        From:
        <input
          type="date"
          value={fromTime}
          onChange={(e) => setFromTime(e.target.value)}
        />
      </label>

      <label>
        To:
        <input
          type="date"
          value={toTime}
          onChange={(e) => setToTime(e.target.value)}
        />
      </label>

      <button className="reset-btn" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
};

export default Filters;
