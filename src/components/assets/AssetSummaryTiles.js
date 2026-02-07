import * as React from "react";
import { Box, Paper, Typography, Chip } from "@mui/material";
import { toCurrency } from "../../util";

/**
 * AssetTypeTile - Summary tile for each asset type with click-to-filter
 */
const AssetTypeTile = ({ type, cost, count, color, onClick, isActive }) => {
  return (
    <Paper
      elevation={isActive ? 8 : 2}
      sx={{
        p: 3,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: isActive ? `3px solid ${color}` : "3px solid transparent",
        borderRadius: "12px",
        background: isActive
          ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
          : "white",
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: `0 12px 24px ${color}30`,
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
          {type}
        </Typography>
        <Chip
          label={count}
          size="small"
          sx={{
            backgroundColor: color,
            color: "white",
            fontWeight: 700,
            minWidth: 40,
          }}
        />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
        {cost}
      </Typography>
    </Paper>
  );
};

/**
 * AssetSummaryTiles - Grid of tiles showing cost by asset type
 */
const AssetSummaryTiles = ({
  assetsByType,
  currency,
  onTypeClick,
  activeType,
}) => {
  const typeColors = {
    Node: "#0f62fe",
    Disk: "#8a3ffc",
    Network: "#0072c3",
    LoadBalancer: "#198038",
    Management: "#fa4d56",
    Other: "#878d96",
  };

  // Calculate totals per type
  const tileDat = Object.entries(assetsByType).map(([type, assets]) => {
    const totalCost = assets.reduce(
      (sum, asset) => sum + (asset.totalCost || 0),
      0,
    );
    return {
      type,
      cost: toCurrency(totalCost, currency),
      count: assets.length,
      color: typeColors[type] || typeColors.Other,
    };
  });

  // Sort by cost descending
  const sortedTiles = tileDat.sort((a, b) => {
    const aCost = parseFloat(a.cost.replace(/[^0-9.-]+/g, ""));
    const bCost = parseFloat(b.cost.replace(/[^0-9.-]+/g, ""));
    return bCost - aCost;
  });

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 3,
        mb: 4,
      }}
    >
      {sortedTiles.map((tile) => (
        <AssetTypeTile
          key={tile.type}
          {...tile}
          onClick={() => onTypeClick(tile.type)}
          isActive={activeType === tile.type}
        />
      ))}
    </Box>
  );
};

export default AssetSummaryTiles;
