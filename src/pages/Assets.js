import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Grid, Column, InlineNotification, Loading } from "@carbon/react";

import Page from "../components/Page";
import {
  KPITile,
  CostDistribution,
  AssetTypeChart,
  AssetsHeader,
  AssetTable,
  AssetDetailPanel,
} from "../components/assets";
import AssetsService from "../services/assets";

/**
 * Assets Page - Main controller for the Assets view
 * Displays infrastructure asset costs using Carbon Design System
 */
const Assets = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Router integration for URL-based state
  const routerLocation = useLocation();
  const navigate = useNavigate();
  
  // Memoize URL params to prevent unnecessary refetches on theme change
  const window = useMemo(() => {
    const params = new URLSearchParams(routerLocation.search);
    return params.get("window") || "7d";
  }, [routerLocation.search]);
  
  const aggregate = useMemo(() => {
    const params = new URLSearchParams(routerLocation.search);
    return params.get("aggregate") || "type";
  }, [routerLocation.search]);
  
  const currency = useMemo(() => {
    const params = new URLSearchParams(routerLocation.search);
    return params.get("currency") || "USD";
  }, [routerLocation.search]);

  // Update URL when controls change
  const setWindow = useCallback(
    (value) => {
      const params = new URLSearchParams(routerLocation.search);
      params.set("window", value);
      navigate({ search: params.toString() }, { replace: true });
    },
    [navigate, routerLocation.search]
  );

  const setAggregate = useCallback(
    (value) => {
      const params = new URLSearchParams(routerLocation.search);
      params.set("aggregate", value);
      navigate({ search: params.toString() }, { replace: true });
    },
    [navigate, routerLocation.search]
  );

  // Fetch assets data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await AssetsService.fetchAssets({
        window,
        aggregate,
        accumulate: true,
      });

      // API returns the assets object directly (not wrapped in {data: ...})
      if (response && typeof response === "object") {
        setRawData(response);
      } else {
        setRawData({});
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError({
        title: "Error fetching assets",
        subtitle: err.message || "An unknown error occurred",
      });
      setRawData(null);
    } finally {
      setLoading(false);
    }
  }, [window, aggregate]);

  // Fetch data only when window or aggregate actually changes
  // Using string values directly prevents refetch on theme toggle
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window, aggregate]);

  // Handle CSV export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await AssetsService.exportAssetsCsv({ window, aggregate });
    } catch (err) {
      setError({
        title: "Export failed",
        subtitle: err.message || "Could not export CSV",
      });
    } finally {
      setIsExporting(false);
    }
  }, [window, aggregate]);

  // Compute derived data
  const summary = useMemo(() => {
    if (!rawData) return { totalCost: 0, cpuCost: 0, ramCost: 0, gpuCost: 0, assetCount: 0 };
    const computed = AssetsService.calculateSummary(rawData);
    // Ensure all values are valid numbers
    return {
      totalCost: Number.isFinite(computed.totalCost) ? computed.totalCost : 0,
      cpuCost: Number.isFinite(computed.cpuCost) ? computed.cpuCost : 0,
      ramCost: Number.isFinite(computed.ramCost) ? computed.ramCost : 0,
      gpuCost: Number.isFinite(computed.gpuCost) ? computed.gpuCost : 0,
      assetCount: Object.keys(rawData || {}).length,
    };
  }, [rawData]);

  // Mock trend data - in production this would come from comparing periods
  const trends = useMemo(() => ({
    total: 5.2,   // +5.2% increase
    cpu: -2.1,    // -2.1% decrease
    ram: 8.4,     // +8.4% increase
    gpu: 12.3,    // +12.3% increase
  }), []);

  const tableData = useMemo(() => {
    if (!rawData) return [];
    return AssetsService.transformToTableRows(rawData);
  }, [rawData]);

  const chartData = useMemo(() => {
    return AssetsService.transformToChartData(summary);
  }, [summary]);

  // Chart data grouped by asset type (Node, Disk, LoadBalancer, etc.)
  const typeChartData = useMemo(() => {
    if (!rawData) return [];
    return AssetsService.transformToTypeChartData(rawData);
  }, [rawData]);

  // Format currency for display
  const formatCurrency = (value) => {
    const numValue = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Define accent colors for KPI tiles using Carbon tokens
  const accentColors = {
    total: "var(--cds-support-info, #0043ce)",
    cpu: "var(--cds-support-warning, #8a3ffc)",
    ram: "var(--cds-support-success, #007d79)",
    gpu: "var(--cds-support-error, #ee5396)",
  };

  // Handle export from table
  const handleTableExport = useCallback((selectedData) => {
    console.log("Exporting data:", selectedData);
    handleExport();
  }, [handleExport]);

  return (
    <Page active="/assets">
      <div className="assets-page">
        {/* Loading overlay */}
        {loading && (
          <Loading
            active={loading}
            description="Loading assets..."
            withOverlay={true}
          />
        )}

        {/* Header with controls */}
        <AssetsHeader
          window={window}
          setWindow={setWindow}
          aggregate={aggregate}
          setAggregate={setAggregate}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isLoading={loading}
          isExporting={isExporting}
        />

        {/* Error notification */}
        {error && (
          <div style={{ marginBottom: "1rem", padding: "0 1rem" }}>
            <InlineNotification
              kind="error"
              title={error.title}
              subtitle={error.subtitle}
              lowContrast
              hideCloseButton={false}
              onCloseButtonClick={() => setError(null)}
            />
          </div>
        )}

        {/* Main content grid - 16 column layout */}
        <Grid fullWidth style={{ padding: "0 1rem" }}>
          
          {/* Row 1: KPI Tiles - 4 columns each */}
          <Column lg={4} md={4} sm={4} style={{ marginBottom: "1rem" }}>
            <KPITile
              label="Total Cost"
              value={formatCurrency(summary.totalCost)}
              accentColor={accentColors.total}
            />
          </Column>
          <Column lg={4} md={4} sm={4} style={{ marginBottom: "1rem" }}>
            <KPITile
              label="CPU Cost"
              value={formatCurrency(summary.cpuCost)}
              percentOfTotal={summary.totalCost > 0 ? (summary.cpuCost / summary.totalCost) * 100 : 0}
              accentColor={accentColors.cpu}
            />
          </Column>
          <Column lg={4} md={4} sm={4} style={{ marginBottom: "1rem" }}>
            <KPITile
              label="RAM Cost"
              value={formatCurrency(summary.ramCost)}
              percentOfTotal={summary.totalCost > 0 ? (summary.ramCost / summary.totalCost) * 100 : 0}
              accentColor={accentColors.ram}
            />
          </Column>
          <Column lg={4} md={4} sm={4} style={{ marginBottom: "1rem" }}>
            <KPITile
              label="GPU Cost"
              value={formatCurrency(summary.gpuCost)}
              percentOfTotal={summary.totalCost > 0 ? (summary.gpuCost / summary.totalCost) * 100 : 0}
              accentColor={accentColors.gpu}
            />
          </Column>

          {/* Row 2: Charts - 8 columns each */}
          <Column lg={8} md={8} sm={4} style={{ marginBottom: "1rem" }}>
            <div
              style={{
                backgroundColor: "var(--cds-layer-01, var(--card-bg))",
                borderRadius: "4px",
                padding: "1rem",
                height: "100%",
                minHeight: "350px",
                border: "1px solid var(--cds-border-subtle-01, var(--border-subtle))",
              }}
            >
              <CostDistribution
                data={chartData}
                totalCost={summary.totalCost}
                currency={currency}
              />
            </div>
          </Column>
          <Column lg={8} md={8} sm={4} style={{ marginBottom: "1rem" }}>
            <div
              style={{
                backgroundColor: "var(--cds-layer-01, var(--card-bg))",
                borderRadius: "4px",
                padding: "1rem",
                height: "100%",
                minHeight: "350px",
                border: "1px solid var(--cds-border-subtle-01, var(--border-subtle))",
              }}
            >
              <AssetTypeChart
                data={typeChartData}
                currency={currency}
              />
            </div>
          </Column>

          {/* Row 3: Data Table - Full 16 columns */}
          <Column lg={16} md={8} sm={4} style={{ marginBottom: "1rem" }}>
            <div
              style={{
                backgroundColor: "var(--cds-layer-01, var(--card-bg))",
                borderRadius: "4px",
                border: "1px solid var(--cds-border-subtle-01, var(--border-subtle))",
              }}
            >
              <AssetTable
                data={tableData}
                isLoading={loading}
                currency={currency}
                onRowClick={(asset) => setSelectedAsset(asset)}
                onExport={handleTableExport}
              />
            </div>
          </Column>
        </Grid>

        {/* Asset Detail Panel */}
        <AssetDetailPanel
          asset={selectedAsset}
          isOpen={selectedAsset !== null}
          onClose={() => setSelectedAsset(null)}
          currency={currency}
        />
      </div>
    </Page>
  );
};

export default Assets;
