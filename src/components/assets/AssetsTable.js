import React from "react";
import { useTheme } from "../../context/ThemeContext";

const formatCurrency = (value, currency = "USD") => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

const getTypeTagStyle = (type, isDark) => {
    const styles = {
        Node: { backgroundColor: "rgba(0, 212, 170, 0.15)", color: "#00d4aa", borderColor: "#00d4aa" },
        Disk: { backgroundColor: "rgba(139, 92, 246, 0.15)", color: "#a78bfa", borderColor: "#8b5cf6" },
        LoadBalancer: { backgroundColor: "rgba(6, 182, 212, 0.15)", color: "#22d3ee", borderColor: "#06b6d4" },
        Network: { backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", borderColor: "#f59e0b" },
        ClusterManagement: { backgroundColor: "rgba(107, 114, 128, 0.15)", color: "#9ca3af", borderColor: "#6b7280" },
    };
    return styles[type] || styles.ClusterManagement;
};

const AssetsTable = ({ assets = [], currency = "USD" }) => {
    const { colors, isDark } = useTheme();

    const headers = [
        { key: "name", label: "Asset Name", align: "left" },
        { key: "type", label: "Type", align: "left" },
        { key: "totalCost", label: "Total Cost", align: "right" },
        { key: "cpuCost", label: "CPU", align: "right" },
        { key: "ramCost", label: "RAM", align: "right" },
        { key: "gpuCost", label: "GPU", align: "right" },
    ];

    return (
        <div
            style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: "12px",
                padding: "1.5rem",
                height: "100%",
                overflow: "auto",
                border: `1px solid ${colors.border}`,
            }}
        >
            <h3 style={{ color: colors.text, margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 500 }}>
                Asset Details
            </h3>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", fontSize: "0.875rem" }}>
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header.key}
                                style={{
                                    padding: "0.75rem 1rem",
                                    textAlign: header.align,
                                    color: colors.textSecondary,
                                    fontWeight: "600",
                                    fontSize: "0.7rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    borderBottom: `2px solid ${colors.border}`,
                                    backgroundColor: colors.backgroundSecondary,
                                    position: "sticky",
                                    top: 0,
                                }}
                            >
                                {header.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset, index) => {
                        const tagStyle = getTypeTagStyle(asset.type, isDark);
                        return (
                            <tr
                                key={`${asset.name}-${index}`}
                                style={{ transition: "background-color 0.15s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.backgroundTertiary; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                                <td style={{ padding: "1rem", color: colors.text, fontWeight: "500", borderBottom: `1px solid ${colors.border}` }}>
                                    {asset.name}
                                </td>
                                <td style={{ padding: "1rem", borderBottom: `1px solid ${colors.border}` }}>
                                    <span
                                        style={{
                                            ...tagStyle,
                                            padding: "0.35rem 0.75rem",
                                            borderRadius: "6px",
                                            fontSize: "0.75rem",
                                            fontWeight: "600",
                                            border: `1px solid ${tagStyle.borderColor}`,
                                            display: "inline-block",
                                        }}
                                    >
                                        {asset.type}
                                    </span>
                                </td>
                                <td style={{ padding: "1rem", color: "#00d4aa", fontWeight: "600", textAlign: "right", borderBottom: `1px solid ${colors.border}` }}>
                                    {formatCurrency(asset.totalCost, currency)}
                                </td>
                                <td style={{ padding: "1rem", color: colors.text, textAlign: "right", borderBottom: `1px solid ${colors.border}` }}>
                                    {formatCurrency(asset.cpuCost, currency)}
                                </td>
                                <td style={{ padding: "1rem", color: colors.text, textAlign: "right", borderBottom: `1px solid ${colors.border}` }}>
                                    {formatCurrency(asset.ramCost, currency)}
                                </td>
                                <td style={{ padding: "1rem", color: colors.text, textAlign: "right", borderBottom: `1px solid ${colors.border}` }}>
                                    {formatCurrency(asset.gpuCost, currency)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {assets.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>
                    No assets data available
                </div>
            )}
        </div>
    );
};

export default AssetsTable;
