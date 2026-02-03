/**
 * CostBreakdownChart - Display cost distribution across dimensions
 *
 * Shows:
 * - Cost by Cluster
 * - Cost by Asset Type (Nodes vs PVCs)
 * - Cost by Storage Class
 */

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Tile } from "@carbon/react";

/**
 * Calculate cost aggregation
 * @param {array} assets - Asset array
 * @param {string} groupBy - Field to group by (cluster, assetType, storageClass)
 * @returns {object} - Aggregated costs by group
 */
const aggregateCosts = (assets, groupBy) => {
  const aggregated = {};

  assets.forEach((asset) => {
    const key = asset[groupBy] || "Unknown";
    if (!aggregated[key]) {
      aggregated[key] = 0;
    }
    aggregated[key] += asset.totalCost || 0;
  });

  return aggregated;
};

/**
 * Create chart data from aggregated costs
 * @param {object} aggregated - Aggregated costs
 * @returns {array} - Array of {name, value} objects sorted by value descending
 */
const createChartData = (aggregated) => {
  return Object.entries(aggregated)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const CostBreakdownChart = ({ assets }) => {
  // Prepare chart data
  const clusterCosts = useMemo(() => {
    const aggregated = aggregateCosts(assets, "cluster");
    return createChartData(aggregated);
  }, [assets]);

  const assetTypeCosts = useMemo(() => {
    const aggregated = aggregateCosts(assets, "assetType");
    return createChartData(aggregated);
  }, [assets]);

  const storageClassCosts = useMemo(() => {
    const aggregated = aggregateCosts(assets, "storageClass");
    return createChartData(aggregated);
  }, [assets]);

  // Get max value for scaling
  const allValues = [
    ...clusterCosts.map((c) => c.value),
    ...assetTypeCosts.map((c) => c.value),
    ...storageClassCosts.map((c) => c.value),
  ];
  const maxValue = Math.max(...allValues, 1);

  return (
    <div className="cost-breakdown-container">
      <Tile className="cost-breakdown-chart">
        <h3>Cost by Cluster</h3>
        <div className="chart-wrapper">
          {clusterCosts.length > 0 ? (
            <div className="horizontal-bar-chart">
              {clusterCosts.map((item) => (
                <div key={item.name} className="bar-item">
                  <div className="bar-label">{item.name}</div>
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: "#0f62fe",
                      }}
                    />
                  </div>
                  <div className="bar-value">${item.value.toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No cluster data</p>
          )}
        </div>
      </Tile>

      <Tile className="cost-breakdown-chart">
        <h3>Cost by Asset Type</h3>
        <div className="chart-wrapper">
          {assetTypeCosts.length > 0 ? (
            <div className="horizontal-bar-chart">
              {assetTypeCosts.map((item) => (
                <div key={item.name} className="bar-item">
                  <div className="bar-label">{item.name}</div>
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: "#ff832b",
                      }}
                    />
                  </div>
                  <div className="bar-value">${item.value.toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No asset type data</p>
          )}
        </div>
      </Tile>

      <Tile className="cost-breakdown-chart">
        <h3>Cost by Storage Class</h3>
        <div className="chart-wrapper">
          {storageClassCosts.length > 0 ? (
            <div className="horizontal-bar-chart">
              {storageClassCosts.map((item) => (
                <div key={item.name} className="bar-item">
                  <div className="bar-label">{item.name || "Unspecified"}</div>
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: "#24a148",
                      }}
                    />
                  </div>
                  <div className="bar-value">${item.value.toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No storage class data</p>
          )}
        </div>
      </Tile>
    </div>
  );
};

CostBreakdownChart.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      cluster: PropTypes.string,
      assetType: PropTypes.string,
      storageClass: PropTypes.string,
      totalCost: PropTypes.number,
    })
  ).isRequired,
};

CostBreakdownChart.defaultProps = {
  assets: [],
};

export default CostBreakdownChart;
