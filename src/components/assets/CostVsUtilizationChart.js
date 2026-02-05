import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Tile } from "@carbon/react";
import { ScatterChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";

const CostVsUtilizationChart = ({ assets }) => {
  const { chartData, stats } = useMemo(() => {
    if (!assets || assets.length === 0) {
      return { chartData: [], stats: null };
    }

    let efficient = 0,
      healthy = 0,
      critical = 0;

    const data = assets
      .map((asset) => {
        const idle = asset.breakdown?.idle || 0;
        const utilization = Math.round((1 - idle) * 100);

        let status = "Healthy";
        if (utilization >= 80) {
          status = "Efficient";
          efficient++;
        } else if (utilization < 30) {
          status = "Critical";
          critical++;
        } else {
          healthy++;
        }

        return {
          group: status,
          x: utilization,
          y: parseFloat((asset.totalCost || 0).toFixed(2)),
        };
      })
      .filter((item) => item.y > 0);

    return {
      chartData: data,
      stats: { efficient, healthy, critical, total: data.length },
    };
  }, [assets]);

  const chartOptions = {
    title: "",
    resizable: true,
    height: "350px",
    legend: { enabled: true, position: "bottom", clickable: true },
    tooltip: { enabled: true },
    axes: {
      left: { mapsTo: "y", title: "Monthly Cost ($)" },
      bottom: { mapsTo: "x", title: "Utilization (%)", domain: [0, 100] },
    },
    color: {
      scale: {
        Efficient: "#24a148",
        Healthy: "#0f62fe",
        Critical: "#da1e28",
      },
    },
    points: {
      radius: 6,
      fillOpacity: 0.7,
    },
  };

  return (
    <Tile className="chart-tile">
      <div className="chart-header">
        <div>
          <h3>Cost vs Utilization</h3>
          <p className="chart-description">
            Asset efficiency — green is well-utilized, red needs attention
          </p>
        </div>
      </div>
      {chartData.length > 0 ? (
        <>
          <div className="chart-content">
            <ScatterChart data={chartData} options={chartOptions} />
          </div>
          {stats && (
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Efficient (&ge;80%)</span>
                <span className="stat-count efficient">{stats.efficient}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Healthy (30-79%)</span>
                <span className="stat-count healthy">{stats.healthy}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Critical (&lt;30%)</span>
                <span className="stat-count critical">{stats.critical}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Tracked</span>
                <span className="stat-value">{stats.total}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="chart-empty">No utilization data available</div>
      )}
    </Tile>
  );
};

CostVsUtilizationChart.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      totalCost: PropTypes.number,
      breakdown: PropTypes.shape({
        idle: PropTypes.number,
      }),
    })
  ).isRequired,
};

export default CostVsUtilizationChart;
