import * as React from "react";
import { Grid, Column, Tabs, Tab, TabList, TabPanels, TabPanel, Loading, Button } from "@carbon/react";
import { Renew } from "@carbon/icons-react";
import { useLocation, useNavigate } from "react-router";
import { find, get } from "lodash";

import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import AssetTable from "../components/assets/AssetTable";
import AssetsControls from "../components/assets/AssetsControls";
import AssetSummaryTiles from "../components/assets/AssetSummaryTiles";
import AssetCharts from "../components/assets/AssetCharts";
import AssetDetailModal from "../components/assets/AssetDetailModal";
import AssetsService from "../services/assets";
import { windowOptions, assetTypes } from "../components/assets/tokens";
import { toCurrency, checkCustomWindow, toVerboseTimeRange } from "../util";
import { currencyCodes } from "../constants/currencyCodes";

/**
 * Assets Page
 * 
 * Displays infrastructure-level cost data from the OpenCost Assets API.
 * Shows breakdown by asset types: Node, Disk, Network, LoadBalancer, and ClusterManagement.
 * 
 * Features:
 * - Summary tiles with click-to-filter by asset type
 * - Interactive charts (donut chart by type, bar chart by provider)
 * - Searchable, sortable, paginated data tables
 * - Detail modal with properties, labels, and CPU/RAM breakdowns
 * 
 * API Reference: https://docs.kubecost.com/apis/monitoring-apis/assets-api
 */

const Assets = () => {
  // Form state
  const [window, setWindow] = React.useState("7d");
  const [aggregate, setAggregate] = React.useState("type");
  const [filters, setFilters] = React.useState([]);
  const [currency, setCurrency] = React.useState("USD");
  const [activeTab, setActiveTab] = React.useState(0);

  // Page state
  const [init, setInit] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);

  // Data state
  const [assetsData, setAssetsData] = React.useState(null);
  const [toplineData, setToplineData] = React.useState(null);
  const [assetsByType, setAssetsByType] = React.useState({});
  const [selectedAsset, setSelectedAsset] = React.useState(null);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [typeFilter, setTypeFilter] = React.useState(null);

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  // Generate page title
  function generateTitle({ window, aggregate }) {
    let windowName = get(find(windowOptions, { value: window }), "name", "");
    if (windowName === "") {
      if (checkCustomWindow(window)) {
        windowName = toVerboseTimeRange(window);
      } else {
        windowName = window;
      }
    }

    return `Infrastructure assets for ${windowName}`;
  }

  const [title, setTitle] = React.useState(
    generateTitle({ window, aggregate }),
  );

  // Initialize from URL parameters
  async function initialize() {
    const urlWindow = searchParams.get("window");
    const urlAggregate = searchParams.get("aggregate");
    const urlCurrency = searchParams.get("currency");

    if (urlWindow) setWindow(urlWindow);
    if (urlAggregate) setAggregate(urlAggregate);
    if (urlCurrency && currencyCodes.includes(urlCurrency))
      setCurrency(urlCurrency);

    setInit(true);
  }

  // Fetch assets data
  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      // Fetch main assets data
      const assetsResponse = await AssetsService.fetchAssets(window, {
        aggregate,
        accumulate: true,
        filters,
      });

      // Fetch topline summary
      const toplineResponse = await AssetsService.fetchTopline(window, {
        filters,
      });

      setAssetsData(assetsResponse);
      setToplineData(toplineResponse);

      // Group assets by type
      groupAssetsByType(assetsResponse);

      setTitle(generateTitle({ window, aggregate }));
    } catch (error) {
      console.error("Error fetching assets data:", error);
      
      // Provide helpful error message based on error type
      let errorMessage = "Failed to fetch assets data";
      if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
        errorMessage = "Unable to connect to OpenCost backend at http://localhost:9090. Please ensure the OpenCost API server is running.";
      } else if (error.response?.status === 404) {
        errorMessage = "Assets API endpoint not found. Please ensure you're using a compatible version of OpenCost.";
      } else {
        errorMessage = `Failed to fetch assets data: ${error.message || "Unknown error"}`;
      }
      
      setErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  // Group assets by type for tab display
  function groupAssetsByType(data) {
    if (!data || !data.data) {
      setAssetsByType({});
      return;
    }

    const grouped = {};

    // Handle different response structures based on aggregation
    const assets = Array.isArray(data.data) ? data.data : Object.values(data.data);

    assets.forEach((asset) => {
      const type = asset.type || "Other";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(asset);
    });

    setAssetsByType(grouped);
  }

  // Update URL when parameters change
  React.useEffect(() => {
    if (!init) return;

    const params = new URLSearchParams();
    params.set("window", window);
    params.set("aggregate", aggregate);
    if (currency !== "USD") params.set("currency", currency);

    navigate({ search: `?${params.toString()}` }, { replace: true });
  }, [window, aggregate, currency, init, navigate]);

  // Initialize on mount
  React.useEffect(() => {
    if (!init) {
      initialize();
    }
  }, [init]);

  // Fetch data when parameters change
  React.useEffect(() => {
    if (init) {
      fetchData();
    }
  }, [init, window, aggregate, filters]);

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setTypeFilter(null); // Clear type filter when switching tabs
  };

  // Handle asset click to show detail modal
  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setDetailModalOpen(true);
  };

  // Handle type tile click to filter
  const handleTypeClick = (type) => {
    if (typeFilter === type) {
      setTypeFilter(null); // Toggle off
    } else {
      setTypeFilter(type);
      // Switch to the tab for this type
      const typeIndex = availableTypes.findIndex(t => t.value === type);
      if (typeIndex >= 0) {
        setActiveTab(typeIndex);
      }
    }
  };

  // Get available asset types from data
  const availableTypes = React.useMemo(() => {
    return assetTypes.filter((type) => assetsByType[type.value]?.length > 0);
  }, [assetsByType]);

  return (
    <Page>
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          color: "white",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.75rem" }}>
              Assets
            </h3>
            <p style={{ opacity: 0.9, margin: 0 }}>
              Infrastructure-level cost breakdown
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.875rem" }}>Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  padding: "0.5rem",
                  fontSize: "0.875rem",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "white",
                  fontWeight: 600,
                }}
              >
                {currencyCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
            <Button
              kind="ghost"
              size="md"
              onClick={handleRefresh}
              disabled={loading}
              renderIcon={Renew}
              iconDescription="Refresh"
              hasIconOnly
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
              }}
            />
          </div>
        </div>
      </div>

      <Warnings warnings={errors} />

      {/* Topline Summary */}
      {toplineData && toplineData.data && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            }}
          >
            <span style={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}>
              Total Cost
            </span>
            <h3 style={{ fontWeight: 700, marginTop: "0.5rem", fontSize: "1.75rem" }}>
              {toCurrency(toplineData.data.totalCost || 0, currency)}
            </h3>
          </div>
          <div
            style={{
              padding: "1.5rem",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            }}
          >
            <span style={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}>
              Adjustment
            </span>
            <h3 style={{ fontWeight: 700, marginTop: "0.5rem", fontSize: "1.75rem" }}>
              {toCurrency(toplineData.data.adjustment || 0, currency)}
            </h3>
          </div>
          <div
            style={{
              padding: "1.5rem",
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            }}
          >
            <span style={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}>
              Assets
            </span>
            <h3 style={{ fontWeight: 700, marginTop: "0.5rem", fontSize: "1.75rem" }}>
              {toplineData.data.numResults || 0}
            </h3>
          </div>
        </div>
      )}

      {/* Summary Tiles */}
      {Object.keys(assetsByType).length > 0 && (
        <AssetSummaryTiles
          assetsByType={assetsByType}
          currency={currency}
          onTypeClick={handleTypeClick}
          activeType={typeFilter}
        />
      )}

      {/* Charts */}
      {assetsData && assetsData.data && (
        <AssetCharts
          assetsByType={assetsByType}
          assetsData={assetsData.data}
          currency={currency}
        />
      )}

      {/* Controls */}
      <AssetsControls
        window={window}
        onWindowChange={setWindow}
        aggregate={aggregate}
        onAggregateChange={setAggregate}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Main Content */}
      <div
        style={{
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        }}
      >
        {loading && !assetsData ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "4rem",
              gap: "1rem",
            }}
          >
            <Loading description="Loading assets data..." withOverlay={false} />
          </div>
        ) : availableTypes.length === 0 ? (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
              background: "linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)",
            }}
          >
            <h5 style={{ fontWeight: 600, marginBottom: "1rem" }}>
              No Assets Found
            </h5>
            <p style={{ color: "#525252", marginBottom: "1.5rem" }}>
              No asset data available for the selected time window and filters.
            </p>
            <div style={{
              padding: "1rem",
              backgroundColor: "#e5f6ff",
              border: "1px solid #0f62fe",
              borderRadius: "4px",
              maxWidth: "600px",
              margin: "0 auto",
            }}>
              <p style={{ margin: 0, color: "#161616" }}>
                Try adjusting your filters or time window to see asset data.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Carbon Tabs for asset types */}
            <Tabs selectedIndex={activeTab} onChange={(evt) => handleTabChange(evt, evt.selectedIndex)}>
              <TabList aria-label="Asset type tabs">
                {availableTypes.map((type) => (
                  <Tab key={type.value}>
                    {type.name} ({assetsByType[type.value]?.length || 0})
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {availableTypes.map((type, index) => (
                  <TabPanel key={type.value}>
                    <AssetTable
                      assets={assetsByType[type.value] || []}
                      assetType={type.value}
                      currency={currency}
                      loading={loading}
                      onAssetClick={handleAssetClick}
                    />
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </>
        )}
      </div>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        currency={currency}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />

      <Footer />
    </Page>
  );
};

export default Assets;
