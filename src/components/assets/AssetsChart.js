import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTheme } from "../../context/ThemeContext";

const COLORS = {
    Node: "#00d4aa",
    Disk: "#8b5cf6",
    LoadBalancer: "#06b6d4",
    Network: "#f59e0b",
    ClusterManagement: "#6b7280",
};

const COLOR_ARRAY = ["#00d4aa", "#8b5cf6", "#06b6d4", "#f59e0b", "#6b7280", "#ec4899", "#10b981"];

const AssetsChart = ({ assets = [], currency = "USD" }) => {
    const { colors, isDark } = useTheme();

    const chartData = assets
        .filter((asset) => asset.totalCost > 0)
        .map((asset, index) => ({
            name: asset.type || asset.name,
            value: Math.round(asset.totalCost * 100) / 100,
            color: COLORS[asset.type || asset.name] || COLOR_ARRAY[index % COLOR_ARRAY.length],
        }))
        .sort((a, b) => b.value - a.value);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div
                    style={{
                        backgroundColor: colors.backgroundSecondary,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "8px",
                        padding: "12px",
                        color: colors.text,
                    }}
                >
                    <p style={{ margin: 0, fontWeight: 600, color: data.color }}>{data.name}</p>
                    <p style={{ margin: "4px 0 0", color: colors.text }}>{formatCurrency(data.value)}</p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="600">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (chartData.length === 0) {
        return (
            <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted }}>
                No data available
            </div>
        );
    }

    return (
        <div
            style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: "12px",
                padding: "1.5rem",
                height: "100%",
                border: `1px solid ${colors.border}`,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ color: colors.text, margin: 0, fontSize: "1rem", fontWeight: 500 }}>
                    Cost by Asset Type
                </h3>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        innerRadius={0}
                        dataKey="value"
                        stroke={colors.backgroundSecondary}
                        strokeWidth={2}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: "20px" }}
                        formatter={(value) => <span style={{ color: colors.text, fontSize: "12px" }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AssetsChart;
