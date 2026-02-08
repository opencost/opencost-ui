import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { get, find } from "lodash";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MemoryIcon from "@mui/icons-material/Memory";
import StorageIcon from "@mui/icons-material/Storage";
import CloudIcon from "@mui/icons-material/Cloud";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SpeedIcon from "@mui/icons-material/Speed";
import WidgetsIcon from "@mui/icons-material/Widgets";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Button from "@mui/material/Button";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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

const typeIconMap = {
  Node: <MemoryIcon fontSize="small" />,
  Disk: <StorageIcon fontSize="small" />,
  LoadBalancer: <CloudIcon fontSize="small" />,
  Network: <SettingsEthernetIcon fontSize="small" />,
  ClusterManagement: <SettingsIcon fontSize="small" />,
};

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

  const dataArray = response.data;
  const assets = [];

  dataArray.forEach((assetMap) => {
    if (typeof assetMap !== "object") return;
    Object.entries(assetMap).forEach(([key, asset]) => {
      assets.push({ ...asset, key });
    });
  });

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

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  return (
    <Page active="/assets">
      <Header headerTitle="Assets">
        <IconButton aria-label="refresh" onClick={fetchData} style={{ padding: 12 }}>
          <RefreshIcon />
        </IconButton>
      </Header>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}

      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <div>
            <Typography variant="h5">
              Assets &mdash; {windowName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Infrastructure assets and their associated costs from the OpenCost Assets API
            </Typography>
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
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && allAssets.length > 0 && (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
              <SummaryCard 
                label="Total Cost" 
                value={toCurrency(stats.totalCost, currency)}
                secondary={formatAvgCost(stats.totalCost, allAssets.length, currency)}
                trend={trends.totalCost}
                accent="#1976d2"
                icon={<AttachMoneyIcon sx={{ fontSize: 16 }} />}
              />
              <SummaryCard 
                label="CPU Cost" 
                value={toCurrency(stats.totalCPU, currency)}
                secondary={formatShare(stats.totalCPU, stats.totalCost)}
                trend={trends.totalCPU}
                accent="#2196f3"
                icon={<MemoryIcon sx={{ fontSize: 16 }} />}
              />
              <SummaryCard 
                label="RAM Cost" 
                value={toCurrency(stats.totalRAM, currency)}
                secondary={formatShare(stats.totalRAM, stats.totalCost)}
                trend={trends.totalRAM}
                accent="#00897b"
                icon={<StorageIcon sx={{ fontSize: 16 }} />}
              />
              <SummaryCard 
                label="GPU Cost" 
                value={toCurrency(stats.totalGPU, currency)}
                secondary={formatShare(stats.totalGPU, stats.totalCost)}
                trend={trends.totalGPU}
                accent="#f57c00"
                icon={<SpeedIcon sx={{ fontSize: 16 }} />}
              />
              {efficiencyScore !== null && (
                <SummaryCard
                  label="Efficiency Score"
                  value={`${efficiencyScore}/100`}
                  secondary={
                    efficiencyScore >= 70 ? "Healthy utilization" :
                    efficiencyScore >= 40 ? "Moderate — room to optimize" :
                    "Low — significant waste detected"
                  }
                  accent={
                    efficiencyScore >= 70 ? "#4caf50" :
                    efficiencyScore >= 40 ? "#ff9800" :
                    "#f44336"
                  }
                  icon={<SpeedIcon sx={{ fontSize: 16 }} />}
                />
              )}
              {monthlyForecast !== null && (
                <SummaryCard
                  label="Monthly Forecast"
                  value={toCurrency(monthlyForecast, currency)}
                  secondary={`Based on ${getWindowDays(win)}d avg rate`}
                  accent="#7b1fa2"
                  icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                />
              )}
              <SummaryCard 
                label="Total Assets" 
                value={allAssets.length}
                secondary={`${stats.providers.length} providers, ${stats.clusters.length} clusters`}
                accent="#455a64"
                icon={<WidgetsIcon sx={{ fontSize: 16 }} />}
              />
            </Box>

            <SavingsOpportunities assets={allAssets} currency={currency} />

            {showCharts && (
              <>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                  <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
                    <Tab label="Cost by Type" />
                    <Tab label="Top Assets" />
                    <Tab label="Node Breakdown" />
                    <Tab label="Node Utilization" />
                  </Tabs>
                </Box>

                <Box sx={{ mb: 3 }}>
                  {activeTab === 0 && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 2 }}>
                      <AssetTypePieChart assetsByType={stats.types} currency={currency} />
                      <CostDistributionTreemap assets={allAssets} currency={currency} />
                    </Box>
                  )}
                  {activeTab === 1 && (
                    <TopAssetsCostBarChart assets={allAssets} currency={currency} limit={10} />
                  )}
                  {activeTab === 2 && (
                    nodes.length > 0 ? (
                      <NodeCostBreakdownChart nodes={nodes} currency={currency} />
                    ) : (
                      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                        No Node assets available in the current dataset.
                      </Typography>
                    )
                  )}
                  {activeTab === 3 && (
                    nodes.length > 0 ? (
                      <NodeUtilizationChart nodes={nodes} />
                    ) : (
                      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                        No Node assets with utilization data available.
                      </Typography>
                    )
                  )}
                </Box>
              </>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ mr: 1, whiteSpace: "nowrap" }}>
                  {typeFilter ? `${typeFilter} Assets` : "All Assets"}
                </Typography>
                <Chip
                  label={`All (${allAssets.length})`}
                  onClick={() => setTypeFilter(null)}
                  variant={!typeFilter ? "filled" : "outlined"}
                  color={!typeFilter ? "primary" : "default"}
                  size="small"
                />
                {typeEntries.map(([type]) => (
                  <Chip
                    key={type}
                    icon={typeIconMap[type] || null}
                    label={`${type}: ${stats.typeCounts[type] || 0}`}
                    onClick={() => handleTypeFilterToggle(type)}
                    variant={typeFilter === type ? "filled" : "outlined"}
                    color={typeFilter === type ? "primary" : "default"}
                    size="small"
                  />
                ))}
                {typeFilter && (
                  <Chip label="Clear" size="small" onDelete={() => setTypeFilter(null)} color="error" variant="outlined" />
                )}
              </Box>
              <TextField
                size="small"
                placeholder="Search assets…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200, maxWidth: 260 }}
              />
            </Box>

            <AssetTable
              assets={pagedAssets}
              currency={currency}
              onSelectAsset={handleSelectAsset}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            <TablePagination
              component="div"
              count={filteredAssets.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              page={Math.min(page, totalPages - 1 || 0)}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        {!loading && allAssets.length === 0 && errors.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <StorageIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No assets found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting the time window or check that the OpenCost backend is running.
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog open={customRangeOpen} onClose={closeCustomRange} maxWidth="xs" fullWidth>
        <DialogTitle>Custom range</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
            <DatePicker
              style={{ width: 160 }}
              autoOk={true}
              disableToolbar
              format="MM/dd/yyyy"
              margin="normal"
              id="assets-date-start"
              label="Start date"
              value={customStartDate}
              maxDate={new Date()}
              maxDateMessage="Date should not be after today."
              onChange={handleCustomStartChange}
              onError={(error) => {
                if (error === "maxDate") {
                  setCustomStartHelper("Date should not be after today.");
                }
              }}
              slotProps={{
                field: {
                  helperText: customStartHelper,
                  variant: "outlined",
                  size: "small",
                },
              }}
            />
            <DatePicker
              style={{ width: 160 }}
              autoOk={true}
              disableToolbar
              format="MM/dd/yyyy"
              margin="normal"
              id="assets-date-end"
              label="End date"
              value={customEndDate}
              maxDate={new Date()}
              maxDateMessage="Date should not be after today."
              onChange={handleCustomEndChange}
              onError={(error) => {
                if (error === "maxDate") {
                  setCustomEndHelper("Date should not be after today.");
                }
              }}
              slotProps={{
                field: {
                  helperText: customEndHelper,
                  variant: "outlined",
                  size: "small",
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCustomRange}>Cancel</Button>
          <Button variant="contained" onClick={applyCustomRange}>Apply</Button>
        </DialogActions>
      </Dialog>

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
