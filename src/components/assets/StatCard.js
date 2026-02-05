import React from "react";
import PropTypes from "prop-types";
import { Tile } from "@carbon/react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

/**
 * StatCard - A summary card component for displaying key metrics
 * Uses Carbon Design System's Tile component with custom styling
 */
const StatCard = ({ label, value, subValue, color, sparklineData }) => {
  const cardStyle = {
    borderLeft: `4px solid ${color}`,
    height: "100%",
    minHeight: "140px",
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    backgroundColor: "var(--card-bg)",
    transition: "background-color 0.2s ease",
  };

  const labelStyle = {
    fontSize: "0.75rem",
    fontWeight: 400,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.32px",
    marginBottom: "0.5rem",
  };

  const valueStyle = {
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    lineHeight: 1.2,
    marginBottom: "0.25rem",
  };

  const subValueStyle = {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: "var(--text-tertiary)",
    marginBottom: "0.5rem",
  };

  const sparklineContainerStyle = {
    flexGrow: 1,
    minHeight: "40px",
    marginTop: "auto",
  };

  return (
    <Tile style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
      {subValue && <div style={subValueStyle}>{subValue}</div>}
      {sparklineData && sparklineData.length > 0 && (
        <div style={sparklineContainerStyle}>
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Tile>
  );
};

StatCard.propTypes = {
  /** Label displayed at the top of the card */
  label: PropTypes.string.isRequired,
  /** Main value displayed prominently (typically formatted currency) */
  value: PropTypes.string.isRequired,
  /** Optional sub-value (e.g., percentage change) */
  subValue: PropTypes.string,
  /** Hex color code for the accent border and sparkline */
  color: PropTypes.string.isRequired,
  /** Optional array of data points for sparkline chart */
  sparklineData: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
    })
  ),
};

StatCard.defaultProps = {
  subValue: null,
  sparklineData: null,
};

export default StatCard;
