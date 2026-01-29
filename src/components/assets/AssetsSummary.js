import React from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { useTheme } from "../../context/ThemeContext";

const formatCurrency = (value, currency = "USD") => {
    if (value === undefined || value === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

const generateSparklineData = (seed) => {
    const data = [];
    let value = 30 + seed * 5;
    for (let i = 0; i < 15; i++) {
        value += Math.random() * 15 - 5;
        value = Math.max(10, Math.min(90, value));
        data.push(value);
    }
    data.push(value + 5);
    data.push(value + 10);
    return data;
};

const StatCard = ({ label, value, color, showSparkline = true, seed = 1, icon, colors }) => {
    const sparklineData = generateSparklineData(seed);

    return (
        <div
            style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: "12px",
                padding: "1.25rem",
                minWidth: "160px",
                flex: "1 1 160px",
                position: "relative",
                overflow: "hidden",
                border: `1px solid ${colors.border}`,
                transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.7rem", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "500" }}>
                    {label}
                </span>
                {icon && <span style={{ fontSize: "1rem", opacity: 0.6 }}>{icon}</span>}
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: "700", color: color, marginBottom: showSparkline ? "0.75rem" : "0", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                {value}
            </div>
            {showSparkline && (
                <div style={{ height: "35px", marginTop: "auto" }}>
                    <Sparklines data={sparklineData} height={35} margin={2}>
                        <SparklinesLine color={color} style={{ strokeWidth: 1.5, fill: "none" }} />
                    </Sparklines>
                </div>
            )}
        </div>
    );
};

const AssetsSummary = ({ totals = {}, currency = "USD" }) => {
    const { colors } = useTheme();

    const stats = [
        { label: "Total Cost", value: formatCurrency(totals.totalCost, currency), color: "#00d4aa", seed: 1, icon: "💰" },
        { label: "CPU Cost", value: formatCurrency(totals.cpuCost, currency), color: "#8b5cf6", seed: 2, icon: "⚡" },
        { label: "RAM Cost", value: formatCurrency(totals.ramCost, currency), color: "#06b6d4", seed: 3, icon: "🧠" },
        { label: "GPU Cost", value: formatCurrency(totals.gpuCost, currency), color: "#f59e0b", seed: 4, icon: "🎮" },
        { label: "Total Assets", value: totals.assetCount || 0, color: colors.text, seed: 5, icon: "📊", showSparkline: false },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {stats.map((stat, index) => (
                <StatCard key={`${stat.label}-${index}`} {...stat} colors={colors} />
            ))}
        </div>
    );
};

export default AssetsSummary;
