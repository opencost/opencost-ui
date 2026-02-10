import * as React from "react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Button,
  Loading,
  InlineNotification,
  FluidDatePicker,
  DatePickerInput,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tile,
  SelectItem,
  FluidSelect,
} from "@carbon/react";
import {
  Renew,
  Dashboard,
  VirtualMachine,
  StoragePool,
  Network_4,
  Settings,
  Money,
  CaretUp,
  CaretDown,
  ChartArea,
  TrophyFilled,
} from "@carbon/icons-react";
import { useLocation, useNavigate } from "react-router";
import AssetsService from "../services/assets";
import { toCurrency, formatDuration, bytesToString } from "../util";
import AssetTable from "../components/Assets/AssetTable";
import AssetChartsRow from "../components/Assets/AssetChartsRow";
import AssetDetailsModal from "../components/Assets/AssetDetailsModal";
import { currencyCodes } from "../constants/currencyCodes";
import { windowOptions } from "../constants/windowsOptions";

const AssetsPage = () => {
  const [assetsData, setAssetsData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);
  const [dateRange, setDateRange] = React.useState([null, null]);
  const [selectedAsset, setSelectedAsset] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [lastTotalCost, setLastTotalCost] = React.useState(null);
  const [previousTotalCost, setPreviousTotalCost] = React.useState(null);

  const routerLocation = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(routerLocation.search);

  const winParam = searchParams.get("window") || "7d";
  const currencyParam = searchParams.get("currency") || "USD";

  const formatCurrency = (value) => toCurrency(value, currencyParam, 2);

  React.useEffect(() => {
    fetchData();
  }, [winParam]);

  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      const resp = await AssetsService.fetchAssets(winParam);
      if (resp && resp.data) {
        // Compute total cost for this window for prediction/trend
        let newTotal = 0;
        Object.values(resp.data).forEach((asset) => {
          newTotal += asset.totalCost || 0;
        });
        setPreviousTotalCost(lastTotalCost);
        setLastTotalCost(newTotal);
        setAssetsData(resp.data);
      } else {
        setPreviousTotalCost(lastTotalCost);
        setLastTotalCost(0);
        setAssetsData({});
      }
    } catch (err) {
      setErrors([
        {
          primary: "Failed to load assets data",
          secondary: err.message || "Please try again later.",
        },
      ]);
    }

    setLoading(false);
  }

  const handleDateChange = (dates) => {
    setDateRange(dates);
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      // RFC3339 without fractional seconds
      // Regex replaces .000Z (or any millisecond precision) with Z
      const start = dates[0].toISOString().replace(/\.\d{3}Z$/, "Z");
      const end = dates[1].toISOString().replace(/\.\d{3}Z$/, "Z");
      searchParams.set("window", `${start},${end}`);
      navigate(`?${searchParams.toString()}`);
    }
  };

  const handleRowClick = (rowId) => {
    const asset = assetsData[rowId];
    if (asset) {
      setSelectedAsset(asset);
      setIsModalOpen(true);
    }
  };

  const processData = React.useMemo(() => {
    const all = [];
    const compute = [];
    const storage = [];
    const network = [];
    const management = [];
    let totalCost = 0;

    Object.entries(assetsData).forEach(([id, asset]) => {
      const category = asset.properties?.category || "Unknown";
      const cost = asset.totalCost || 0;
      totalCost += cost;

      const common = {
        id,
        category,
        type: asset.type,
        duration: asset.minutes || 0,
        cost: cost,
        raw: asset,
        cluster: asset.properties?.cluster,
      };

      all.push(common);

      if (category === "Compute") {
        compute.push({
          ...common,
          name: asset.properties?.name || asset.name,
          cpu: asset.cpuCores,
          ram: asset.ramBytes,
          specs: `${asset.cpuCores} Cores / ${bytesToString(asset.ramBytes)}`,
          cpuCost: asset.cpuCost || 0,
          ramCost: asset.ramCost || 0,
          gpuCount: asset.gpuCount || 0,
          gpuCost: asset.gpuCost || 0,
          preemptible: asset.preemptible ? "Yes" : "No",
        });
      } else if (category === "Storage") {
        storage.push({
          ...common,
          volumeName: asset.volumeName || asset.properties?.name,
          claim: asset.claimName,
          storageClass: asset.storageClass,
          size: asset.bytes,
          namespace: asset.claimNamespace,
        });
      } else if (category === "Network") {
        network.push({
          ...common,
          name: asset.properties?.name,
          ip: asset.ip,
        });
      } else if (category === "Management") {
        management.push({
          ...common,
          service: asset.properties?.service,
          cluster: asset.properties?.cluster,
        });
      }
    });

    return {
      all,
      compute,
      storage,
      network,
      management,
      totalCost,
      categoryTotals: {
        Total: totalCost,
        Compute: compute.reduce((acc, item) => acc + item.cost, 0),
        Storage: storage.reduce((acc, item) => acc + item.cost, 0),
        Network: network.reduce((acc, item) => acc + item.cost, 0),
        Management: management.reduce((acc, item) => acc + item.cost, 0),
      },
    };
  }, [assetsData]);

  // Most expensive single asset across all categories
  const mostExpensiveAsset = React.useMemo(() => {
    if (!processData.all || processData.all.length === 0) {
      return null;
    }
    return processData.all.reduce((max, current) =>
      !max || current.cost > max.cost ? current : max
    , null);
  }, [processData.all]);

  // Monthly bill prediction based on last 7 days cost
  const sevenDayTotal =
    lastTotalCost != null ? lastTotalCost : processData.totalCost || 0;
  const monthlyPrediction = sevenDayTotal * (30 / 7);
  const trendPercentage =
    previousTotalCost != null && previousTotalCost > 0
      ? ((sevenDayTotal - previousTotalCost) / previousTotalCost) * 100
      : null;
  const isTrendUp = trendPercentage != null && trendPercentage >= 0;

  return (
    <Page active="/assets">
      <Header headerTitle="Asset Costs">
        <Button
          kind="ghost"
          renderIcon={Renew}
          iconDescription="Refresh"
          onClick={() => fetchData()}
        >
          Refresh
        </Button>
      </Header>

      {/* error notifications */}
      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20, padding: "0 24px" }}>
          {errors.map((error, index) => (
            <InlineNotification
              key={index}
              kind="error"
              title={error.primary}
              subtitle={error.secondary}
              lowContrast
            />
          ))}
        </div>
      )}

      {/* Tiles */}
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {[
            { name: "Total", icon: Money },
            { name: "Compute", icon: VirtualMachine },
            { name: "Storage", icon: StoragePool },
            { name: "Network", icon: Network_4 },
          ].map((cat) => (
            <Tile key={cat.name} style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <cat.icon size={20} />
                <h4 style={{ margin: 0 }}>{cat.name} Cost</h4>
              </div>
              <h2 style={{ margin: 0 }}>
                {formatCurrency(processData.categoryTotals[cat.name])}
              </h2>
            </Tile>
          ))}

          {/* 5th card: Most Expensive Asset (replaces Management Cost) */}
          <Tile style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <TrophyFilled size={20} />
              <h4 style={{ margin: 0 }}>Most Expensive Asset</h4>
            </div>
            {mostExpensiveAsset ? (
              <>
                <h2 style={{ margin: 0 }}>
                  {formatCurrency(mostExpensiveAsset.cost)}{" "}
                  {mostExpensiveAsset.cluster &&
                    `· ${mostExpensiveAsset.cluster}`}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: 12,
                    color: "#6f6f6f",
                  }}
                >
                  {mostExpensiveAsset.type || mostExpensiveAsset.category}
                </p>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: 12,
                    color: "#0f62fe",
                    fontWeight: 600,
                  }}
                >
                  Top cost driver
                </p>
              </>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#6f6f6f",
                }}
              >
                No asset data available
              </p>
            )}
          </Tile>

          {/* 6th card: Monthly Bill Prediction */}
          <Tile style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <ChartArea size={20} />
              <h4 style={{ margin: 0 }}>Monthly Bill Prediction</h4>
            </div>
            <h2
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#0f62fe",
              }}
            >
              {formatCurrency(monthlyPrediction)}
              {trendPercentage != null && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: isTrendUp ? "#24a148" : "#da1e28",
                  }}
                >
                  {isTrendUp ? (
                    <CaretUp size={16} />
                  ) : (
                    <CaretDown size={16} />
                  )}
                  {`${Math.abs(trendPercentage).toFixed(1)}%`}
                </span>
              )}
            </h2>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: 12,
                color: "#6f6f6f",
              }}
            >
              Based on 7-day trend
            </p>
          </Tile>
        </div>

        {/* Charts row: 4 charts in one row (25% width each) */}
        <AssetChartsRow
          assetsData={assetsData}
          currency={currencyParam}
          loading={loading}
        />

        {/* Tabs and Tables */}
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 100 }}
          >
            <Loading description="Loading assets data" withOverlay={false} />
          </div>
        ) : (
          <Tabs>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <TabList contained aria-label="Asset categories">
                <Tab renderIcon={Dashboard}>All</Tab>
                <Tab renderIcon={VirtualMachine}>Compute</Tab>
                <Tab renderIcon={StoragePool}>Storage</Tab>
                <Tab renderIcon={Network_4}>Network</Tab>
                <Tab renderIcon={Settings}>Management</Tab>
              </TabList>
              <div style={{ display: "flex", gap: 16, marginBottom: 0 }}>
                <div style={{ width: 150 }}>
                  <FluidSelect
                    id="currency-select"
                    labelText="Currency"
                    value={currencyParam}
                    onChange={(e) => {
                      searchParams.set("currency", e.target.value);
                      navigate(`?${searchParams.toString()}`);
                    }}
                  >
                    {currencyCodes.map((code) => (
                      <SelectItem key={code} value={code} text={code} />
                    ))}
                  </FluidSelect>
                </div>
                <div style={{ width: 200 }}>
                  <FluidSelect
                    id="window-select"
                    labelText="Window"
                    value={
                      windowOptions.some((o) => o.value === winParam)
                        ? winParam
                        : ""
                    }
                    onChange={(e) => {
                      setDateRange([null, null]);
                      searchParams.set("window", e.target.value);
                      navigate(`?${searchParams.toString()}`);
                    }}
                  >
                    <SelectItem value="" text="Custom Range" />
                    {windowOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        text={opt.name}
                      />
                    ))}
                  </FluidSelect>
                </div>
                <div style={{ width: 300 }}>
                  <FluidDatePicker
                    datePickerType="range"
                    value={dateRange}
                    onChange={handleDateChange}
                  >
                    <DatePickerInput
                      id="date-picker-input-id-start"
                      placeholder="mm/dd/yyyy"
                      labelText="Start date"
                    />
                    <DatePickerInput
                      id="date-picker-input-id-end"
                      placeholder="mm/dd/yyyy"
                      labelText="End date"
                    />
                  </FluidDatePicker>
                </div>
              </div>
            </div>
            <TabPanels>
              <TabPanel>
                {/* All Assets Table */}
                <AssetTable
                  headers={[
                    { key: "category", header: "Category" },
                    { key: "type", header: "Type" },
                    { key: "cluster", header: "Cluster" },
                    { key: "duration", header: "Duration" },
                    { key: "cost", header: "Cost" },
                  ]}
                  rows={processData.all}
                  formatters={{
                    duration: formatDuration,
                    cost: formatCurrency,
                  }}
                  onRowClick={handleRowClick}
                />
              </TabPanel>

              {/* Compute Assets Table */}
              <TabPanel>
                <AssetTable
                  headers={[
                    { key: "name", header: "Node Name" },
                    { key: "type", header: "Type" },
                    { key: "cluster", header: "Cluster" },
                    { key: "specs", header: "CPU / RAM" },
                    { key: "gpuCount", header: "GPU Count" },
                    { key: "preemptible", header: "Preemptible" },
                    { key: "duration", header: "Duration" },
                    { key: "cpuCost", header: "CPU Cost" },
                    { key: "ramCost", header: "RAM Cost" },
                    { key: "gpuCost", header: "GPU Cost" },
                    { key: "totalCost", header: "Total Cost" },
                  ]}
                  rows={processData.compute.map((r) => ({
                    id: r.id,
                    name: r.name,
                    type: r.type,
                    cluster: r.cluster,
                    specs: r.specs,
                    gpuCount: r.gpuCount,
                    preemptible: r.preemptible,
                    duration: r.duration,
                    cpuCost: r.cpuCost,
                    ramCost: r.ramCost,
                    gpuCost: r.gpuCost,
                    totalCost: r.cost,
                  }))}
                  formatters={{
                    duration: formatDuration,
                    cpuCost: formatCurrency,
                    ramCost: formatCurrency,
                    gpuCost: formatCurrency,
                    totalCost: formatCurrency,
                  }}
                  onRowClick={handleRowClick}
                />
              </TabPanel>

              {/* Storage Assets Table */}
              <TabPanel>
                <AssetTable
                  headers={[
                    { key: "volumeName", header: "Volume Name" },
                    { key: "claim", header: "Claim" },
                    { key: "namespace", header: "Namespace" },
                    { key: "cluster", header: "Cluster" },
                    { key: "storageClass", header: "Storage Class" },
                    { key: "size", header: "Size" },
                    { key: "duration", header: "Duration" },
                    { key: "cost", header: "Cost" },
                  ]}
                  rows={processData.storage.map((r) => ({
                    id: r.id,
                    volumeName: r.volumeName,
                    claim: r.claim,
                    namespace: r.namespace,
                    cluster: r.cluster,
                    storageClass: r.storageClass,
                    size: r.size,
                    duration: r.duration,
                    cost: r.cost,
                  }))}
                  formatters={{
                    size: bytesToString,
                    duration: formatDuration,
                    cost: formatCurrency,
                  }}
                  onRowClick={handleRowClick}
                />
              </TabPanel>

              {/* Network Assets Table */}
              <TabPanel>
                <AssetTable
                  headers={[
                    { key: "name", header: "Name" },
                    { key: "cluster", header: "Cluster" },
                    { key: "ip", header: "IP Address" },
                    { key: "duration", header: "Duration" },
                    { key: "cost", header: "Cost" },
                  ]}
                  rows={processData.network.map((r) => ({
                    id: r.id,
                    name: r.name,
                    cluster: r.cluster,
                    ip: r.ip,
                    duration: r.duration,
                    cost: r.cost,
                  }))}
                  formatters={{
                    duration: formatDuration,
                    cost: formatCurrency,
                  }}
                  onRowClick={handleRowClick}
                />
              </TabPanel>

              {/* Management Assets Table */}
              <TabPanel>
                <AssetTable
                  headers={[
                    { key: "service", header: "Service" },
                    { key: "cluster", header: "Cluster" },
                    { key: "duration", header: "Duration" },
                    { key: "cost", header: "Cost" },
                  ]}
                  rows={processData.management.map((r) => ({
                    id: r.id,
                    service: r.service,
                    cluster: r.cluster,
                    duration: r.duration,
                    cost: r.cost,
                  }))}
                  formatters={{
                    duration: formatDuration,
                    cost: formatCurrency,
                  }}
                  onRowClick={handleRowClick}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </div>

      <Footer />

      <AssetDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        asset={selectedAsset}
      />
    </Page>
  );
};

export default React.memo(AssetsPage);
