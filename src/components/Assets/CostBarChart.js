import React from "react";
import "./CostBarChart.css";
import { toCurrency } from "../../util";

const COLORS = {
    node: "#0f62fe",
    disk: "#8a3ffc",
    network: "#33b1ff",
    loadbalancer: "#007d79",
    bucket: "#ff7eb6",
    "cluster-management": "#fa4d56",
};

const CostBarChart = ({ assets, currency = "USD" }) => {
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

    return (
        <div className="cost-bar-chart">
            <div className="bar-chart-container">
                {data.map(item => {
                    const percentage = (item.cost / maxCost) * 100;
                    return (
                        <div key={item.type} className="bar-item">
                            <div className="bar-label">{item.type}</div>
                            <div className="bar-wrapper">
                                <div
                                    className="bar-fill"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: COLORS[item.type] || "#8d8d8d"
                                    }}
                                />
                            </div>
                            <div className="bar-value">{toCurrency(item.cost, currency, 2)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CostBarChart;
