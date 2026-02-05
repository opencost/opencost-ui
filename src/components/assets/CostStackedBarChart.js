import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Tile } from "@carbon/react";
import { StackedBarChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import { formatCurrency } from "../../utils/assetCalculations";

function transformToStackedData(assets) {
  if (!assets || assets.length === 0) {
    return { data: [], totalCost: 0 };
  }

  const grouped = {};
  let totalCost = 0;

  assets.forEach((asset) => {
    const type = asset.assetType || "Unknown";
    const cluster = asset.cluster || "Unknown";
    const cost = asset.totalCost || 0;
    const key = `${cluster}||${type}`;

    if (!grouped[key]) {
      grouped[key] = { group: type, key: cluster, value: 0 };
    }
    grouped[key].value += cost;
    totalCost += cost;
  });

  const data = Object.values(grouped).map((item) => ({
    ...item,
    value: parseFloat(item.value.toFixed(2)),
  }));

  return { data, totalCost };
}

const chartOptions = {
  title: "",
  resizable: true,
  height: "400px",
  bars: { maxWidth: 60 },
  axes: {
    left: {
      mapsTo: "value",
      title: "Cost ($)",
      stacked: true,
    },
    bottom: {
      mapsTo: "key",
      title: "Cluster",
      scaleType: "labels",
    },
  },
  color: {
    scale: {
      "Node Disk": "#0f62fe",
      Node: "#0f62fe",
      PVC: "#24a148",
      Storage: "#0043ce",
      Unknown: "#525252",
    },
  },
  tooltip: { enabled: true, showTotal: true },
  legend: { enabled: true, position: "bottom", clickable: true },
  toolbar: {
    enabled: true,
    controls: [{ type: "Export as CSV" }, { type: "Export as PNG" }],
  },
};

const CostStackedBarChart = ({ assets }) => {
  const { data, totalCost } = useMemo(
    () => transformToStackedData(assets),
    [assets]
  );

  return (
    <Tile className="chart-tile chart-hero">
      <div className="chart-header">
        <div>
          <h3>Cost Distribution</h3>
          <p className="chart-description">
            Total cost per cluster, broken down by asset type
          </p>
        </div>
        <div className="chart-total">{formatCurrency(totalCost)}</div>
      </div>
      {data.length > 0 ? (
        <div className="chart-content">
          <StackedBarChart data={data} options={chartOptions} />
        </div>
      ) : (
        <div className="chart-empty">
          No cost data available for the selected period
        </div>
      )}
    </Tile>
  );
};

CostStackedBarChart.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      assetType: PropTypes.string,
      cluster: PropTypes.string,
      totalCost: PropTypes.number,
    })
  ).isRequired,
};

export default CostStackedBarChart;
