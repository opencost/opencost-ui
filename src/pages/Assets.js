import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Page from "../components/Page";
import Paper from "@mui/material/Paper";
import { Grid, Column, SkeletonPlaceholder, Tile, Dropdown } from "@carbon/react";

import { fetchAssets } from "../services/assets_services";
import { calculateMetrics, categorizeAssets, generateWastageAlerts } from "../services/asset_utils";
import { MOCK_ASSETS_DATA, TIME_RANGES } from "../constants/mockData";

import AssetSummaryCards from "../components/Assets/SummaryCards";
import AssetSavingsPanel from "../components/Assets/SavingsPanel";
import AssetCostDistribution from "../components/Assets/CostDistribution";
import AssetsTable from "../components/Assets/AssetsTable";

// Configuration: Set to false when connected to Kubernetes cluster
const USE_MOCK_DATA = true;

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState({ selectedItem: TIME_RANGES[3] });

  useEffect(() => {
    loadAssets();
  }, [timeRange.selectedItem]);

  const loadAssets = () => {
    setLoading(true);
    
    if (USE_MOCK_DATA) {
      // Mock data simulation with delay
      setTimeout(() => {
        const normalizedAssets = Object.values(MOCK_ASSETS_DATA[0]);
        setAssets(normalizedAssets);
        setLoading(false);
      }, 500);
    } else {
      // Real API call
      const window = timeRange.selectedItem?.id || "7d";
      fetchAssets(window)
        .then(data => setAssets(data || []))
        .catch(() => setAssets([]))
        .finally(() => setLoading(false));
    }
  };

  if (loading) {
    return (
      <Page active="assets.html">
        <Header headerTitle="Assets" />
        <div style={{ padding: 24 }}>
          <Grid narrow>
            {[1, 2, 3, 4].map(i => (
              <Column key={i} sm={4} md={4} lg={4}>
                <SkeletonPlaceholder style={{ height: 120 }} />
              </Column>
            ))}
          </Grid>
          <SkeletonPlaceholder style={{ height: 400, marginTop: 24 }} />
        </div>
        <Footer />
      </Page>
    );
  }

  if (assets.length === 0) {
    return (
      <Page active="assets.html">
        <Header headerTitle="Assets" />
        <Tile style={{ margin: 24, padding: 48, textAlign: "center" }}>
          <h3>No Asset Data Available</h3>
          <p style={{ color: "#525252", marginTop: 8 }}>
            Connect OpenCost to a Kubernetes cluster to view asset costs
          </p>
        </Tile>
        <Footer />
      </Page>
    );
  }

  const metrics = calculateMetrics(assets);
  const categorized = categorizeAssets(assets);
  const wastageAlerts = generateWastageAlerts(assets);

  return (
    <Page active="assets.html">
      <Header headerTitle="Assets" />

      <Paper id="report" style={{ padding: 25 }}>
        {/* Page Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 24 
        }}>
          <h3 style={{ margin: 0 }}>Assets Overview</h3>
          <Dropdown
            id="time-range-dropdown"
            titleText=""
            label="Time Range"
            items={TIME_RANGES}
            itemToString={(item) => item?.label || ""}
            selectedItem={timeRange.selectedItem}
            onChange={(selection) => setTimeRange(selection)}
            size="md"
          />
        </div>

        {/* Summary Cards */}
        <div style={{ marginBottom: 24 }}>
          <AssetSummaryCards metrics={metrics} />
        </div>

        {/* Savings Opportunities */}
        {wastageAlerts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <AssetSavingsPanel alerts={wastageAlerts} />
          </div>
        )}

        {/* Cost Distribution */}
        <div style={{ marginBottom: 24 }}>
          <AssetCostDistribution assets={assets} categorized={categorized} />
        </div>

        {/* Assets Table */}
        <Tile style={{ padding: 0 }}>
          <AssetsTable assets={assets} />
        </Tile>
      </Paper>

      <Footer />
    </Page>
  );
}
