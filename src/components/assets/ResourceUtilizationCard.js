import React from "react";
import { Tile, SkeletonText, ProgressBar } from "@carbon/react";
import { Chip, Dashboard } from "@carbon/icons-react";

const ResourceUtilizationCard = ({ resourceType, efficiency, isLoading = false }) => {
    if (isLoading) {
        return (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "4px", padding: "1.5rem", height: "100%", minHeight: "350px", border: "1px solid var(--cds-border-subtle-01)" }}>
                <SkeletonText heading style={{ marginBottom: "1rem" }} />
                <SkeletonText paragraph lineCount={2} />
            </div>
        );
    }

    // Determine color and status based on efficiency
    const getEfficiencyStatus = (eff) => {
        if (eff >= 70) return { status: "Good", color: "#24a148", bgColor: "rgba(36, 161, 72, 0.1)" }; // Green
        if (eff >= 40) return { status: "Moderate", color: "#f1c21b", bgColor: "rgba(241, 194, 27, 0.1)" }; // Yellow
        return { status: "Poor", color: "#da1e28", bgColor: "rgba(218, 30, 40, 0.1)" }; // Red
    };

    const efficiencyStatus = getEfficiencyStatus(efficiency);
    const Icon = resourceType === "CPU" ? Chip : Dashboard;

    return (
        <div
            style={{
                padding: "1.5rem",
                border: "1px solid var(--cds-border-subtle-01)",
                height: "100%",
                backgroundColor: "#ffffff",
                borderRadius: "4px",
                minHeight: "350px",
                
            }}
        >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        backgroundColor: efficiencyStatus.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "1rem",
                    }}
                >
                    <Icon size={24} style={{ color: efficiencyStatus.color }} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                        {resourceType} Utilization
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--cds-text-secondary)", margin: 0 }}>
                        Resource efficiency
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "2rem", fontWeight: 600, color: efficiencyStatus.color }}>
                        {efficiency.toFixed(1)}%
                    </span>
                    <span
                        style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            backgroundColor: efficiencyStatus.bgColor,
                            color: efficiencyStatus.color,
                        }}
                    >
                        {efficiencyStatus.status}
                    </span>
                </div>

                <ProgressBar
                    value={efficiency}
                    max={100}
                    label=""
                    hideLabel
                    status={efficiency >= 70 ? "finished" : efficiency >= 40 ? "active" : "error"}
                    style={{ marginTop: "0.5rem" }}
                />
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--cds-text-secondary)", paddingTop: "1rem", borderTop: "1px solid var(--cds-border-subtle-01)" }}>
                {efficiency >= 70 && (
                    <p style={{ margin: 0 }}>
                        ✓ Excellent {resourceType.toLowerCase()} utilization. Resources are being used efficiently.
                    </p>
                )}
                {efficiency >= 40 && efficiency < 70 && (
                    <p style={{ margin: 0 }}>
                        ⚠ Moderate {resourceType.toLowerCase()} utilization. Consider optimizing resource requests.
                    </p>
                )}
                {efficiency < 40 && (
                    <p style={{ margin: 0 }}>
                        ✗ Low {resourceType.toLowerCase()} utilization. Significant waste detected. Review resource allocations.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ResourceUtilizationCard;
