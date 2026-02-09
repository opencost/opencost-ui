import React from "react";
import { formatCurrency, typeColors } from "../../utils/assets";
import { ServerDns, Cube, CloudApp } from "@carbon/icons-react";

// Local constants until utility file is created
const getTypeIcon = (type) => {
    switch (type) {
        case "Node": return <ServerDns size={20} />;
        case "Disk": return <Cube size={20} />;
        case "LoadBalancer": return <CloudApp size={20} />;
        default: return null;
    }
};

const MetricCard = ({ title, value, icon, theme, trend }) => {
    // Fallback if theme is missing (during hot reload or if not passed)
    if (!theme) return null;

    return (
        <div
            style={{
                background: theme.bg,
                border: "none",
                borderRadius: "24px",
                padding: "24px",
                color: theme.text,
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)`,
                transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                // Removed backdrop-filter
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                // Dynamic Colored Glow based on theme.border
                e.currentTarget.style.boxShadow = `0 12px 20px -5px ${theme.border || 'rgba(0,0,0,0.1)'}, 0 4px 6px -2px rgba(0, 0, 0, 0.05)`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)`;
            }}
        >
            {/* Removed glass overlay */}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1, position: "relative" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, opacity: 0.9, letterSpacing: "0.02em", textTransform: "uppercase" }}>{title}</span>
                <div style={{
                    background: "rgba(255,255,255,0.6)", // Semi-transparent white based on card's bg
                    borderRadius: "12px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.text,
                }}>
                    {icon}
                </div>
            </div>
            <div style={{ zIndex: 1, position: "relative" }}>
                <div style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "4px" }}>{value}</div>
                {trend && (
                    <div style={{ fontSize: "13px", fontWeight: 600, opacity: 0.75 }}>
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetricCard;
