import { useState, useEffect, useMemo } from "react";
import { Loading, InlineNotification, ContentSwitcher, Switch } from "@carbon/react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AssetsService from "../services/assets";
import KPICards from "../components/assets/KPICards";
import CostDistributionChart from "../components/assets/CostDistributionChart";
import CostEfficiencyChart from "../components/assets/CostEfficiencyChart";
import CostUtilizationChart from "../components/assets/CostUtilizationChart";
import AssetTable from "../components/assets/AssetTable";
import FilterPanel from "../components/assets/FilterPanel";
import InsightsPanel from "../components/assets/InsightsPanel";
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

const TIME_WINDOWS = ["7d", "14d", "30d", "60d", "90d"];

const INITIAL_FILTERS = {
  status: [],
  assetType: [],
  storageClass: [],
  cluster: [],
  search: "",
};

const AssetsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [useMockData, setUseMockData] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [timeWindow, setTimeWindow] = useState("30d");

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (useMockData) {
        result = AssetsService.getMockData();
        await new Promise((r) => setTimeout(r, 500));
      } else {
        result = await AssetsService.fetchAssets(timeWindow);
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
  }, [useMockData, timeWindow]);

  const filteredAssets = useMemo(
    () => applyFilters(assets, filters),
    [assets, filters]
  );

  const filterOptions = useMemo(() => ({
    clusters: [...new Set(assets.map((a) => a.cluster))],
    storageClasses: [...new Set(assets.map((a) => a.storageClass).filter(Boolean))],
    assetTypes: [...new Set(assets.map((a) => a.assetType))],
  }), [assets]);

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
            <button onClick={fetchAssets} className="btn-retry">Retry</button>
            <button onClick={() => setUseMockData(true)} className="btn-mock">
              Use Mock Data
            </button>
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
          <button onClick={() => setUseMockData(true)} className="btn-mock">
            Load Mock Data
          </button>
        </div>
        <Footer />
      </Page>
    );
  }

  return (
    <Page active="/assets">
      <Header headerTitle="Storage Assets">
        <div className="header-actions">
          {useMockData && <span className="mock-data-badge">Mock Data</span>}
          <ContentSwitcher
            size="sm"
            selectedIndex={TIME_WINDOWS.indexOf(timeWindow)}
            onChange={(e) => setTimeWindow(TIME_WINDOWS[e.index])}
          >
            {TIME_WINDOWS.map((w) => (
              <Switch key={w} name={w} text={w} />
            ))}
          </ContentSwitcher>
          <button onClick={fetchAssets} className="btn-refresh" title="Refresh">
            ↻
          </button>
        </div>
      </Header>

      <div className="assets-dashboard">
        <section className="kpi-section">
          <KPICards assets={filteredAssets} timeWindow={timeWindow} />
        </section>

        <section className="charts-section">
          <CostDistributionChart assets={filteredAssets} />
          <CostEfficiencyChart assets={filteredAssets} />
          <CostUtilizationChart assets={filteredAssets} />
        </section>

        {filteredAssets.length > 0 && (
          <section className="insights-section">
            <InsightsPanel assets={filteredAssets} />
          </section>
        )}

        <section className="filters-section">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
            useMockData={useMockData}
            onMockDataToggle={setUseMockData}
          />
        </section>

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
              <button onClick={() => setFilters(INITIAL_FILTERS)}>
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
