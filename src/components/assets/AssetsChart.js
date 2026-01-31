import React from "react";
import { toCurrency } from "../../util";

const AssetsChart = ({ assetData = [], currency = "USD", height = 300, n = 10 }) => {
  if (!assetData || assetData.length === 0) {
    return null;
  }

  const sortedData = [...assetData]
    .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
    .slice(0, n);

  const maxCost = Math.max(...sortedData.map(d => (d.totalCost || 0)), 1);
  const barHeight = 32;
  const gap = 12;
  const margin = { top: 20, right: 120, bottom: 60, left: 140 };
  const chartWidth = 800;
  const chartHeight = sortedData.length * (barHeight + gap) + margin.top + margin.bottom;
  const innerWidth = chartWidth - margin.left - margin.right;

  const formatValue = (val) => toCurrency(val, currency, true);

  return (
    <div style={{ width: "100%", overflowX: "auto", padding: "1rem 0" }}>
      <svg width={chartWidth} height={chartHeight} style={{ display: "block" }}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const x = tick * innerWidth;
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={sortedData.length * (barHeight + gap) - gap}
                  stroke="var(--cds-border-subtle-01)"
                  strokeDasharray="2,2"
                />
                <text
                  x={x}
                  y={sortedData.length * (barHeight + gap) - gap + 20}
                  textAnchor="middle"
                  fill="var(--cds-text-secondary)"
                  fontSize="11"
                >
                  {formatValue(maxCost * tick)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {sortedData.map((item, index) => {
            const y = index * (barHeight + gap);
            const total = item.totalCost || 0;
            const cpu = item.cpuCost || 0;
            const ram = item.ramCost || 0;
            const gpu = item.gpuCost || 0;

            const barWidth = (total / maxCost) * innerWidth;
            const cpuWidth = (cpu / total) * barWidth || 0;
            const ramWidth = (ram / total) * barWidth || 0;
            const gpuWidth = (gpu / total) * barWidth || 0;

            let currentX = 0;

            return (
              <g key={index}>
                {/* Label */}
                <text
                  x={-10}
                  y={y + barHeight / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="var(--cds-text-primary)"
                  fontSize="12"
                  style={{ fontWeight: 400 }}
                >
                  {item.name || "Unknown"}
                </text>

                {/* CPU segment */}
                {cpuWidth > 0.5 && (
                  <rect
                    x={currentX}
                    y={y}
                    width={cpuWidth}
                    height={barHeight}
                    fill="#0f62fe"
                    rx={2}
                  />
                )}
                currentX += cpuWidth;

                {/* RAM segment */}
                {ramWidth > 0.5 && (
                  <rect
                    x={currentX}
                    y={y}
                    width={ramWidth}
                    height={barHeight}
                    fill="#8a3ffc"
                    rx={2}
                  />
                )}
                currentX += ramWidth;

                {/* GPU segment */}
                {gpuWidth > 0.5 && (
                  <rect
                    x={currentX}
                    y={y}
                    width={gpuWidth}
                    height={barHeight}
                    fill="#009d9a"
                    rx={2}
                  />
                )}

                {/* Total value label */}
                <text
                  x={barWidth + 8}
                  y={y + barHeight / 2}
                  dominantBaseline="middle"
                  fill="var(--cds-text-secondary)"
                  fontSize="11"
                >
                  {formatValue(total)}
                </text>
              </g>
            );
          })}

          {/* X-axis line */}
          <line
            x1={0}
            y1={sortedData.length * (barHeight + gap) - gap}
            x2={innerWidth}
            y2={sortedData.length * (barHeight + gap) - gap}
            stroke="var(--cds-border-strong-01)"
          />
        </g>

        {/* Legend */}
        <g transform={`translate(${margin.left}, ${chartHeight - 30})`}>
          {[
            { label: "CPU", color: "#0f62fe" },
            { label: "RAM", color: "#8a3ffc" },
            { label: "GPU", color: "#009d9a" },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(${i * 80}, 0)`}>
              <rect width={12} height={12} fill={item.color} rx={2} />
              <text
                x={18}
                y={10}
                fill="var(--cds-text-primary)"
                fontSize="12"
                dominantBaseline="middle"
              >
                {item.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default AssetsChart;
