import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toCurrency } from "../../util";

const ASSET_TYPE_COLORS = {
  Node: "#0043ce",
  Disk: "#8a3ffc",
  Network: "#00539a",
  LoadBalancer: "#009d9a",
  ClusterManagement: "#da1e28",
  Cluster: "#ff832b",
  Cloud: "#be95ff",
  default: "#6b7280",
};

const AssetsCostBreakdown = ({ costByType, totalCost, currency }) => {
  if (!costByType || Object.keys(costByType).length === 0) {
    return (
      <div className="assets-cost-breakdown">
        <p style={{ color: "#6f6f6f", fontStyle: "italic" }}>
          No cost breakdown data available.
        </p>
      </div>
    );
  }

  const chartData = Object.entries(costByType)
    .map(([type, cost]) => ({
      name: type,
      value: cost,
      percentage: totalCost > 0 ? ((cost / totalCost) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const getColor = (type) =>
    ASSET_TYPE_COLORS[type] || ASSET_TYPE_COLORS.default;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="assets-chart-tooltip">
          <p className="assets-chart-tooltip__label">{data.name}</p>
          <p className="assets-chart-tooltip__value">
            {toCurrency(data.value, currency)}
          </p>
          <p className="assets-chart-tooltip__percent">{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="assets-cost-breakdown">
      <div className="assets-cost-breakdown__tags">
        {chartData.map(({ name, value, percentage }) => {
          const tagClass = `assets-type-tag assets-type-tag--${name.toLowerCase()}`;
          return (
            <div key={name} className={tagClass}>
              {name} — {toCurrency(value, currency)} ({percentage}%)
            </div>
          );
        })}
      </div>
      <div className="assets-cost-breakdown__chart">
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{ fontSize: "12px", color: "#6f6f6f", fontWeight: "500" }}
          >
            Total Cost
          </div>
          <div
            style={{ fontSize: "24px", color: "#161616", fontWeight: "700" }}
          >
            {toCurrency(totalCost, currency)}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              minAngle={8}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={getColor(entry.name)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetsCostBreakdown;
