import React, { useState } from "react";
import { Dropdown, Loading } from "@carbon/react";
import { Money, ServerDns, Cube, CloudApp, Sprout } from "@carbon/icons-react";
import "@carbon/styles/css/styles.css";

import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Custom Components
import MetricCard from "../components/Assets/MetricCard";
import AssetTable from "../components/Assets/AssetTable";
import CostCharts from "../components/Assets/CostCharts";
import Recommendations from "../components/Assets/Recommendations";

// Hooks & Utils
import useAssetData from "../hooks/useAssetData";
import { windowOptions, typeColors, formatCurrency } from "../utils/assets";

const AssetsPage = () => {
  const [selectedWindow, setSelectedWindow] = useState(windowOptions[2]); // Default: 7d
  const [searchTerm, setSearchTerm] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [resolution, setResolution] = useState("Daily");

  // Clean Data Fetching Logic via Custom Hook
  const { data, loading, metrics, filteredData, recommendations } = useAssetData(selectedWindow, searchTerm, currency);

  return (
    <Page active="/assets">
      <Header headerTitle={
        <span style={{
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          fontSize: "2.5rem",
          color: "#1c1917"
        }}>
          Assets
        </span>
      }>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {/* Resolution Filter */}
          <div style={{ width: "140px" }}>
            <Dropdown
              id="resolution-dropdown"
              label="Resolution"
              titleText=""
              items={["Daily", "Weekly", "Monthly"]}
              selectedItem={resolution}
              onChange={({ selectedItem }) => setResolution(selectedItem)}
              size="md"
              type="inline"
            />
          </div>

          {/* Currency Filter */}
          <div style={{ width: "120px" }}>
            <Dropdown
              id="currency-dropdown"
              label="Currency"
              titleText=""
              items={["USD", "EUR", "GBP"]}
              selectedItem={currency}
              onChange={({ selectedItem }) => setCurrency(selectedItem)}
              size="md"
              type="inline"
            />
          </div>

          {/* Date Range Selector (Dropdown) */}
          <div style={{ width: "180px" }}>
            <Dropdown
              id="window-dropdown"
              label="Time Range"
              titleText=""
              items={windowOptions}
              itemToString={(item) => (item ? item.text : "")}
              selectedItem={selectedWindow}
              onChange={({ selectedItem }) => setSelectedWindow(selectedItem)}
              size="md"
              type="inline"
            />
          </div>
        </div>
      </Header>

      <div style={{ padding: "0 24px 24px 0" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
            <Loading withOverlay={false} description="Loading assets..." />
          </div>
        ) : (
          <>
            {/* 1. Top Level Metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "24px",
                marginBottom: "40px",
              }}
            >
              <MetricCard
                title="Total Cost"
                value={formatCurrency(metrics.totalCost, currency)}
                icon={<Money size={24} />}
                theme={typeColors.Total}
                trend={`${data.length} assets tracked`}
              />
              <MetricCard
                title="Compute (Nodes)"
                value={formatCurrency(metrics.nodeCost, currency)}
                icon={<ServerDns size={24} />}
                theme={typeColors.Node}
                trend={`${data.filter((d) => d.type === "Node").length} nodes`}
              />
              <MetricCard
                title="Storage (Disks)"
                value={formatCurrency(metrics.diskCost, currency)}
                icon={<Cube size={24} />}
                theme={typeColors.Disk}
                trend={`${data.filter((d) => d.type === "Disk").length} disks`}
              />
              <MetricCard
                title="Network (Load Balancers)"
                value={formatCurrency(metrics.lbCost, currency)}
                icon={<CloudApp size={24} />}
                theme={typeColors.LoadBalancer}
                trend={`${data.filter((d) => d.type === "LoadBalancer").length} LBs`}
              />
              <MetricCard
                title="Est. Carbon Footprint"
                value={`${metrics.carbonFootprint.toFixed(1)} kg`}
                icon={<Sprout size={24} />}
                theme={typeColors.Carbon}
                trend="Based on grid carbon intensity"
              />
            </div>

            {/* 2. Recommendations Engine */}
            <Recommendations recommendations={recommendations} />

            {/* 3. Data Visualization */}
            <CostCharts metrics={metrics} currency={currency} />

            {/* 4. Detailed Data Table */}
            <AssetTable
              filteredData={filteredData}
              totalCount={data.length}
              onSearch={setSearchTerm}
            />
          </>
        )}
      </div>
      <Footer />
    </Page>
  );
};

export default AssetsPage;
