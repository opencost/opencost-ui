import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Tile } from "@carbon/react";
import { ComboChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import { formatCurrency } from "../../utils/assetCalculations";

function transformToComboData(assets) {
  if (!assets || assets.length === 0) {
    return { data: [], stats: null };
  }

  const clusterMap = {};

  assets.forEach((asset) => {
    const cluster = asset.cluster || "Unknown";
    if (!clusterMap[cluster]) {
      clusterMap[cluster] = { totalCost: 0, count: 0, totalUtilization: 0 };
    }

    clusterMap[cluster].totalCost += asset.totalCost || 0;
    clusterMap[cluster].count += 1;

    const idle = asset.breakdown?.idle || 0;
    clusterMap[cluster].totalUtilization += (1 - idle) * 100;
  });

  const data = [];

  Object.entries(clusterMap).forEach(([cluster, info]) => {
    const avgUtil = parseFloat(
      (info.totalUtilization / info.count).toFixed(1)
    );

    data.push({
      group: "Total Cost",
      key: cluster,
      value: parseFloat(info.totalCost.toFixed(2)),
    });

    data.push({
      group: "Avg Utilization (%)",
      key: cluster,
      value: avgUtil,
    });
  });

  const totalCost = Object.values(clusterMap).reduce(
    (s, c) => s + c.totalCost,
    0
  );
  const overallUtil = parseFloat(
    (
      Object.values(clusterMap).reduce((s, c) => s + c.totalUtilization, 0) /
      assets.length
    ).toFixed(1)
  );

  return {
    data,
    stats: {
      clusters: Object.keys(clusterMap).length,
      totalCost,
      avgUtilization: overallUtil,
    },
  };
}

const chartOptions = {
  title: "",
  resizable: true,
  height: "350px",
  axes: {
    left: {
      title: "Cost ($)",
      mapsTo: "value",
      correspondingDatasets: ["Total Cost"],
    },
    right: {
      title: "Utilization (%)",
      mapsTo: "value",
      correspondingDatasets: ["Avg Utilization (%)"],
    },
    bottom: {
      mapsTo: "key",
      scaleType: "labels",
    },
  },
  comboChartTypes: [
    {
      type: "simple-bar",
      correspondingDatasets: ["Total Cost"],
    },
    {
      type: "line",
      correspondingDatasets: ["Avg Utilization (%)"],
      options: { points: { enabled: true, radius: 4 } },
    },
  ],
  color: {
    scale: {
      "Total Cost": "#0f62fe",
      "Avg Utilization (%)": "#da1e28",
    },
  },
  tooltip: { enabled: true },
  legend: { enabled: true, position: "bottom" },
};

const CostEfficiencyComboChart = ({ assets }) => {
  const { data, stats } = useMemo(
    () => transformToComboData(assets),
    [assets]
  );

  return (
    <Tile className="chart-tile">
      <div className="chart-header">
        <div>
          <h3>Cost vs Efficiency</h3>
          <p className="chart-description">
            Cost per cluster with average utilization overlay
          </p>
        </div>
      </div>
      {data.length > 0 ? (
        <>
          <div className="chart-content">
            <ComboChart data={data} options={chartOptions} />
          </div>
          {stats && (
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Total Cost</span>
                <span className="stat-value">
                  {formatCurrency(stats.totalCost)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Utilization</span>
                <span className="stat-value">{stats.avgUtilization}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Clusters</span>
                <span className="stat-value">{stats.clusters}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="chart-empty">No efficiency data available</div>
      )}
    </Tile>
  );
};

CostEfficiencyComboChart.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      cluster: PropTypes.string,
      totalCost: PropTypes.number,
      breakdown: PropTypes.shape({
        idle: PropTypes.number,
      }),
    })
  ).isRequired,
};

export default CostEfficiencyComboChart;
