import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { get, find } from "lodash";
import {
  Button,
  DatePicker,
  DatePickerInput,
  Heading,
  Loading,
  Modal,
  Pagination,
  Search,
  SelectableTag,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tile,
} from "@carbon/react";
import {
  AssemblyCluster,
  Calendar,
  Chip,
  ChartLine,
  Close,
  Cube,
  CurrencyDollar,
  DataBase,
  LoadBalancerNetwork,
  Network_4,
  Renew,
  StoragePool,
} from "@carbon/icons-react";
import { endOfDay, startOfDay, isValid } from "date-fns";

import Header from "../components/Header";
import Page from "../components/Page";
import Footer from "../components/Footer";
import Warnings from "../components/Warnings";
import AssetsService from "../services/assets";
import { checkCustomWindow, toCurrency, toVerboseTimeRange } from "../util";

import AssetControls from "../components/assets/assetControls";
import AssetTable from "../components/assets/assetTable";
import AssetDetailModal from "../components/assets/assetDetailModal";
import SummaryCard from "../components/assets/SummaryCard";
import SavingsOpportunities from "../components/assets/SavingsOpportunities";
import {
  AssetTypePieChart,
  TopAssetsCostBarChart,
  NodeCostBreakdownChart,
  NodeUtilizationChart,
  CostDistributionTreemap,
} from "../components/assets/assetCharts";
import { windowOptions } from "../components/assets/tokens";

function getWindowDays(windowStr) {
  switch (windowStr) {
    case "today": return 1;
    case "yesterday": return 1;
    case "24h": return 1;
    case "48h": return 2;
    case "week": {
      const d = new Date().getDay();
      return d === 0 ? 7 : d;
    }
    case "lastweek": return 7;
    case "7d": return 7;
    case "14d": return 14;
    default: {
      if (checkCustomWindow(windowStr)) {
        const [s, e] = windowStr.split(",");
        return Math.max(1, Math.ceil((new Date(e) - new Date(s)) / 86400000));
      }
      return 7;
    }
  }
}

function getPreviousWindow(windowStr) {
  const days = getWindowDays(windowStr);
  if (days <= 0) return null;
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - days);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  const fmt = (d) => d.toISOString().split(".")[0] + "Z";
  return `${fmt(start)},${fmt(end)}`;
}

function normalizeAssets(response) {
  if (!response || !response.data) return [];

  const data = response.data;
  const assets = [];

  if (Array.isArray(data)) {
    data.forEach((assetMap) => {
      if (!assetMap || typeof assetMap !== "object") return;
      Object.entries(assetMap).forEach(([key, asset]) => {
        assets.push({ ...asset, key });
      });
    });
    return assets;
  }

  if (data && typeof data === "object") {
    Object.entries(data).forEach(([key, asset]) => {
      assets.push({ ...asset, key });
    });
  }

  return assets;
}

function sortAssets(assets, sortBy, direction) {
  const dir = direction === "asc" ? 1 : -1;
  return [...assets].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case "name":
        aVal = (a.properties?.name || a.key || "").toLowerCase();
        bVal = (b.properties?.name || b.key || "").toLowerCase();
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case "type":
        aVal = a.type || "";
        bVal = b.type || "";
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case "provider":
        aVal = a.properties?.provider || "";
        bVal = b.properties?.provider || "";
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case "cluster":
        aVal = a.properties?.cluster || "";
        bVal = b.properties?.cluster || "";
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case "category":
        aVal = a.properties?.category || "";
        bVal = b.properties?.category || "";
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case "cpuCost":
        return ((a.cpuCost || 0) - (b.cpuCost || 0)) * dir;
      case "ramCost":
        return ((a.ramCost || 0) - (b.ramCost || 0)) * dir;
      case "gpuCost":
        return ((a.gpuCost || 0) - (b.gpuCost || 0)) * dir;
      case "adjustment":
        return ((a.adjustment || 0) - (b.adjustment || 0)) * dir;
      case "totalCost":
      default:
        return ((a.totalCost || 0) - (b.totalCost || 0)) * dir;
    }
  });
}

function downloadCSV(assets, currency) {
  const header = "Name,Type,Provider,Cluster,Category,CPU Cost,RAM Cost,GPU Cost,Adjustment,Total Cost\n";
  const rows = assets.map((a) => {
    return [
      `"${a.properties?.name || a.key || ""}"`,
      a.type,
      a.properties?.provider || "",
      a.properties?.cluster || "",
      a.properties?.category || "",
      (a.cpuCost || 0).toFixed(2),
      (a.ramCost || 0).toFixed(2),
      (a.gpuCost || 0).toFixed(2),
      (a.adjustment || 0).toFixed(2),
      (a.totalCost || 0).toFixed(2),
    ].join(",");
  });
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `opencost-assets-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const Assets = () => {
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const win = searchParams.get("window") || "7d";
  const aggregateBy = searchParams.get("agg") || "";
  const currency = searchParams.get("currency") || "USD";

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("totalCost");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [activeTab, setActiveTab] = useState(0);
  const [typeFilter, setTypeFilter] = useState(null);
  const [showCharts, setShowCharts] = useState(true);

  const [prevRawData, setPrevRawData] = useState(null);

  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [customStartHelper, setCustomStartHelper] = useState("");
  const [customEndHelper, setCustomEndHelper] = useState("");

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const windowName = useMemo(() => {
    const optionName = get(find(windowOptions, { value: win }), "name", "");
    if (optionName) return optionName;
    if (checkCustomWindow(win)) return toVerboseTimeRange(win);
    return win;
  }, [win]);

  const setWindow = (v) => {
    searchParams.set("window", v);
    navigate({ search: `?${searchParams.toString()}` });
  };
  const setAggregateBy = (v) => {
    searchParams.set("agg", v);
    navigate({ search: `?${searchParams.toString()}` });
  };
  const setCurrency = (v) => {
    searchParams.set("currency", v);
    navigate({ search: `?${searchParams.toString()}` });
  };

  const openCustomRange = () => {
    setCustomStartDate(null);
    setCustomEndDate(null);
    setCustomStartHelper("");
    setCustomEndHelper("");
    setCustomRangeOpen(true);
  };

  const closeCustomRange = () => {
    setCustomRangeOpen(false);
  };

  const handleCustomStartChange = (date) => {
    setCustomStartHelper("");
    if (isValid(date)) {
      setCustomStartDate(startOfDay(date));
    }
  };

  const handleCustomEndChange = (date) => {
    setCustomEndHelper("");
    if (isValid(date)) {
      setCustomEndDate(endOfDay(date));
    }
  };

  const applyCustomRange = () => {
    if (!customStartDate) {
      setCustomStartHelper("Start date is required.");
      return;
    }
    if (!customEndDate) {
      setCustomEndHelper("End date is required.");
      return;
    }
    const adjustedStartDate = new Date(
      customStartDate - customStartDate.getTimezoneOffset() * 60000,
    );
    const adjustedEndDate = new Date(
      customEndDate - customEndDate.getTimezoneOffset() * 60000,
    );
    const intervalString =
      adjustedStartDate.toISOString().split(".")[0] +
      "Z," +
      adjustedEndDate.toISOString().split(".")[0] +
      "Z";
    setWindow(intervalString);
    setCustomRangeOpen(false);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    try {
      const prevWindow = getPreviousWindow(win);
      const promises = [
        AssetsService.fetchAssets(win, aggregateBy || undefined, true),
      ];
      if (prevWindow) {
        promises.push(
          AssetsService.fetchAssets(prevWindow, aggregateBy || undefined, true).catch(() => null)
        );
      }
      const [resp, prevResp] = await Promise.all(promises);

      if (resp && resp.data) {
        setRawData(resp);
      } else {
        setErrors([{ primary: "No data returned", secondary: "The assets API did not return any data for this window." }]);
        setRawData(null);
      }
      setPrevRawData(prevResp || null);
    } catch (err) {
      let secondary = "Please check your OpenCost backend configuration.";
      if (err.message) secondary = err.message;
      setErrors([{ primary: "Failed to load assets data", secondary }]);
      setRawData(null);
      setPrevRawData(null);
    }
    setLoading(false);
  }, [win, aggregateBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allAssets = useMemo(() => normalizeAssets(rawData), [rawData]);

  const filteredAssets = useMemo(() => {
    let result = allAssets;
    if (typeFilter) {
      result = result.filter((a) => a.type === typeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          (a.properties?.name || a.key || "").toLowerCase().includes(q) ||
          (a.type || "").toLowerCase().includes(q) ||
          (a.properties?.provider || "").toLowerCase().includes(q) ||
          (a.properties?.cluster || "").toLowerCase().includes(q) ||
          (a.properties?.category || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [allAssets, typeFilter, searchQuery]);

  const sortedAssets = useMemo(
    () => sortAssets(filteredAssets, sortBy, sortDirection),
    [filteredAssets, sortBy, sortDirection]
  );

  const totalPages = Math.ceil(sortedAssets.length / rowsPerPage);
  const pagedAssets = sortedAssets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => setPage(0), [typeFilter, searchQuery, sortBy, sortDirection, win, aggregateBy, rowsPerPage]);

  const stats = useMemo(() => {
    const types = {};
    const typeCounts = {};
    let totalCost = 0;
    let totalAdjustment = 0;
    let totalCPU = 0;
    let totalRAM = 0;
    let totalGPU = 0;
    const providers = new Set();
    const clusters = new Set();

    allAssets.forEach((a) => {
      const t = a.type || "Other";
      types[t] = (types[t] || 0) + (a.totalCost || 0);
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      totalCost += a.totalCost || 0;
      totalAdjustment += a.adjustment || 0;
      totalCPU += a.cpuCost || 0;
      totalRAM += a.ramCost || 0;
      totalGPU += a.gpuCost || 0;
      if (a.properties?.provider) providers.add(a.properties.provider);
      if (a.properties?.cluster) clusters.add(a.properties.cluster);
    });

    return { types, typeCounts, totalCost, totalAdjustment, totalCPU, totalRAM, totalGPU, providers: [...providers], clusters: [...clusters] };
  }, [allAssets]);

  const nodes = useMemo(() => allAssets.filter((a) => a.type === "Node"), [allAssets]);

  const prevStats = useMemo(() => {
    const prevAssets = normalizeAssets(prevRawData);
    if (prevAssets.length === 0) return null;
    let totalCost = 0, totalCPU = 0, totalRAM = 0, totalGPU = 0, totalAdjustment = 0;
    prevAssets.forEach((a) => {
      totalCost += a.totalCost || 0;
      totalCPU += a.cpuCost || 0;
      totalRAM += a.ramCost || 0;
      totalGPU += a.gpuCost || 0;
      totalAdjustment += a.adjustment || 0;
    });
    return { totalCost, totalCPU, totalRAM, totalGPU, totalAdjustment, count: prevAssets.length };
  }, [prevRawData]);

  const efficiencyScore = useMemo(() => {
    const utilNodes = nodes.filter((n) => n.cpuBreakdown);
    if (utilNodes.length === 0) return null;
    let totalScore = 0;
    let totalWeight = 0;
    utilNodes.forEach((n) => {
      const cpuUtil = (1 - (n.cpuBreakdown?.idle || 1)) * 100;
      const ramUtil = n.ramBreakdown ? (1 - (n.ramBreakdown.idle || 1)) * 100 : 50;
      const weight = n.totalCost || 1;
      totalScore += (cpuUtil * 0.6 + ramUtil * 0.4) * weight;
      totalWeight += weight;
    });
    return totalWeight > 0 ? Math.min(100, Math.round(totalScore / totalWeight)) : null;
  }, [nodes]);

  const monthlyForecast = useMemo(() => {
    const days = getWindowDays(win);
    if (days <= 0 || stats.totalCost <= 0) return null;
    return (stats.totalCost / days) * 30;
  }, [stats.totalCost, win]);

  const trends = useMemo(() => {
    if (!prevStats) return {};
    const compute = (current, previous, isCost = true) => {
      if (!previous || previous === 0) return null;
      const pct = ((current - previous) / Math.abs(previous)) * 100;
      const direction = pct > 1 ? "up" : pct < -1 ? "down" : "flat";
      const color =
        direction === "flat"
          ? "default"
          : isCost
            ? direction === "up" ? "error" : "success"
            : direction === "up" ? "success" : "error";
      return {
        direction,
        label: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}% vs prev`,
        color,
      };
    };
    return {
      totalCost: compute(stats.totalCost, prevStats.totalCost),
      totalCPU: compute(stats.totalCPU, prevStats.totalCPU),
      totalRAM: compute(stats.totalRAM, prevStats.totalRAM),
      totalGPU: compute(stats.totalGPU, prevStats.totalGPU),
      totalAdjustment: compute(Math.abs(stats.totalAdjustment), Math.abs(prevStats.totalAdjustment)),
    };
  }, [stats, prevStats]);

  const typeEntries = useMemo(
    () => Object.entries(stats.types).sort((a, b) => b[1] - a[1]),
    [stats.types],
  );

  const handleSort = (col, dir) => {
    setSortBy(col);
    setSortDirection(dir);
  };

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setDetailOpen(true);
  };

  const handleDownloadCSV = () => downloadCSV(sortedAssets, currency);

  const handleTypeFilterToggle = (type) => {
    setTypeFilter(typeFilter === type ? null : type);
  };

  const typeLabelMap = {
    ClusterManagement: "Cluster Management",
    LoadBalancer: "Load Balancer",
  };

  const typeIconMap = {
    Node: Chip,
    Disk: DataBase,
    LoadBalancer: LoadBalancerNetwork,
    Network: Network_4,
    ClusterManagement: AssemblyCluster,
  };

  const formatTypeLabel = (type) => typeLabelMap[type] || type;

  return (
    <Page active="/assets">
      <Header headerTitle="Assets">
        <Button kind="ghost" size="sm" renderIcon={Renew} onClick={fetchData}>
          Refresh
        </Button>
      </Header>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}

      <Tile style={{ padding: 24, marginBottom: 16, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <div>
            <Heading size="sm" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
              Assets - {windowName}
            </Heading>
            <p style={{ marginTop: 6, color: "#6f6f6f", fontSize: "0.875rem" }}>
              Infrastructure assets and their associated costs from the OpenCost Assets API
            </p>
          </div>
          <AssetControls
            window={win}
            setWindow={setWindow}
            aggregateBy={aggregateBy}
            setAggregateBy={setAggregateBy}
            currency={currency}
            setCurrency={setCurrency}
            onDownloadCSV={handleDownloadCSV}
            onCustomRange={openCustomRange}
            showCharts={showCharts}
            onToggleCharts={() => setShowCharts(!showCharts)}
          />
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <Loading withOverlay={false} />
          </div>
        )}

        {!loading && allAssets.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <SummaryCard
                label="Total Cost"
                value={toCurrency(stats.totalCost, currency)}
                secondary={formatAvgCost(stats.totalCost, allAssets.length, currency)}
                trend={trends.totalCost}
                accent="#1976d2"
                icon={<CurrencyDollar size={16} />}
              />
              <SummaryCard
                label="CPU Cost"
                value={toCurrency(stats.totalCPU, currency)}
                secondary={formatShare(stats.totalCPU, stats.totalCost)}
                trend={trends.totalCPU}
                accent="#2196f3"
                icon={<Chip size={16} />}
              />
              <SummaryCard
                label="RAM Cost"
                value={toCurrency(stats.totalRAM, currency)}
                secondary={formatShare(stats.totalRAM, stats.totalCost)}
                trend={trends.totalRAM}
                accent="#00897b"
                icon={<StoragePool size={16} />}
              />
              <SummaryCard
                label="GPU Cost"
                value={toCurrency(stats.totalGPU, currency)}
                secondary={formatShare(stats.totalGPU, stats.totalCost)}
                trend={trends.totalGPU}
                accent="#f57c00"
                icon={<Chip size={16} />}
              />
              {efficiencyScore !== null && (
                <SummaryCard
                  label="Efficiency Score"
                  value={`${efficiencyScore}/100`}
                  secondary={
                    efficiencyScore >= 70 ? "Healthy utilization" :
                    efficiencyScore >= 40 ? "Moderate - room to optimize" :
                    "Low - significant waste detected"
                  }
                  accent={
                    efficiencyScore >= 70 ? "#4caf50" :
                    efficiencyScore >= 40 ? "#ff9800" :
                    "#f44336"
                  }
                  icon={<ChartLine size={16} />}
                />
              )}
              {monthlyForecast !== null && (
                <SummaryCard
                  label="Monthly Forecast"
                  value={toCurrency(monthlyForecast, currency)}
                  secondary={`Based on ${getWindowDays(win)}d avg rate`}
                  accent="#7b1fa2"
                  icon={<Calendar size={16} />}
                />
              )}
              <SummaryCard
                label="Total Assets"
                value={allAssets.length}
                secondary={`${stats.providers.length} providers, ${stats.clusters.length} clusters`}
                accent="#455a64"
                icon={<Cube size={16} />}
              />
            </div>

            <SavingsOpportunities assets={allAssets} currency={currency} />

            {showCharts && (
              <div style={{ marginBottom: 24 }}>
                <Tabs
                  selectedIndex={activeTab}
                  onChange={({ selectedIndex }) => setActiveTab(selectedIndex)}
                >
                  <TabList aria-label="Asset charts">
                    <Tab>Cost by Type</Tab>
                    <Tab>Top Assets</Tab>
                    <Tab>Node Breakdown</Tab>
                    <Tab>Node Utilization</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
                        <AssetTypePieChart assetsByType={stats.types} currency={currency} />
                        <CostDistributionTreemap assets={allAssets} currency={currency} />
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <TopAssetsCostBarChart assets={allAssets} currency={currency} limit={10} />
                    </TabPanel>
                    <TabPanel>
                      {nodes.length > 0 ? (
                        <NodeCostBreakdownChart nodes={nodes} currency={currency} />
                      ) : (
                        <p style={{ padding: "16px 0", textAlign: "center", color: "#6f6f6f", fontSize: "0.875rem", margin: 0 }}>
                          No Node assets available in the current dataset.
                        </p>
                      )}
                    </TabPanel>
                    <TabPanel>
                      {nodes.length > 0 ? (
                        <NodeUtilizationChart nodes={nodes} />
                      ) : (
                        <p style={{ padding: "16px 0", textAlign: "center", color: "#6f6f6f", fontSize: "0.875rem", margin: 0 }}>
                          No Node assets with utilization data available.
                        </p>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                <Heading size="sm" style={{ marginRight: 8, whiteSpace: "nowrap" }}>
                  {typeFilter ? `${typeFilter} Assets` : "All Assets"}
                </Heading>
                <SelectableTag
                  id="assets-filter-all"
                  selected={!typeFilter}
                  size="lg"
                  text={`All Assets (${allAssets.length})`}
                  renderIcon={Cube}
                  onChange={() => setTypeFilter(null)}
                />
                {typeEntries.map(([type]) => (
                  <SelectableTag
                    key={type}
                    id={`assets-filter-${type}`}
                    selected={typeFilter === type}
                    size="lg"
                    text={`${formatTypeLabel(type)} Assets (${stats.typeCounts[type] || 0})`}
                    renderIcon={typeIconMap[type] || Cube}
                    onChange={(selected) => {
                      if (selected) {
                        setTypeFilter(type);
                      } else if (typeFilter === type) {
                        setTypeFilter(null);
                      }
                    }}
                  />
                ))}
                {typeFilter && (
                  <Button kind="ghost" size="sm" renderIcon={Close} onClick={() => setTypeFilter(null)}>
                    Clear
                  </Button>
                )}
              </div>
              <Search
                id="assets-search"
                size="sm"
                labelText="Search assets"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <AssetTable
              assets={pagedAssets}
              currency={currency}
              onSelectAsset={handleSelectAsset}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            <Pagination
              page={Math.min(page + 1, totalPages || 1)}
              pageSize={rowsPerPage}
              pageSizes={[10, 25, 50, 100]}
              totalItems={filteredAssets.length}
              size="sm"
              onChange={({ page: nextPage, pageSize }) => {
                setPage(Math.max(0, nextPage - 1));
                if (pageSize !== rowsPerPage) {
                  setRowsPerPage(pageSize);
                }
              }}
            />
          </>
        )}

        {!loading && allAssets.length === 0 && errors.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Heading size="sm">No assets found</Heading>
            <p style={{ color: "#6f6f6f", marginTop: 6, fontSize: "0.875rem" }}>
              Try adjusting the time window or check that the OpenCost backend is running.
            </p>
          </div>
        )}
      </Tile>

      <Modal
        open={customRangeOpen}
        modalHeading="Custom range"
        primaryButtonText="Apply"
        secondaryButtonText="Cancel"
        onRequestClose={closeCustomRange}
        onRequestSubmit={applyCustomRange}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
          <DatePicker
            dateFormat="m/d/Y"
            maxDate={new Date()}
            onChange={(dates) => handleCustomStartChange(dates[0])}
          >
            <DatePickerInput
              id="assets-date-start"
              labelText="Start date"
              placeholder="mm/dd/yyyy"
              invalid={Boolean(customStartHelper)}
              invalidText={customStartHelper}
            />
          </DatePicker>
          <DatePicker
            dateFormat="m/d/Y"
            maxDate={new Date()}
            onChange={(dates) => handleCustomEndChange(dates[0])}
          >
            <DatePickerInput
              id="assets-date-end"
              labelText="End date"
              placeholder="mm/dd/yyyy"
              invalid={Boolean(customEndHelper)}
              invalidText={customEndHelper}
            />
          </DatePicker>
        </div>
      </Modal>

      <Footer />

      <AssetDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        asset={selectedAsset}
        currency={currency}
      />
    </Page>
  );
};

const formatShare = (part, total) => {
  if (!total) return "share 0%";
  return `share ${((part / total) * 100).toFixed(1)}%`;
};

const formatAvgCost = (total, count, currency) => {
  if (!count) return "avg 0";
  return `avg ${toCurrency(total / count, currency)}`;
};

export default React.memo(Assets);
