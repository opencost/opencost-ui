/**
 * AssetTable - Searchable, sortable, paginated table of assets
 *
 * Features:
 * - Sortable columns
 * - Pagination
 * - Status indicators
 * - Trend indicators
 * - Cost information
 */

import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  calculateUsage,
  getAssetStatus,
  formatCurrency,
} from "./../../utils/assetCalculations";

const ITEMS_PER_PAGE = 10;

const AssetTable = ({ assets, totalAssets, filteredAssets }) => {
  const [sortColumn, setSortColumn] = useState("totalCost");
  const [sortDirection, setSortDirection] = useState("DESC");
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Sort assets by column
   */
  const sortedAssets = useMemo(() => {
    const sorted = [...assets];

    sorted.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle numeric columns
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "DESC" ? bVal - aVal : aVal - bVal;
      }

      // Handle string columns
      const aStr = String(aVal || "").toLowerCase();
      const bStr = String(bVal || "").toLowerCase();

      if (sortDirection === "DESC") {
        return bStr.localeCompare(aStr);
      } else {
        return aStr.localeCompare(bStr);
      }
    });

    return sorted;
  }, [assets, sortColumn, sortDirection]);

  /**
   * Paginate sorted assets
   */
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAssets, currentPage]);

  /**
   * Handle column sort
   */
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      // New column, default to DESC
      setSortColumn(column);
      setSortDirection("DESC");
    }
    // Reset to first page
    setCurrentPage(1);
  };

  /**
   * Get trend indicator for cost
   */
  const getTrendIndicator = (asset) => {
    const idle = (asset.breakdown?.idle || 0) * 100;
    if (idle > 70) return "↑ High Idle";
    if (idle > 40) return "→ Medium Idle";
    return "↓ Low Idle";
  };

  const totalPages = Math.ceil(sortedAssets.length / ITEMS_PER_PAGE);

  return (
    <div className="asset-table-container">
      <div className="table-header">
        <h3>Asset Details</h3>
        <div className="table-info">
          Showing {paginatedAssets.length} of {filteredAssets} assets
          {totalAssets > filteredAssets && ` (filtered from ${totalAssets})`}
        </div>
      </div>

      {paginatedAssets.length === 0 ? (
        <div className="table-empty">
          <p>No assets to display</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="asset-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")} className="sortable">
                    Name {sortColumn === "name" && (sortDirection === "ASC" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("cluster")} className="sortable">
                    Cluster {sortColumn === "cluster" && (sortDirection === "ASC" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("assetType")} className="sortable">
                    Type {sortColumn === "assetType" && (sortDirection === "ASC" ? "↑" : "↓")}
                  </th>
                  <th>Storage Class</th>
                  <th onClick={() => handleSort("totalCost")} className="sortable">
                    Cost {sortColumn === "totalCost" && (sortDirection === "ASC" ? "↑" : "↓")}
                  </th>
                  <th>Usage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => {
                  const usage = calculateUsage(asset);
                  const status = getAssetStatus(asset);

                  return (
                    <tr key={asset.id} className={`status-${status.type}`}>
                      <td className="name-cell">
                        <strong>{asset.name}</strong>
                        {asset.claimNamespace && (
                          <div className="namespace">ns: {asset.claimNamespace}</div>
                        )}
                      </td>
                      <td>{asset.cluster}</td>
                      <td>
                        <span className="asset-type-badge">
                          {asset.assetType}
                        </span>
                      </td>
                      <td>{asset.storageClass || "-"}</td>
                      <td className="cost-cell">
                        <div className="cost-value">
                          {formatCurrency(asset.totalCost || 0)}
                        </div>
                        <div className="cost-trend">
                          {getTrendIndicator(asset)}
                        </div>
                      </td>
                      <td className="usage-cell">
                        <div className="usage-bar">
                          <div
                            className="usage-filled"
                            style={{
                              width: `${Math.min(
                                100,
                                (parseFloat(usage.usedPercentage) || 0)
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="usage-text">
                          {usage.usedPercentage}% used
                        </div>
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge status-${status.type}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="table-pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-pagination"
              >
                ← Previous
              </button>

              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-pagination"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

AssetTable.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      cluster: PropTypes.string.isRequired,
      assetType: PropTypes.string.isRequired,
      storageClass: PropTypes.string,
      claimNamespace: PropTypes.string,
      totalCost: PropTypes.number,
      bytes: PropTypes.number,
      breakdown: PropTypes.shape({
        idle: PropTypes.number,
        system: PropTypes.number,
        user: PropTypes.number,
      }),
    })
  ).isRequired,
  totalAssets: PropTypes.number,
  filteredAssets: PropTypes.number,
};

AssetTable.defaultProps = {
  assets: [],
  totalAssets: 0,
  filteredAssets: 0,
};

export default AssetTable;
