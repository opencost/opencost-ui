import * as React from "react";
import { Box, Paper, Typography, Chip } from "@mui/material";
import { toCurrency } from "../../util";

/**
 * AssetTypeTile - Summary tile for each asset type with click-to-filter
 */
const AssetTypeTile = ({ type, cost, count, color, onClick, isActive }) => {
  return (
    <Paper
      sx={{
        p: 2,
        cursor: "pointer",
        transition: "all 0.2s",
        border: isActive ? `2px solid ${color}` : "2px solid transparent",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" color="textSecondary">
          {type}
        </Typography>
        <Chip
          label={count}
          size="small"
          sx={{ backgroundColor: color, color: "white" }}
        />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
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
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 2,
        mb: 3,
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
