import React, { useState } from "react";
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
import { Button } from "@carbon/react";
import { Maximize, Close, Download, ArrowLeft, ArrowUpLeft } from "@carbon/icons-react";
import { toCurrency } from "../../util";
import EmptyState from "../EmptyState";
import { AssetsChartProps } from '../../types/assets';

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: Record<string, unknown>;
}

interface PieTooltipPayloadEntry {
  name: string;
  value: number;
  percent: number;
  payload: {
    fill: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  currency: string;
}

interface PieTooltipProps {
  active?: boolean;
  payload?: PieTooltipPayloadEntry[];
  currency: string;
  total?: number;
}

const COLORS = {
  cpu: "#0066ff",
  ram: "#9900ff",
  gpu: "#00cc00",
};

const PIE_COLORS = [
  "#0066ff",
  "#9900ff",
  "#029106d1",
  "#ff0044",
  "#ff6600",
  "#ffcc00",
  "#00cc00",
  "#0033ff",
  "#cc00ff",
  "#00ccff",
];

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "var(--cds-layer-01, #fff)",
          border: "1px solid var(--cds-border-subtle-01, #e0e0e0)",
          borderRadius: "4px",
          padding: "12px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          color: "var(--cds-text-primary)",
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
        {payload.map((entry: TooltipPayloadEntry, index: number) => (
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
            payload.reduce((sum: number, p: TooltipPayloadEntry) => sum + (p.value || 0), 0),
            currency,
            2
          )}
        </p>
      </div>
    );
  }
  return null;
};

const PieTooltip: React.FC<PieTooltipProps> = ({ active, payload, currency, total }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        style={{
          backgroundColor: "var(--cds-layer-01, #fff)",
          border: "none",
          borderRadius: "4px",
          padding: "12px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
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
          {((data.percent || (total ? data.value / total : 0)) * 100).toFixed(1)}%
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
      <EmptyState
        icon="chart"
        title="No asset data available"
        description="There are no assets to display for the selected filters. Try adjusting your time range or filters."
      />
    );
  }

  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [activeChart, setActiveChart] = useState<"bar" | "pie">("bar");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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

  const pieData = [...assetData]
    .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
    .slice(0, 8)
    .map((item, index) => ({
      name: item.name || "Unknown",
      value: item.totalCost || 0,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));

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

  const totalAssetCost = pieData.reduce((sum, item) => sum + item.value, 0);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return toCurrency(value, currency, 0);
  };

  const exportAsCSV = () => {
    const data = activeChart === "bar" ? sortedData : pieData;
    const headers = activeChart === "bar"
      ? ["Name", "CPU", "RAM", "GPU", "Total"]
      : ["Name", "Value"];
    const rows = data.map(item =>
      activeChart === "bar"
        ? [item.name, (item as typeof sortedData[0]).CPU, (item as typeof sortedData[0]).RAM, (item as typeof sortedData[0]).GPU, (item as typeof sortedData[0]).total]
        : [item.name, (item as typeof pieData[0]).value]
    );
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets-${activeChart}-chart.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const exportAsJSON = () => {
    const data = activeChart === "bar" ? sortedData : pieData;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets-${activeChart}-chart.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "-0.5rem",
          marginBottom: "1.5rem",
          width: "100%"
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: 600,
            color: "var(--cds-text-primary)",
            textAlign: "center",
          }}
        >
          Cost Breakdown
        </h3>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "2rem",
          alignItems: "center",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", height: height, minWidth: 0, display: "flex", justifyContent: "center" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
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

        <div style={{ width: "100%", height: height, minWidth: 0, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={140}
                paddingAngle={1}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip currency={currency} total={totalAssetCost} />} />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan x="50%" dy="-0.47em" style={{ fontSize: "28px", fontWeight: "bold", fill: "var(--cds-text-primary)" }}>Total Cost</tspan>
                <tspan x="50%" dy="1.3em" style={{ fontSize: "24px", fontWeight: "bold", fill: "var(--cds-text-primary)" }}>{toCurrency(totalAssetCost, currency, 0)}</tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", top: "4px", right: "10px", zIndex: 10 }}>
            <Button
              hasIconOnly
              renderIcon={Maximize}
              iconDescription="Fullscreen"
              kind="ghost"
              size="sm"
              onClick={() => setFullscreenOpen(true)}
            />
          </div>
          <div style={{ position: "absolute", top: "4px", left: "-24px", pointerEvents: "none", color: "var(--cds-text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowLeft size={24} stroke="2" />
              <span style={{ fontSize: "20px", fontWeight: 500 }}>Component Cost</span>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: "4px", right: "4px", pointerEvents: "none", color: "var(--cds-text-secondary)", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowUpLeft size={20} />
              <span style={{ fontSize: "20px", fontWeight: 500 }}>Machine Cost</span>
            </div>
          </div>
          {pieData.length > 0 && (
            <div style={{ position: "absolute", bottom: "4px", left: "6px", textAlign: "left", pointerEvents: "none" }}>
              <div style={{ fontSize: "14px", color: "var(--cds-text-secondary)", marginBottom: "4px" }}>Top: {pieData[0].name}</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--cds-text-primary)" }}>{toCurrency(pieData[0].value, currency, 0)}</div>
            </div>
          )}

        </div>
      </div>
      {fullscreenOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 9000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setFullscreenOpen(false)}
        >
          <div
            style={{
              width: "90%",
              height: "90%",
              backgroundColor: "var(--cds-layer-01, #fff)",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with toggle, export, and close */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              {/* Chart Toggle */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setActiveChart("bar")}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: activeChart === "bar" ? "var(--cds-interactive-01, #0066ff)" : "var(--cds-layer-02, #e0e0e0)",
                    color: activeChart === "bar" ? "#fff" : "var(--cds-text-primary)",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Bar Chart
                </button>
                <button
                  onClick={() => setActiveChart("pie")}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: activeChart === "pie" ? "var(--cds-interactive-01, #0066ff)" : "var(--cds-layer-02, #e0e0e0)",
                    color: activeChart === "pie" ? "#fff" : "var(--cds-text-primary)",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Pie Chart
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <Button
                    hasIconOnly
                    renderIcon={Download}
                    iconDescription="Export"
                    kind="ghost"
                    size="md"
                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  />
                  {exportMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        backgroundColor: "var(--cds-layer-01, #fff)",
                        borderRadius: "4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        zIndex: 10,
                        minWidth: "120px",
                      }}
                    >
                      <button
                        onClick={exportAsCSV}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 16px",
                          border: "none",
                          backgroundColor: "transparent",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={exportAsJSON}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 16px",
                          border: "none",
                          backgroundColor: "transparent",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        Export JSON
                      </button>
                    </div>
                  )}
                </div>
                <Button
                  hasIconOnly
                  renderIcon={Close}
                  iconDescription="Close"
                  kind="ghost"
                  size="md"
                  onClick={() => setFullscreenOpen(false)}
                />
              </div>
            </div>

            <div style={{ flex: 1, width: "100%", overflow: "hidden" }}>
              {activeChart === "bar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
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
                      width={120}
                      tick={{ fill: "var(--cds-text-primary)", fontSize: 14 }}
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
              ) : (
                <div style={{ display: "flex", width: "100%", height: "100%", gap: "1rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={120}
                          outerRadius={240}
                          paddingAngle={1}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip currency={currency} total={totalAssetCost} />} />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan x="50%" dy="-0.47em" style={{ fontSize: "28px", fontWeight: "bold", fill: "var(--cds-text-primary)" }}>Total Cost</tspan>
                          <tspan x="50%" dy="1.3em" style={{ fontSize: "24px", fontWeight: "bold", fill: "var(--cds-text-primary)" }}>{toCurrency(totalAssetCost, currency, 0)}</tspan>
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, height: "100%", overflowY: "auto", border: "1px solid var(--cds-border-subtle-01, #e0e0e0)", borderRadius: "4px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "var(--cds-layer-02, #f4f4f4)", borderBottom: "1px solid var(--cds-border-subtle-01, #e0e0e0)" }}>
                          <th style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "var(--cds-layer-02, #f4f4f4)", textAlign: "left", padding: "12px 16px", color: "var(--cds-text-secondary)", fontSize: "12px", borderRight: "1px solid var(--cds-border-subtle-01, #e0e0e0)" }}>Name</th>
                          <th style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "var(--cds-layer-02, #f4f4f4)", textAlign: "right", padding: "12px 16px", color: "var(--cds-text-secondary)", fontSize: "12px", borderRight: "1px solid var(--cds-border-subtle-01, #e0e0e0)" }}>Cost</th>
                          <th style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "var(--cds-layer-02, #f4f4f4)", textAlign: "right", padding: "12px 16px", color: "var(--cds-text-secondary)", fontSize: "12px" }}>%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...assetData]
                          .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
                          .map((item, idx) => {
                            const cost = item.totalCost || 0;
                            const percent = totalAssetCost > 0 ? (cost / totalAssetCost) * 100 : 0;
                            return (
                              <tr key={idx} style={{ borderBottom: "1px solid var(--cds-border-subtle-01, #e0e0e0)" }}>
                                <td style={{ padding: "12px 16px", color: "var(--cds-text-primary)", borderRight: "1px solid var(--cds-border-subtle-01, #e0e0e0)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{
                                      width: "12px",
                                      height: "12px",
                                      backgroundColor: idx < 8 ? PIE_COLORS[idx % PIE_COLORS.length] : "#a8a8a8",
                                      borderRadius: "2px"
                                    }} />
                                    {item.name || "Unknown"}
                                  </div>
                                </td>
                                <td style={{ textAlign: "right", padding: "12px 16px", color: "var(--cds-text-primary)", fontWeight: 500, borderRight: "1px solid var(--cds-border-subtle-01, #e0e0e0)" }}>
                                  {toCurrency(cost, currency, 2)}
                                </td>
                                <td style={{ textAlign: "right", padding: "12px 16px", color: "var(--cds-text-secondary)" }}>
                                  {percent.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default AssetsChart;
