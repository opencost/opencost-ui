import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toCurrency } from "../../util";
import { groupAssetsBy, getAssetColor } from "./assetUtils";
import { assetTypeConfig } from "./tokens";

const PROVIDER_COLORS = [
  "#0f62fe",
  "#198038",
  "#8a3ffc",
  "#009d9a",
  "#b28600",
  "#da1e28",
  "#6929c4",
  "#002d9c",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        padding: "0.5rem 0.75rem",
        fontSize: "0.8125rem",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>
        {payload[0].name || payload[0].payload.name}
      </div>
      <div>{toCurrency(payload[0].value, "USD")}</div>
    </div>
  );
};

const AssetsChart = ({ assets }) => {
  const typeData = useMemo(() => groupAssetsBy(assets, "type"), [assets]);
  const providerData = useMemo(
    () => groupAssetsBy(assets, "provider"),
    [assets],
  );

  if (assets.length === 0) return null;

  const pieData = typeData.map((d) => ({
    name: assetTypeConfig[d.name] ? assetTypeConfig[d.name].label : d.name,
    value: d.totalCost,
    fill: getAssetColor(d.name),
  }));

  const renderPieLabel = ({ name, percent, cx, x }) => {
    const anchor = x > cx ? "start" : "end";
    return (
      <text
        fill="#525252"
        fontSize={11}
        textAnchor={anchor}
        dominantBaseline="central"
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    );
  };

  return (
    <div className="assets-charts">
      <div className="assets-chart-card">
        <div className="assets-chart-title">Cost by Asset Type</div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              innerRadius={50}
              label={renderPieLabel}
              labelLine={{ stroke: "#8d8d8d" }}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="assets-chart-card">
        <div className="assets-chart-title">Cost by Provider</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={providerData}
            margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => toCurrency(v, "USD", 0)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalCost" name="Total Cost" radius={[4, 4, 0, 0]}>
              {providerData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={PROVIDER_COLORS[i % PROVIDER_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(AssetsChart);
