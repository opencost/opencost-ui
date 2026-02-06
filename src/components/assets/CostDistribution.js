import React from "react";
import PropTypes from "prop-types";
import { DonutChart } from "@carbon/charts-react";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * CostDistribution - Donut chart showing cost breakdown by category
 * Uses Carbon Charts for visualization
 */
const CostDistribution = ({ data, totalCost, currency = "USD" }) => {
  const { isDarkMode } = useTheme();
  
  // Ensure totalCost is a valid number
  const validTotalCost = typeof totalCost === "number" && !isNaN(totalCost) ? totalCost : 0;

  // Format currency for center display
  const formatCurrency = (value) => {
    const numValue = typeof value === "number" && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  // Color scales for light and dark modes
  const colorScale = isDarkMode
    ? {
        CPU: "#d4bbff",
        RAM: "#3ddbd9", 
        GPU: "#ff7eb6",
        Other: "#d2a106",
      }
    : {
        CPU: "#8a3ffc",
        RAM: "#007d79",
        GPU: "#ee5396",
        Other: "#878d96",
      };

  // Chart options following Carbon Design guidelines
  const options = {
    title: "Cost Distribution",
    resizable: true,
    donut: {
      center: {
        label: "Total Cost",
        number: validTotalCost,
        numberFormatter: (value) => formatCurrency(value),
        numberFontSize: () => 24,
      },
      alignment: "center",
    },
    pie: {
      labels: {
        enabled: false,
      },
    },
    legend: {
      alignment: "center",
      position: "bottom",
      clickable: true,
    },
    color: {
      scale: colorScale,
    },
    tooltip: {
      showTotal: true,
      valueFormatter: (value) => formatCurrency(value),
    },
    theme: isDarkMode ? "g100" : "white",
    height: "300px",
  };

  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          color: "var(--text-tertiary)",
        }}
      >
        No cost data available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "300px" }}>
      <DonutChart data={data} options={options} />
    </div>
  );
};

CostDistribution.propTypes = {
  /** Array of data objects with group (category name) and value (cost) */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      group: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  /** Total cost for center display */
  totalCost: PropTypes.number.isRequired,
  /** Currency code for formatting */
  currency: PropTypes.string,
};

CostDistribution.defaultProps = {
  currency: "USD",
};

export default CostDistribution;
