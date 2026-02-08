import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { Tile } from "@carbon/react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SpeedIcon from "@mui/icons-material/Speed";
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
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <TrendingDownIcon color="success" fontSize="small" />
        Savings Opportunities
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
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
            <Typography
              variant="caption"
              sx={{ textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.65rem", fontWeight: 600, color: "#2e7d32" }}
            >
              Estimated Potential Savings
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32", mt: 0.5 }}>
              {toCurrency(totalPotentialSavings, currency)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              from {underutilized.length} underutilized {underutilized.length === 1 ? "asset" : "assets"}
            </Typography>
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Tooltip title={asset.properties?.name || asset.key || ""}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}
                >
                  {asset.properties?.name || asset.key || "Unknown"}
                </Typography>
              </Tooltip>
              <Chip
                icon={<SpeedIcon sx={{ fontSize: 12 }} />}
                label={`${asset.cpuUtil.toFixed(0)}% CPU`}
                size="small"
                sx={{ backgroundColor: "#ffcdd2", color: "#c62828", fontWeight: 600, fontSize: "0.65rem" }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Cost: {toCurrency(asset.totalCost || 0, currency)} &bull; Save ~{toCurrency(asset.potentialSavings, currency)}
            </Typography>
            {asset.ramUtil !== null && (
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                RAM utilization: {asset.ramUtil.toFixed(0)}%
              </Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
              <WarningAmberIcon sx={{ fontSize: 14, color: "#e65100" }} />
              <Typography variant="caption" sx={{ color: "#e65100", fontWeight: 500 }}>
                Consider right-sizing or scaling down
              </Typography>
            </Box>
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Tooltip title={asset.properties?.name || asset.key || ""}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}
                >
                  {asset.properties?.name || asset.key || "Unknown"}
                </Typography>
              </Tooltip>
              <Chip
                label="High Cost"
                size="small"
                sx={{ backgroundColor: "#fff3e0", color: "#e65100", fontWeight: 600, fontSize: "0.65rem" }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              {toCurrency(asset.totalCost || 0, currency)} — {((asset.totalCost / avgNodeCost) * 100 - 100).toFixed(0)}% above average
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
              <WarningAmberIcon sx={{ fontSize: 14, color: "#f57c00" }} />
              <Typography variant="caption" sx={{ color: "#f57c00", fontWeight: 500 }}>
                Cost spike — review resource allocation
              </Typography>
            </Box>
          </Tile>
        ))}
      </Box>
    </Box>
  );
};

export default React.memo(SavingsOpportunities);
