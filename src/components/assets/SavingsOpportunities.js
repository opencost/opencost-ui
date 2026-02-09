import React, { useMemo } from "react";
import { Tile, Heading, Tag } from "@carbon/react";
import { toCurrency } from "../../util";

const SavingsOpportunities = ({ assets, currency }) => {
  const { underutilized, anomalies, totalPotentialSavings, avgNodeCost } = useMemo(() => {
    const under = assets
      .filter((a) => a.type === "Node" && a.cpuBreakdown)
      .map((a) => {
        const cpuUtil = (1 - (a.cpuBreakdown.idle || 0)) * 100;
        const ramUtil = a.ramBreakdown ? (1 - (a.ramBreakdown.idle || 0)) * 100 : null;
        const wasteRatio = Math.max(0, 1 - cpuUtil / 100);
        const potentialSavings = (a.totalCost || 0) * wasteRatio * 0.5;
        return { ...a, cpuUtil, ramUtil, potentialSavings };
      })
      .filter((a) => a.cpuUtil < 30)
      .sort((a, b) => b.potentialSavings - a.potentialSavings)
      .slice(0, 5);

    const nodeAssets = assets.filter((a) => a.type === "Node" && a.totalCost > 0);
    const avgCost = nodeAssets.length > 0
      ? nodeAssets.reduce((s, a) => s + (a.totalCost || 0), 0) / nodeAssets.length
      : 0;
    const anom = nodeAssets
      .filter((a) => a.totalCost > avgCost * 2)
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 3);

    return {
      underutilized: under,
      anomalies: anom,
      totalPotentialSavings: under.reduce((s, a) => s + a.potentialSavings, 0),
      avgNodeCost: avgCost,
    };
  }, [assets]);

  if (underutilized.length === 0 && anomalies.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <Heading size="sm" style={{ marginBottom: 12, fontSize: "1.4rem", fontWeight: 700 }}>
        Savings Opportunities
      </Heading>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {totalPotentialSavings > 0 && (
          <Tile
            style={{
              padding: 16,
              border: "1px solid #c8e6c9",
              borderRadius: 6,
              backgroundColor: "#f1f8e9",
              boxShadow: "none",
            }}
          >
            <p
              style={{ textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.65rem", fontWeight: 600, color: "#2e7d32", margin: 0 }}
            >
              Estimated Potential Savings
            </p>
            <Heading style={{ fontWeight: 700, color: "#2e7d32", marginTop: 6, fontSize: "1.05rem" }}>
              {toCurrency(totalPotentialSavings, currency)}
            </Heading>
            <p style={{ color: "#6f6f6f", fontSize: "0.875rem", margin: 0 }}>
              from {underutilized.length} underutilized {underutilized.length === 1 ? "asset" : "assets"}
            </p>
          </Tile>
        )}

        {underutilized.map((asset) => (
          <Tile
            key={asset.key}
            style={{
              padding: 16,
              border: "1px solid #ffcdd2",
              borderRadius: 6,
              backgroundColor: "#fff8f8",
              boxShadow: "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <p
                style={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "65%",
                  margin: 0,
                }}
                title={asset.properties?.name || asset.key || ""}
              >
                {asset.properties?.name || asset.key || "Unknown"}
              </p>
              <Tag type="red">{asset.cpuUtil.toFixed(0)}% CPU</Tag>
            </div>
            <p style={{ color: "#6f6f6f", fontSize: "0.875rem", margin: 0 }}>
              Cost: {toCurrency(asset.totalCost || 0, currency)} | Save approx {toCurrency(asset.potentialSavings, currency)}
            </p>
            {asset.ramUtil !== null && (
              <p style={{ color: "#6f6f6f", fontSize: "0.875rem", margin: 0 }}>
                RAM utilization: {asset.ramUtil.toFixed(0)}%
              </p>
            )}
            <p style={{ color: "#e65100", fontWeight: 600, marginTop: 6, fontSize: "0.875rem", marginBottom: 0 }}>
              Consider right-sizing or scaling down
            </p>
          </Tile>
        ))}

        {anomalies.map((asset) => (
          <Tile
            key={`anomaly-${asset.key}`}
            style={{
              padding: 16,
              border: "1px solid #fff3e0",
              borderRadius: 6,
              backgroundColor: "#fffde7",
              boxShadow: "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <p
                style={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "65%",
                  margin: 0,
                }}
                title={asset.properties?.name || asset.key || ""}
              >
                {asset.properties?.name || asset.key || "Unknown"}
              </p>
              <Tag type="yellow">High Cost</Tag>
            </div>
            <p style={{ color: "#6f6f6f", fontSize: "0.875rem", margin: 0 }}>
              {toCurrency(asset.totalCost || 0, currency)} - {((asset.totalCost / avgNodeCost) * 100 - 100).toFixed(0)}% above average
            </p>
            <p style={{ color: "#f57c00", fontWeight: 600, marginTop: 6, fontSize: "0.875rem", marginBottom: 0 }}>
              Cost spike - review resource allocation
            </p>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SavingsOpportunities);
