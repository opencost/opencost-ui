import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { toCurrency } from "../../util";

// Cost breakdown colors
const COLORS = {
  cpu: "#0f62fe",
  ram: "#8a3ffc",
  gpu: "#009d9a",
};

// Pie chart colors for distribution
const PIE_COLORS = [
  "#0f62fe",
  "#8a3ffc",
  "#009d9a",
  "#fa4d56",
  "#ff832b",
  "#f1c21b",
  "#42be65",
  "#4589ff",
  "#be95ff",
  "#82cfff",
];

interface AssetData {
  name?: string;
  cpuCost?: number;
  ramCost?: number;
  gpuCost?: number;
  totalCost?: number;
  type?: string;
}

interface AssetsChartProps {
  assetData?: AssetData[];
  currency?: string;
  height?: number;
  n?: number;
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "var(--cds-layer-01, #fff)",
          border: "1px solid var(--cds-border-subtle-01, #e0e0e0)",
          borderRadius: "4px",
          padding: "12px 16px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            fontWeight: 600,
            color: "var(--cds-text-primary)",
          }}
        >
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{
              margin: "4px 0",
              color: entry.color,
              fontSize: "13px",
            }}
          >
            {entry.name}: {toCurrency(entry.value, currency, 2)}
          </p>
        ))}
        <p
          style={{
            margin: "8px 0 0 0",
            fontWeight: 600,
            borderTop: "1px solid var(--cds-border-subtle-01)",
            paddingTop: "8px",
            color: "var(--cds-text-primary)",
          }}
        >
          Total:{" "}
          {toCurrency(
            payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0),
            currency,
            2
          )}
        </p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        style={{
          backgroundColor: "var(--cds-layer-01, #fff)",
          border: "1px solid var(--cds-border-subtle-01, #e0e0e0)",
          borderRadius: "4px",
          padding: "12px 16px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <p
          style={{
            margin: "0 0 4px 0",
            fontWeight: 600,
            color: "var(--cds-text-primary)",
          }}
        >
          {data.name}
        </p>
        <p style={{ margin: 0, color: data.payload.fill, fontSize: "14px" }}>
          {toCurrency(data.value, currency, 2)}
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--cds-text-secondary)" }}>
          {((data.percent || 0) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const AssetsChart: React.FC<AssetsChartProps> = ({
  assetData = [],
  currency = "USD",
  height = 400,
  n = 10,
}) => {
  if (!assetData || assetData.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 200,
          color: "var(--cds-text-secondary)",
        }}
      >
        No chart data available
      </div>
    );
  }

  // Prepare data for bar chart (top N by cost)
  const sortedData = [...assetData]
    .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
    .slice(0, n)
    .map((item) => ({
      name: item.name || "Unknown",
      CPU: item.cpuCost || 0,
      RAM: item.ramCost || 0,
      GPU: item.gpuCost || 0,
      total: item.totalCost || 0,
    }));

  // Prepare data for pie chart (cost distribution)
  const pieData = [...assetData]
    .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
    .slice(0, 8)
    .map((item, index) => ({
      name: item.name || "Unknown",
      value: item.totalCost || 0,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));

  // Calculate "Other" if there are more than 8 items
  if (assetData.length > 8) {
    const otherTotal = assetData
      .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
      .slice(8)
      .reduce((sum, item) => sum + (item.totalCost || 0), 0);
    if (otherTotal > 0) {
      pieData.push({
        name: "Other",
        value: otherTotal,
        fill: "#a8a8a8",
      });
    }
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return toCurrency(value, currency, 0);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Section Title */}
      <h4
        style={{
          margin: "0 0 1.5rem 0",
          fontSize: "1rem",
          fontWeight: 600,
          color: "var(--cds-text-primary)",
          textAlign: "center",
        }}
      >
        Cost Breakdown by Resource
      </h4>

      {/* Charts Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          alignItems: "center",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Bar Chart */}
        <div style={{ width: "100%", height: height, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--cds-border-subtle-01, #e0e0e0)"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                tickFormatter={formatYAxis}
                tick={{ fill: "var(--cds-text-secondary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--cds-border-strong-01)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fill: "var(--cds-text-primary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="square"
              />
              <Bar dataKey="CPU" stackId="a" fill={COLORS.cpu} radius={[0, 0, 0, 0]} />
              <Bar dataKey="RAM" stackId="a" fill={COLORS.ram} radius={[0, 0, 0, 0]} />
              <Bar dataKey="GPU" stackId="a" fill={COLORS.gpu} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ width: "100%", height: height, minWidth: 0, display: "flex", justifyContent: "center" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name.length > 10 ? name.slice(0, 10) + "..." : name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={{ stroke: "var(--cds-text-secondary)", strokeWidth: 1 }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip currency={currency} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AssetsChart;
