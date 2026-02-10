import React from "react";
import { SkeletonText, ProgressBar } from "@carbon/react";

const WastePercentageGauge = ({ wastePercentage, idleCost, isLoading = false }) => {
    if (isLoading) {
        return (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "4px", padding: "1.5rem", height: "100%", minHeight: "350px", border: "1px solid var(--cds-border-subtle-01)" }}>
                <SkeletonText heading style={{ marginBottom: "1rem" }} />
                <SkeletonText paragraph lineCount={3} />
            </div>
        );
    }

    // Determine color based on waste percentage
    const getWasteLevel = (percentage) => {
        if (percentage < 15) return { level: "Excellent", color: "#24a148" }; // Green
        if (percentage < 30) return { level: "Moderate", color: "#f1c21b" }; // Yellow
        return { level: "High", color: "#da1e28" }; // Red
    };

    const wasteLevel = getWasteLevel(wastePercentage);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "4px", padding: "1.5rem", height: "100%", minHeight: "350px", border: "1px solid var(--cds-border-subtle-01)" }}>
            <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600 }}>
                    Resource Waste Analysis
                </h4>
                <p style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)", marginBottom: "1rem" }}>
                    Idle resources as percentage of total cost
                </p>
            </div>

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{
                    fontSize: "4rem",
                    fontWeight: 700,
                    color: wasteLevel.color,
                    lineHeight: 1
                }}>
                    {wastePercentage.toFixed(1)}%
                </div>
                <div style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--cds-text-secondary)",
                    marginTop: "0.5rem"
                }}>
                    Resource Waste
                </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <ProgressBar
                    value={wastePercentage}
                    max={100}
                    label="Waste percentage"
                    hideLabel
                />
            </div>

            <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--cds-border-subtle-01)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        Waste Level:
                    </span>
                    <span
                        style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: wasteLevel.color,
                        }}
                    >
                        {wasteLevel.level}
                    </span>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--cds-text-secondary)" }}>
                    <div style={{ marginBottom: "0.25rem" }}>
                        <strong>Idle CPU:</strong> {formatCurrency(idleCost?.cpu || 0)}
                    </div>
                    <div style={{ marginBottom: "0.25rem" }}>
                        <strong>Idle RAM:</strong> {formatCurrency(idleCost?.ram || 0)}
                    </div>
                    {idleCost?.gpu > 0 && (
                        <div style={{ marginBottom: "0.25rem" }}>
                            <strong>Idle GPU:</strong> {formatCurrency(idleCost.gpu)}
                        </div>
                    )}
                    <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--cds-border-subtle-01)" }}>
                        <strong>Total Idle:</strong> {formatCurrency(idleCost?.total || 0)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WastePercentageGauge;
