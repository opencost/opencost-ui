import React from "react";
import PropTypes from "prop-types";
import { PieChart } from "@carbon/charts-react";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * AssetTypeChart - Pie chart showing cost breakdown by asset type
 * (Node, ClusterManagement, LoadBalancer, Disk)
 */
const AssetTypeChart = ({ data, currency = "USD" }) => {
  const { isDarkMode } = useTheme();

  // Format currency for tooltips
  const formatCurrency = (value) => {
    const numValue = typeof value === "number" && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  // Color scales for light and dark modes - vibrant neon for dark
  const colorScale = isDarkMode
    ? {
        Node: "#33b1ff",
        ClusterManagement: "#be95ff",
        LoadBalancer: "#42be65",
        Disk: "#ff7eb6",
        Network: "#fa4d56",
        SharedAsset: "#8a8a8a",
      }
    : {
        Node: "#0072c3",
        ClusterManagement: "#8a3ffc",
        LoadBalancer: "#007d79",
        Disk: "#ee5396",
        Network: "#fa4d56",
        SharedAsset: "#878d96",
      };

  // Chart options following Carbon Design guidelines
  const options = {
    title: "Cost by Asset Type",
    resizable: true,
    pie: {
      labels: {
        enabled: true,
        formatter: (d) => d.data.group,
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
        No asset type data available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "300px" }}>
      <PieChart data={data} options={options} />
    </div>
  );
};

AssetTypeChart.propTypes = {
  /** Array of data objects with group (asset type) and value (cost) */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      group: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  /** Currency code for formatting */
  currency: PropTypes.string,
};

AssetTypeChart.defaultProps = {
  currency: "USD",
};

export default AssetTypeChart;
