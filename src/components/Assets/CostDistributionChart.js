import React, { useState } from "react";
import { Dropdown } from "@carbon/react";
import CostBarChart from "./CostBarChart";
import CostLineChart from "./CostLineChart";
import "./CostDistributionChart.css";

const COLORS = {
    node: "#0f62fe",
    disk: "#8a3ffc",
    network: "#33b1ff",
    loadbalancer: "#007d79",
    bucket: "#ff7eb6",
    "cluster-management": "#fa4d56",
};

const CostDistributionChart = ({ assets, currency = "USD" }) => {
    const [chartType, setChartType] = useState("pie");

    const chartTypes = [
        { id: "pie", label: "Pie Chart" },
        { id: "bar", label: "Bar Chart" },
        { id: "line", label: "Line Chart" },
    ];

    // Calculate cost by type
    const costByType = {};
    Object.values(assets).forEach(asset => {
        if (!costByType[asset.type]) {
            costByType[asset.type] = 0;
        }
        costByType[asset.type] += asset.totalCost;
    });

    const total = Object.values(costByType).reduce((sum, cost) => sum + cost, 0);

    // Convert to percentages and create pie slices
    const data = Object.entries(costByType).map(([type, cost]) => ({
        type,
        cost,
        percentage: (cost / total) * 100
    })).sort((a, b) => b.cost - a.cost);

    // Calculate pie slice paths
    let currentAngle = -90; // Start at top
    const slices = data.map(item => {
        const angle = (item.percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        // Convert to radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        // Calculate arc path
        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

        return {
            ...item,
            path,
            color: COLORS[item.type] || "#8d8d8d"
        };
    });

    return (
        <div className="cost-distribution-chart">
            <div className="chart-header">
                <h4>Cost Distribution by Asset Type</h4>
                <Dropdown
                    id="chart-type-selector"
                    titleText=""
                    label="Select chart type"
                    items={chartTypes}
                    itemToString={(item) => (item ? item.label : "")}
                    selectedItem={chartTypes.find(t => t.id === chartType)}
                    onChange={({ selectedItem }) => setChartType(selectedItem.id)}
                    size="sm"
                />
            </div>

            {chartType === "pie" && (
                <div className="chart-container">
                    <svg viewBox="0 0 100 100" className="pie-chart">
                        {slices.map((slice, index) => (
                            <path
                                key={slice.type}
                                d={slice.path}
                                fill={slice.color}
                                className="pie-slice"
                            />
                        ))}
                    </svg>
                    <div className="chart-legend">
                        {data.map(item => (
                            <div key={item.type} className="legend-item">
                                <span
                                    className="legend-color"
                                    style={{ backgroundColor: COLORS[item.type] || "#8d8d8d" }}
                                />
                                <span className="legend-label">{item.type}</span>
                                <span className="legend-value">{item.percentage.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {chartType === "bar" && <CostBarChart assets={assets} currency={currency} />}
            {chartType === "line" && <CostLineChart assets={assets} currency={currency} />}
        </div>
    );
};

export default CostDistributionChart;
