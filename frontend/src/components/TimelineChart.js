// src/components/TimelineChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./TimelineChart.css";

const TimelineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="no-data-message">No timeline data available.</p>;
  }

  // แกน X formatter ให้แสดง dd/MM/yyyy, HH:mm:ss
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatDateTime}
          angle={-20}
          textAnchor="end"
          height={60} // เพิ่มความสูงเพื่อให้ X-axis อ่านง่าย
        />
        <YAxis />
        <Tooltip labelFormatter={formatDateTime} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#4caf50"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimelineChart;
