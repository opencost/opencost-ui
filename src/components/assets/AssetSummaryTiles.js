import * as React from "react";
import { ClickableTile, Grid, Column, Tag } from "@carbon/react";
import { toCurrency } from "../../util";

/**
 * AssetTypeTile - Interactive summary tile with detailed cost metrics
 * Shows cost, asset count, and visual indicators for active state
 */
const AssetTypeTile = ({ type, cost, count, color, onClick, isActive, rawCost, percentage }) => {
  return (
    <ClickableTile
      onClick={onClick}
      style={{
        padding: "1.5rem",
        border: isActive ? `2px solid ${color}` : "1px solid #e0e0e0",
        backgroundColor: "white",
        height: "100%",
        transition: "all 0.2s ease",
        boxShadow: isActive ? `0 8px 16px ${color}30` : "0 2px 4px rgba(0,0,0,0.08)",
        transform: isActive ? "translateY(-2px)" : "none",
        borderRadius: "8px",
      }}
    >
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "0.75rem",
        marginBottom: "1rem",
        paddingBottom: "0.75rem",
        borderBottom: `2px solid ${color}`,
      }}>
        <div style={{
          width: "8px",
          height: "40px",
          backgroundColor: color,
          borderRadius: "4px",
        }} />
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: "0.875rem", 
            fontWeight: 600, 
            color: "#161616",
            marginBottom: "0.25rem",
          }}>
            {type}
          </h4>
          <span style={{ 
            fontSize: "0.75rem",
            color: "#525252",
            fontWeight: 500,
          }}>
            {count} {count === 1 ? 'asset' : 'assets'}
          </span>
        </div>
      </div>
      
      <div style={{ 
        fontSize: "1.75rem", 
        fontWeight: 700, 
        color: "#161616", 
        marginBottom: "0.5rem",
        lineHeight: 1,
      }}>
        {cost}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {percentage !== undefined && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            padding: "0.5rem",
            backgroundColor: `${color}08`,
            borderRadius: "4px",
          }}>
            <div style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: color,
              minWidth: "50px",
            }}>
              {percentage}%
            </div>
            <span style={{ fontSize: "0.75rem", color: "#525252" }}>
              of total
            </span>
          </div>
        )}
        <div style={{ 
          fontSize: "0.75rem", 
          color: "#525252",
          padding: "0.5rem",
          backgroundColor: "#f4f4f4",
          borderRadius: "4px",
        }}>
          <strong style={{ color: "#161616" }}>{toCurrency(rawCost / count, 'USD')}</strong> average per asset
        </div>
      </div>
    </ClickableTile>
  );
};

/**
 * AssetSummaryTiles - Grid of interactive tiles with comprehensive cost metrics
 * Professional presentation with percentages and averages
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

  // Calculate totals and metrics per type
  const tileData = Object.entries(assetsByType).map(([type, assets]) => {
    const totalCost = assets.reduce(
      (sum, asset) => sum + (asset.totalCost || 0),
      0,
    );
    return {
      type,
      rawCost: totalCost,
      cost: toCurrency(totalCost, currency),
      count: assets.length,
      color: typeColors[type] || typeColors.Other,
    };
  });

  // Calculate grand total for percentages
  const grandTotal = tileData.reduce((sum, tile) => sum + tile.rawCost, 0);

  // Add percentage to each tile
  const tilesWithPercentage = tileData.map(tile => ({
    ...tile,
    percentage: grandTotal > 0 ? ((tile.rawCost / grandTotal) * 100).toFixed(1) : 0,
  }));

  // Sort by cost descending
  const sortedTiles = tilesWithPercentage.sort((a, b) => b.rawCost - a.rawCost);

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ 
        marginBottom: "1.5rem", 
        padding: "1.5rem", 
        background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}>
        <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#161616", marginBottom: "0.25rem" }}>
          Infrastructure Cost Summary
        </h3>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#525252", marginBottom: "1rem" }}>
          Click any tile to filter the data table below
        </p>
        <div style={{ 
          display: "flex", 
          gap: "2rem",
          padding: "1rem 1.5rem",
          backgroundColor: "white",
          borderRadius: "6px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          width: "fit-content",
        }}>
          <div style={{ textAlign: "center", minWidth: "120px" }}>
            <div style={{ fontSize: "0.75rem", color: "#525252", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Cost
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#161616", whiteSpace: "nowrap" }}>
              {toCurrency(grandTotal, currency)}
            </div>
          </div>
          <div style={{ width: "1px", backgroundColor: "#e0e0e0" }} />
          <div style={{ textAlign: "center", minWidth: "120px" }}>
            <div style={{ fontSize: "0.75rem", color: "#525252", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Assets
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#161616" }}>
              {tileData.reduce((sum, t) => sum + t.count, 0)}
            </div>
          </div>
        </div>
      </div>
      <Grid narrow>
        {sortedTiles.map((tile) => (
          <Column key={tile.type} lg={4} md={4} sm={4}>
            <AssetTypeTile
              {...tile}
              onClick={() => onTypeClick(tile.type)}
              isActive={activeType === tile.type}
            />
          </Column>
        ))}
      </Grid>
    </div>
  );
};

export default AssetSummaryTiles;
