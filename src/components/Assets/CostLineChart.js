import React, { useState } from "react";
import "./CostLineChart.css";
import { toCurrency } from "../../util";

const COLORS = {
    node: "#0f62fe",
    disk: "#8a3ffc",
    network: "#33b1ff",
    loadbalancer: "#007d79",
    bucket: "#ff7eb6",
    "cluster-management": "#fa4d56",
};

const CostLineChart = ({ assets, currency = "USD" }) => {
    const [tooltip, setTooltip] = useState(null);

    // Calculate cost by type
    const costByType = {};
    Object.values(assets).forEach(asset => {
        if (!costByType[asset.type]) {
            costByType[asset.type] = 0;
        }
        costByType[asset.type] += asset.totalCost;
    });

    const data = Object.entries(costByType)
        .map(([type, cost]) => ({ type, cost }))
        .sort((a, b) => b.cost - a.cost);

    const maxCost = Math.max(...data.map(d => d.cost));
    const chartHeight = 200;
    const chartWidth = 400;
    const padding = 40;

    // Create points for the line
    const points = data.map((item, index) => {
        const x = padding + (index * (chartWidth - 2 * padding) / (data.length - 1 || 1));
        const y = chartHeight - padding - ((item.cost / maxCost) * (chartHeight - 2 * padding));
        return { x, y, ...item };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <div className="cost-line-chart">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="line-chart-svg">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                    const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding));
                    return (
                        <line
                            key={ratio}
                            x1={padding}
                            y1={y}
                            x2={chartWidth - padding}
                            y2={y}
                            stroke="#e0e0e0"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Line path */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="#0f62fe"
                    strokeWidth="2"
                />

                {/* Data points */}
                {points.map((point, index) => (
                    <g key={index}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill={COLORS[point.type] || "#0f62fe"}
                            className="data-point"
                            onMouseEnter={() => setTooltip({ ...point, index })}
                            onMouseLeave={() => setTooltip(null)}
                        />
                        {tooltip && tooltip.index === index && (
                            <g>
                                <rect
                                    x={point.x - 60}
                                    y={point.y - 50}
                                    width="120"
                                    height="40"
                                    fill="#161616"
                                    rx="4"
                                    opacity="0.9"
                                />
                                <text
                                    x={point.x}
                                    y={point.y - 32}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill="#ffffff"
                                    fontWeight="600"
                                >
                                    {point.type}
                                </text>
                                <text
                                    x={point.x}
                                    y={point.y - 18}
                                    textAnchor="middle"
                                    fontSize="14"
                                    fill="#ffffff"
                                    fontWeight="700"
                                >
                                    {toCurrency(point.cost, currency, 2)}
                                </text>
                            </g>
                        )}
                    </g>
                ))}

                {/* X-axis labels */}
                {points.map((point, index) => (
                    <text
                        key={index}
                        x={point.x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#525252"
                    >
                        {point.type}
                    </text>
                ))}
            </svg>
        </div>
    );
};

export default CostLineChart;
