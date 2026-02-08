import { useState, useEffect, useMemo } from "react";
import {
  InlineNotification,
  SkeletonPlaceholder,
  DataTableSkeleton,
  SkeletonText,
  Button,
} from "@carbon/react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AssetsService from "../services/assets";
import AssetsHeader from "../components/assets/AssetsHeader";
import KPICards from "../components/assets/KPICards";
import CostDistributionChart from "../components/assets/CostDistributionChart";
import CostUtilizationChart from "../components/assets/CostUtilizationChart";
import CostTrendChart from "../components/assets/CostTrendChart";
import AssetTable from "../components/assets/AssetTable";
import FilterPanel from "../components/assets/FilterPanel";
import InsightsPanel from "../components/assets/InsightsPanel";
import AssetDetailPanel from "../components/assets/AssetDetailPanel";
import "../styles/assets/dashboard.css";
import "../styles/assets/charts-layout.css";

function transformAssetData(rawData) {
  if (!rawData || typeof rawData !== "object") return [];

  const assets = [];

  Object.entries(rawData).forEach(([clusterKey, clusterData]) => {
    if (!clusterData || typeof clusterData !== "object") return;

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
}

function applyFilters(assets, filters) {
  let filtered = [...assets];

  if (filters.status?.length > 0) {
    filtered = filtered.filter((asset) => {
      const idle = (asset.breakdown?.idle || 0) * 100;
      if (filters.status.includes("ok") && idle < 40) return true;
      if (filters.status.includes("review") && idle >= 40 && idle < 80) return true;
      if (filters.status.includes("waste") && idle >= 80) return true;
      return false;
    });
  }

  if (filters.assetType?.length > 0) {
    filtered = filtered.filter((a) => filters.assetType.includes(a.assetType));
  }

  if (filters.storageClass?.length > 0) {
    filtered = filtered.filter((a) => filters.storageClass.includes(a.storageClass));
  }

  if (filters.cluster?.length > 0) {
    filtered = filtered.filter((a) => filters.cluster.includes(a.cluster));
  }

  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.claimNamespace && a.claimNamespace.toLowerCase().includes(q)) ||
        a.cluster.toLowerCase().includes(q)
    );
  }

  return filtered;
}

const INITIAL_FILTERS = {
  status: [],
  assetType: [],
  storageClass: [],
  cluster: [],
  search: "",
};

const SkeletonDashboard = () => (
  <div className="assets-dashboard">
    <section className="kpi-section">
      <div className="kpi-cards-container">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <SkeletonPlaceholder className="skeleton-kpi" />
          </div>
        ))}
      </div>
    </section>
    <section className="insights-section">
      <SkeletonText heading width="200px" />
      <SkeletonText paragraph lineCount={3} />
    </section>
    <section className="charts-section">
      <div className="skeleton-chart-tile">
        <SkeletonPlaceholder className="skeleton-chart" />
      </div>
      <div className="skeleton-chart-tile">
        <SkeletonPlaceholder className="skeleton-chart" />
      </div>
    </section>
    <section className="table-section">
      <DataTableSkeleton
        columnCount={6}
        rowCount={5}
        showHeader={false}
        showToolbar={false}
      />
    </section>
  </div>
);

const AssetsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [useMockData, setUseMockData] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [timeWindow, setTimeWindow] = useState("30d");
  const [aggregateBy, setAggregateBy] = useState("type");
  const [accumulate, setAccumulate] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (useMockData) {
        result = AssetsService.getMockData(timeWindow, aggregateBy, accumulate);
        await new Promise((r) => setTimeout(r, 500));
      } else {
        result = await AssetsService.fetchAssets(timeWindow, {
          aggregate: aggregateBy,
          accumulate,
        });
      }

      if (result?.data) {
        const transformed = transformAssetData(result.data);
        setAssets(transformed);
        if (transformed.length === 0) setError("No assets found in the data");
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

  useEffect(() => {
    fetchAssets();
  }, [useMockData, timeWindow, aggregateBy, accumulate]);

  const filteredAssets = useMemo(
    () => applyFilters(assets, filters),
    [assets, filters]
  );

  const filterOptions = useMemo(() => ({
    clusters: [...new Set(assets.map((a) => a.cluster))],
    storageClasses: [...new Set(assets.map((a) => a.storageClass).filter(Boolean))],
    assetTypes: [...new Set(assets.map((a) => a.assetType))],
  }), [assets]);

  const handleRowClick = (asset) => {
    setSelectedAsset(asset);
    setPanelOpen(true);
  };

  const handlePanelClose = () => {
    setPanelOpen(false);
  };

  if (loading) {
    return (
      <Page active="/assets">
        <Header headerTitle="Storage Assets" />
        <SkeletonDashboard />
        <Footer />
      </Page>
    );
  }

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
            <Button kind="secondary" size="md" onClick={fetchAssets}>Retry</Button>
            <Button kind="primary" size="md" onClick={() => setUseMockData(true)}>
              Use Mock Data
            </Button>
          </div>
        </div>
        <Footer />
      </Page>
    );
  }

  if (assets.length === 0) {
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
          <Button kind="primary" size="md" onClick={() => setUseMockData(true)}>
            Load Mock Data
          </Button>
        </div>
        <Footer />
      </Page>
    );
  }

  return (
    <Page active="/assets">
      <Header headerTitle="Storage Assets">
        <AssetsHeader
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
          aggregateBy={aggregateBy}
          onAggregateByChange={setAggregateBy}
          accumulate={accumulate}
          onAccumulateChange={setAccumulate}
          onRefresh={fetchAssets}
          useMockData={useMockData}
        />
      </Header>

      <div className="assets-dashboard">
        {/* Top: KPI Cards */}
        <section className="kpi-section">
          <KPICards assets={filteredAssets} timeWindow={timeWindow} />
        </section>

        {/* Second: InsightsPanel (full width, actionable recommendations) */}
        {filteredAssets.length > 0 && (
          <section className="insights-section">
            <InsightsPanel assets={filteredAssets} />
          </section>
        )}

        {/* Third: Chart Row 1 — CostTrendChart (left) + CostUtilizationChart (right) */}
        <section className="charts-section charts-row">
          <CostTrendChart assets={filteredAssets} timeWindow={timeWindow} aggregateBy={aggregateBy} />
          <CostUtilizationChart assets={filteredAssets} timeWindow={timeWindow} aggregateBy={aggregateBy} />
        </section>

        {/* Fourth: Chart Row 2 — CostDistributionChart (full width) */}
        <section className="charts-section charts-full">
          <CostDistributionChart assets={filteredAssets} timeWindow={timeWindow} aggregateBy={aggregateBy} />
        </section>

        <section className="filters-section">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
            useMockData={useMockData}
            onMockDataToggle={setUseMockData}
          />
        </section>

        {/* Bottom: Asset Table */}
        <section className="table-section">
          {filteredAssets.length > 0 ? (
            <AssetTable
              assets={filteredAssets}
              totalAssets={assets.length}
              filteredAssets={filteredAssets.length}
              onRowClick={handleRowClick}
            />
          ) : (
            <div className="no-results">
              <p>No assets match the current filters</p>
              <Button kind="secondary" size="sm" onClick={() => setFilters(INITIAL_FILTERS)}>
                Clear Filters
              </Button>
            </div>
          )}
        </section>
      </div>

      <AssetDetailPanel
        asset={selectedAsset}
        isOpen={panelOpen}
        onClose={handlePanelClose}
      />

      <Footer />
    </Page>
  );
};

export default AssetsDashboard;
