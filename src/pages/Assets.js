import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  CircularProgress,
  IconButton,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
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
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
          p: 3,
          mb: 3,
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Assets
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Infrastructure-level cost breakdown
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2">Currency:</Typography>
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
            </Box>
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Warnings warnings={errors} />

      {/* Topline Summary */}
      {toplineData && toplineData.data && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "12px",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: 1 }}>
              Total Cost
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
              {toCurrency(toplineData.data.totalCost || 0, currency)}
            </Typography>
          </Paper>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              borderRadius: "12px",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: 1 }}>
              Adjustment
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
              {toCurrency(toplineData.data.adjustment || 0, currency)}
            </Typography>
          </Paper>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              borderRadius: "12px",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: 1 }}>
              Assets
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
              {toplineData.data.numResults || 0}
            </Typography>
          </Paper>
        </Box>
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
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {loading && !assetsData ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 8,
              gap: 2,
            }}
          >
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" color="textSecondary">
              Loading assets data...
            </Typography>
          </Box>
        ) : availableTypes.length === 0 ? (
          <Box
            sx={{
              p: 8,
              textAlign: "center",
              background: "linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)",
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              No Assets Found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              No asset data available for the selected time window and filters.
            </Typography>
            <Alert severity="info" sx={{ maxWidth: 600, mx: "auto" }}>
              Try adjusting your filters or time window to see asset data.
            </Alert>
          </Box>
        ) : (
          <>
            {/* Tabs for asset types */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                {availableTypes.map((type) => (
                  <Tab
                    key={type.value}
                    label={`${type.name} (${assetsByType[type.value]?.length || 0})`}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Table for active tab */}
            {availableTypes.map((type, index) => (
              <Box
                key={type.value}
                role="tabpanel"
                hidden={activeTab !== index}
                sx={{ p: 0 }}
              >
                {activeTab === index && (
                  <AssetTable
                    assets={assetsByType[type.value] || []}
                    assetType={type.value}
                    currency={currency}
                    loading={loading}
                    onAssetClick={handleAssetClick}
                  />
                )}
              </Box>
            ))}
          </>
        )}
      </Paper>

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
