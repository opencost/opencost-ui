import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Grid, Column, InlineNotification, Loading } from "@carbon/react";

import Page from "../components/Page";
import {
  StatCard,
  CostDistribution,
  AssetTypeChart,
  AssetsHeader,
  AssetTable,
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

  // Router integration for URL-based state
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(routerLocation.search);

  // Control state from URL params with defaults
  const window = searchParams.get("window") || "7d";
  const aggregate = searchParams.get("aggregate") || "type";
  const currency = searchParams.get("currency") || "USD";

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

  // Fetch data when window or aggregate changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute derived data
  const summary = useMemo(() => {
    if (!rawData) return { totalCost: 0, cpuCost: 0, ramCost: 0, gpuCost: 0 };
    const computed = AssetsService.calculateSummary(rawData);
    // Ensure all values are valid numbers
    return {
      totalCost: Number.isFinite(computed.totalCost) ? computed.totalCost : 0,
      cpuCost: Number.isFinite(computed.cpuCost) ? computed.cpuCost : 0,
      ramCost: Number.isFinite(computed.ramCost) ? computed.ramCost : 0,
      gpuCost: Number.isFinite(computed.gpuCost) ? computed.gpuCost : 0,
    };
  }, [rawData]);

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

  // Define custom colors for stat cards
  const colors = {
    total: "var(--color-total, #00539a)",
    cpu: "var(--color-cpu, #8a3ffc)",
    ram: "var(--color-ram, #007d79)",
    gpu: "var(--color-gpu, #ee5396)",
  };

  // Grid layout styles
  const gridStyle = {
    padding: "0 1rem",
  };

  const sectionStyle = {
    marginBottom: "1.5rem",
  };

  const cardContainerStyle = {
    height: "100%",
  };

  const chartContainerStyle = {
    backgroundColor: "var(--card-bg)",
    borderRadius: "4px",
    padding: "1rem",
    height: "100%",
    minHeight: "350px",
    transition: "background-color 0.2s ease",
  };

  const tableContainerStyle = {
    backgroundColor: "var(--card-bg)",
    borderRadius: "4px",
    padding: "1rem",
    transition: "background-color 0.2s ease",
  };

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
          isLoading={loading}
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

        {/* Main content grid */}
        <div style={gridStyle}>
          {/* Summary stat cards */}
          <Grid narrow style={sectionStyle}>
            <Column lg={4} md={4} sm={4} style={cardContainerStyle}>
              <StatCard
                label="Total Cost"
                value={formatCurrency(summary.totalCost)}
                color={colors.total}
              />
            </Column>
            <Column lg={4} md={4} sm={4} style={cardContainerStyle}>
              <StatCard
                label="CPU Cost"
                value={formatCurrency(summary.cpuCost)}
                subValue={
                  summary.totalCost > 0
                    ? `${((summary.cpuCost / summary.totalCost) * 100).toFixed(1)}% of total`
                    : null
                }
                color={colors.cpu}
              />
            </Column>
            <Column lg={4} md={4} sm={4} style={cardContainerStyle}>
              <StatCard
                label="RAM Cost"
                value={formatCurrency(summary.ramCost)}
                subValue={
                  summary.totalCost > 0
                    ? `${((summary.ramCost / summary.totalCost) * 100).toFixed(1)}% of total`
                    : null
                }
                color={colors.ram}
              />
            </Column>
            <Column lg={4} md={4} sm={4} style={cardContainerStyle}>
              <StatCard
                label="GPU Cost"
                value={formatCurrency(summary.gpuCost)}
                subValue={
                  summary.totalCost > 0
                    ? `${((summary.gpuCost / summary.totalCost) * 100).toFixed(1)}% of total`
                    : null
                }
                color={colors.gpu}
              />
            </Column>
          </Grid>

          {/* Cost distribution chart */}
          <Grid narrow style={sectionStyle}>
            <Column lg={8} md={8} sm={4}>
              <div style={chartContainerStyle}>
                <CostDistribution
                  data={chartData}
                  totalCost={summary.totalCost}
                  currency={currency}
                />
              </div>
            </Column>
            <Column lg={8} md={8} sm={4}>
              <div style={chartContainerStyle}>
                <AssetTypeChart
                  data={typeChartData}
                  currency={currency}
                />
              </div>
            </Column>
          </Grid>

          {/* Asset details table */}
          <div style={{ ...sectionStyle, ...tableContainerStyle }}>
            <AssetTable
              data={tableData}
              isLoading={loading}
              currency={currency}
            />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Assets;
