/**
 * Assets Page - Main page component for infrastructure asset cost management
 *
 * Features:
 * - Display KPI cards with total cost, waste, and efficiency
 * - Cost breakdown charts by cluster, type, and storage class
 * - Searchable and filterable asset table
 * - Mock data support for development
 * - Error handling and loading states
 */

import React, { useState, useEffect, useMemo } from "react";
import { Loading, InlineNotification } from "@carbon/react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AssetsService from "../services/assets";
import KPICards from "../components/assets/KPICards";
import CostBreakdownChart from "../components/assets/CostBreakdownChart";
import AssetTable from "../components/assets/AssetTable";
import FilterPanel from "../components/assets/FilterPanel";
import InsightsPanel from "../components/assets/InsightsPanel";
import "./../styles/assets/dashboard.css";

/**
 * Transform raw API data into flattened asset array
 * @param {object} rawData - Raw API response data
 * @returns {array} - Flattened array of assets
 */
const transformAssetData = (rawData) => {
  const assets = [];

  if (!rawData || typeof rawData !== "object") {
    return assets;
  }

  // Iterate through clusters
  Object.entries(rawData).forEach(([clusterKey, clusterData]) => {
    if (!clusterData || typeof clusterData !== "object") {
      return;
    }

    // Process nodes
    if (clusterData.nodes && typeof clusterData.nodes === "object") {
      Object.entries(clusterData.nodes).forEach(([nodeKey, nodeData]) => {
        assets.push({
          id: `${clusterKey}-node-${nodeKey}`,
          name: nodeKey,
          cluster: clusterKey,
          assetType: "Node Disk",
          ...nodeData,
        });
      });
    }

    // Process PVCs
    if (clusterData.pvc && typeof clusterData.pvc === "object") {
      Object.entries(clusterData.pvc).forEach(([pvcKey, pvcData]) => {
        assets.push({
          id: `${clusterKey}-pvc-${pvcKey}`,
          name: pvcData.claimName || pvcKey,
          cluster: clusterKey,
          assetType: "PVC",
          ...pvcData,
        });
      });
    }

    // Handle flat asset structure (if any)
    if (!clusterData.nodes && !clusterData.pvc && clusterData.type) {
      assets.push({
        id: clusterKey,
        name: clusterKey,
        cluster: clusterKey,
        assetType: "Unknown",
        ...clusterData,
      });
    }
  });

  return assets;
};

/**
 * Apply filters to assets array
 * @param {array} assets - Asset array
 * @param {object} filters - Filter criteria
 * @returns {array} - Filtered assets
 */
const applyFilters = (assets, filters) => {
  let filtered = [...assets];

  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((asset) => {
      const idle = (asset.breakdown?.idle || 0) * 100;
      if (filters.status.includes("ok") && idle < 40) return true;
      if (filters.status.includes("review") && idle >= 40 && idle < 80) return true;
      if (filters.status.includes("waste") && idle >= 80) return true;
      return false;
    });
  }

  // Asset type filter
  if (filters.assetType && filters.assetType.length > 0) {
    filtered = filtered.filter((asset) =>
      filters.assetType.includes(asset.assetType)
    );
  }

  // Storage class filter
  if (filters.storageClass && filters.storageClass.length > 0) {
    filtered = filtered.filter((asset) =>
      filters.storageClass.includes(asset.storageClass)
    );
  }

  // Cluster filter
  if (filters.cluster && filters.cluster.length > 0) {
    filtered = filtered.filter((asset) =>
      filters.cluster.includes(asset.cluster)
    );
  }

  // Search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchTerm) ||
        (asset.claimNamespace && asset.claimNamespace.toLowerCase().includes(searchTerm)) ||
        asset.cluster.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};

const AssetsDashboard = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [useMockData, setUseMockData] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    assetType: [],
    storageClass: [],
    cluster: [],
    search: "",
  });

  /**
   * Fetch assets from API or use mock data
   */
  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;

      if (useMockData) {
        console.log("Using mock data for development");
        result = AssetsService.getMockData();
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        result = await AssetsService.fetchAssets("30d");
      }

      if (result && result.data) {
        const transformedAssets = transformAssetData(result.data);

        if (transformedAssets.length === 0) {
          setError("No assets found in the data");
          setAssets([]);
        } else {
          setAssets(transformedAssets);
        }
      } else {
        setError("No data received from API");
        setAssets([]);
      }
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError(err.message || "Failed to fetch assets. Please try again.");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch assets on component mount
   */
  useEffect(() => {
    fetchAssets();
  }, [useMockData]);

  /**
   * Apply filters to assets
   */
  const filteredAssets = useMemo(() => {
    return applyFilters(assets, filters);
  }, [assets, filters]);

  /**
   * Get unique values for filter options
   */
  const filterOptions = useMemo(
    () => ({
      clusters: [...new Set(assets.map((a) => a.cluster))],
      storageClasses: [...new Set(assets.map((a) => a.storageClass).filter(Boolean))],
      assetTypes: [...new Set(assets.map((a) => a.assetType))],
    }),
    [assets]
  );

  // Loading state
  if (loading) {
    return (
      <Page active="/assets">
        <Header headerTitle="Storage Assets" />
        <div className="assets-loading">
          <Loading description="Loading assets data..." withOverlay={false} />
        </div>
        <Footer />
      </Page>
    );
  }

  // Error state
  if (error && !useMockData) {
    return (
      <Page active="/assets">
        <Header headerTitle="Storage Assets" />
        <div className="assets-error">
          <InlineNotification
            kind="error"
            title="Error Loading Assets"
            subtitle={error}
            hideCloseButton={false}
            onClose={() => setError(null)}
          />
          <div className="assets-error-actions">
            <button onClick={fetchAssets} className="btn-retry">
              Retry
            </button>
            <button onClick={() => setUseMockData(true)} className="btn-mock">
              Use Mock Data
            </button>
          </div>
        </div>
        <Footer />
      </Page>
    );
  }

  // Empty state
  if (assets.length === 0 && !loading) {
    return (
      <Page active="/assets">
        <Header headerTitle="Storage Assets" />
        <div className="assets-empty">
          <InlineNotification
            kind="info"
            title="No Assets Found"
            subtitle="No storage assets available. Try enabling mock data for demonstration."
            hideCloseButton={false}
          />
          <button onClick={() => setUseMockData(true)} className="btn-mock">
            Load Mock Data
          </button>
        </div>
        <Footer />
      </Page>
    );
  }

  // Main view
  return (
    <Page active="/assets">
      <Header headerTitle="Storage Assets">
        <div className="header-actions">
          {useMockData && (
            <span className="mock-data-badge">Mock Data Mode</span>
          )}
          <button onClick={fetchAssets} className="btn-refresh" title="Refresh data">
            ↻
          </button>
        </div>
      </Header>

      <div className="assets-dashboard">
        {/* KPI Cards Section */}
        <section className="kpi-section">
          <KPICards assets={filteredAssets} />
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <CostBreakdownChart assets={filteredAssets} />
        </section>

        {/* Insights Section */}
        {filteredAssets.length > 0 && (
          <section className="insights-section">
            <InsightsPanel assets={filteredAssets} />
          </section>
        )}

        {/* Filters Section */}
        <section className="filters-section">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
            useMockData={useMockData}
            onMockDataToggle={setUseMockData}
          />
        </section>

        {/* Table Section */}
        <section className="table-section">
          {filteredAssets.length > 0 ? (
            <AssetTable
              assets={filteredAssets}
              totalAssets={assets.length}
              filteredAssets={filteredAssets.length}
            />
          ) : (
            <div className="no-results">
              <p>No assets match the current filters</p>
              <button onClick={() => setFilters({
                status: [],
                assetType: [],
                storageClass: [],
                cluster: [],
                search: "",
              })}>
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </Page>
  );
};

export default AssetsDashboard;
