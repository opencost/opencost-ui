import React from "react";
import { DonutChart, SimpleBarChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";

// --- 1. DATA HELPERS ---

// Safely calculate cost (handles different API formats)
const getSafeCost = (item) => {
  if (typeof item.totalCost === 'number') return item.totalCost;
  if (typeof item.cost === 'number') return item.cost;
  return (item.cpuCost || 0) + (item.ramCost || 0) + (item.gpuCost || 0) + (item.pvCost || 0);
};

// Process data for the "Type" Chart (Donut)
const processTypeData = (items) => {
  const groups = {};
  items.forEach(item => {
    const type = item.type || "Unknown";
    const cost = getSafeCost(item);
    groups[type] = (groups[type] || 0) + cost;
  });

  // Convert to Carbon Chart format
  return Object.keys(groups).map(type => ({
    group: type,
    value: parseFloat(groups[type].toFixed(2))
  })).sort((a, b) => b.value - a.value);
};

// Process data for the "Provider" Chart (Bar)
const processProviderData = (items) => {
  const groups = {};
  items.forEach(item => {
    // Check both standard locations for provider info
    const provider = item.properties?.provider || item.provider || "Custom";
    const cost = getSafeCost(item);
    groups[provider] = (groups[provider] || 0) + cost;
  });

  return Object.keys(groups).map(prov => ({
    group: prov,
    value: parseFloat(groups[prov].toFixed(2))
  })).sort((a, b) => b.value - a.value);
};

// --- 2. EXPORTED COMPONENTS ---

export const AssetTypeChart = ({ items, height = "300px" }) => {
  const data = processTypeData(items);
  const options = {
    title: "Cost by Asset Type",
    resizable: true,
    height,
    donut: {
      center: { label: "Assets" },
      alignment: "center"
    },
    legend: { position: 'right' }
  };

  return (
    <div style={{ height: height }}>
      <DonutChart data={data} options={options} />
    </div>
  );
};

export const AssetProviderChart = ({ items, height = "300px" }) => {
  const data = processProviderData(items);
  const options = {
    title: "Cost by Provider",
    resizable: true,
    height,
    axes: {
      left: { mapsTo: "value", title: "Cost ($)" },
      bottom: { mapsTo: "group", scaleType: "labels", title: "Provider" }
    },
    color: {
      scale: { 
        "Oracle": "#0f62fe", // Carbon Blue
        "AWS": "#ff9900",    // AWS Orange
        "GCP": "#34a853",    // Google Green
        "Azure": "#0078d4"   // Azure Blue
      } 
    }
  };

  return (
    <div style={{ height: height }}>
      <SimpleBarChart data={data} options={options} />
    </div>
  );
};

// Default export if needed for compatibility, but we will use named imports
export default AssetTypeChart;