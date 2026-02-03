/**
 * FilterPanel - Multi-filter system for assets
 *
 * Allows filtering by:
 * - Status (OK, Review, Waste)
 * - Asset Type (Nodes, PVCs)
 * - Storage Class
 * - Cluster
 * - Search term
 */

import React, { useState } from "react";
import PropTypes from "prop-types";

const FilterPanel = ({
  filters,
  onFiltersChange,
  filterOptions,
  useMockData,
  onMockDataToggle,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleStatusChange = (status) => {
    const updated = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: updated });
  };

  const handleAssetTypeChange = (type) => {
    const updated = filters.assetType.includes(type)
      ? filters.assetType.filter((t) => t !== type)
      : [...filters.assetType, type];
    onFiltersChange({ ...filters, assetType: updated });
  };

  const handleStorageClassChange = (sc) => {
    const updated = filters.storageClass.includes(sc)
      ? filters.storageClass.filter((s) => s !== sc)
      : [...filters.storageClass, sc];
    onFiltersChange({ ...filters, storageClass: updated });
  };

  const handleClusterChange = (cluster) => {
    const updated = filters.cluster.includes(cluster)
      ? filters.cluster.filter((c) => c !== cluster)
      : [...filters.cluster, cluster];
    onFiltersChange({ ...filters, cluster: updated });
  };

  const handleSearchChange = (e) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: [],
      assetType: [],
      storageClass: [],
      cluster: [],
      search: "",
    });
  };

  const activeFilterCount =
    filters.status.length +
    filters.assetType.length +
    filters.storageClass.length +
    filters.cluster.length +
    (filters.search ? 1 : 0);

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button
          className="filter-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "▼" : "▶"} Advanced Filters
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="filter-group">
        <input
          type="text"
          className="filter-search"
          placeholder="Search by name, namespace, or cluster..."
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Expanded Filters */}
      {expanded && (
        <div className="filter-options">
          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <div className="filter-checkbox-group">
              {["ok", "review", "waste"].map((status) => (
                <label key={status} className="checkbox">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleStatusChange(status)}
                  />
                  <span className="checkbox-label">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Asset Type Filter */}
          {filterOptions.assetTypes && filterOptions.assetTypes.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">Asset Type</label>
              <div className="filter-checkbox-group">
                {filterOptions.assetTypes.map((type) => (
                  <label key={type} className="checkbox">
                    <input
                      type="checkbox"
                      checked={filters.assetType.includes(type)}
                      onChange={() => handleAssetTypeChange(type)}
                    />
                    <span className="checkbox-label">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Storage Class Filter */}
          {filterOptions.storageClasses && filterOptions.storageClasses.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">Storage Class</label>
              <div className="filter-checkbox-group">
                {filterOptions.storageClasses.map((sc) => (
                  <label key={sc} className="checkbox">
                    <input
                      type="checkbox"
                      checked={filters.storageClass.includes(sc)}
                      onChange={() => handleStorageClassChange(sc)}
                    />
                    <span className="checkbox-label">{sc || "Unspecified"}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Cluster Filter */}
          {filterOptions.clusters && filterOptions.clusters.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">Cluster</label>
              <div className="filter-checkbox-group">
                {filterOptions.clusters.map((cluster) => (
                  <label key={cluster} className="checkbox">
                    <input
                      type="checkbox"
                      checked={filters.cluster.includes(cluster)}
                      onChange={() => handleClusterChange(cluster)}
                    />
                    <span className="checkbox-label">{cluster}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Mock Data Toggle */}
          <div className="filter-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={useMockData}
                onChange={(e) => onMockDataToggle(e.target.checked)}
              />
              <span className="checkbox-label">Use Mock Data (Dev Mode)</span>
            </label>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

FilterPanel.propTypes = {
  filters: PropTypes.shape({
    status: PropTypes.array,
    assetType: PropTypes.array,
    storageClass: PropTypes.array,
    cluster: PropTypes.array,
    search: PropTypes.string,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  filterOptions: PropTypes.shape({
    clusters: PropTypes.array,
    storageClasses: PropTypes.array,
    assetTypes: PropTypes.array,
  }).isRequired,
  useMockData: PropTypes.bool,
  onMockDataToggle: PropTypes.func,
};

FilterPanel.defaultProps = {
  useMockData: false,
  onMockDataToggle: () => {},
};

export default FilterPanel;
