import React from "react";
import PropTypes from "prop-types";
import { Tile } from "@carbon/react";

/**
 * KPITile - A clean KPI tile with accent color and optional percentage
 */
const KPITile = ({ 
  label, 
  value, 
  percentOfTotal,
  accentColor 
}) => {
  return (
    <Tile 
      className="kpi-tile"
      style={{
        height: "100%",
        minHeight: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "1.25rem 1.5rem",
        backgroundColor: "var(--card-bg, #ffffff)",
        borderLeft: accentColor ? `4px solid ${accentColor}` : undefined,
        borderRadius: 0,
        boxShadow: "none",
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 400,
          color: "var(--text-secondary, #525252)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </span>
      
      {/* Value */}
      <span
        style={{
          fontSize: "2rem",
          fontWeight: 400,
          color: "var(--text-primary, #161616)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      
      {/* Percentage of total */}
      {percentOfTotal !== undefined && percentOfTotal !== null && (
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 400,
            color: "var(--text-secondary, #525252)",
            marginTop: "0.25rem",
          }}
        >
          {percentOfTotal.toFixed(1)}% of total
        </span>
      )}
    </Tile>
  );
};

KPITile.propTypes = {
  /** Label displayed at the top of the tile */
  label: PropTypes.string.isRequired,
  /** Main value displayed prominently (typically formatted currency) */
  value: PropTypes.string.isRequired,
  /** Percentage of total cost (shown below value) */
  percentOfTotal: PropTypes.number,
  /** Accent color for left border */
  accentColor: PropTypes.string,
};

KPITile.defaultProps = {
  percentOfTotal: null,
  accentColor: null,
};

export default KPITile;
