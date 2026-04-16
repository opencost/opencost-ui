import { useState, useEffect, useMemo } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tag,
  Button,
  Loading,
} from "@carbon/react";
import { PieChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import { SwitchableChart } from "./switchable-chart";
import { ChartTypeToggle, type ChartMode } from "./chart-type-toggle";
import { Download } from "@carbon/icons-react";
import "@carbon/charts-react/styles.css";
import { type Asset } from "~/lib/assets-api";
import AssetsService from "~/services/assets";
import {
  AssetsFilterControls,
  DEFAULT_ASSETS_FILTERS,
  FilterableWidgetHeader,
  type AssetsFilterValues,
} from "./scoped-views";

const utilPctFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

function formatUtilPct(v: number | null): string {
  return v === null ? "N/A" : `${utilPctFormatter.format(v)}%`;
}

function formatRamGb(ramBytes: number): string {
  if (!ramBytes) return "0 GB";
  const gb = ramBytes / 1024 ** 3;
  return `${gb >= 10 ? Math.round(gb) : Math.round(gb * 10) / 10} GB`;
}

export default function AssetsVisualization() {
  const [showFilters, setShowFilters] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("bar");
  const [filterValues, setFilterValues] = useState<AssetsFilterValues>({
    window: DEFAULT_ASSETS_FILTERS.assetsWindow,
    aggregateBy: DEFAULT_ASSETS_FILTERS.assetsAggregateBy,
    accumulate: DEFAULT_ASSETS_FILTERS.assetsAccumulate,
    includeIdle: DEFAULT_ASSETS_FILTERS.assetsIncludeIdle,
  });

  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(
    null,
  );
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetched = await AssetsService.fetchAssets(
          filterValues.window,
          filterValues.aggregateBy,
          {
            accumulate: filterValues.accumulate,
            includeIdle: filterValues.includeIdle,
          },
        );
        if (!cancelled) {
          setAssets(fetched);
          if (fetched.length === 0) {
            setError(
              "No assets returned for this window — check OpenCost API connection and filters.",
            );
          }
        }
      } catch {
        if (!cancelled) {
          setAssets([]);
          setError("Could not load assets — check OpenCost API connection.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [
    filterValues.window,
    filterValues.aggregateBy,
    filterValues.accumulate,
    filterValues.includeIdle,
  ]);

  useEffect(() => {
    setSelectedAssetType(null);
  }, [filterValues.aggregateBy]);

  const filteredAssets = selectedAssetType
    ? assets.filter((a) => a.type === selectedAssetType)
    : assets;

  const assetsByType = useMemo(
    () =>
      assets.reduce<
        Record<
          string,
          {
            type: string;
            count: number;
            totalCost: number;
            totalCarbon: number;
          }
        >
      >((acc, asset) => {
        if (!acc[asset.type]) {
          acc[asset.type] = {
            type: asset.type,
            count: 0,
            totalCost: 0,
            totalCarbon: 0,
          };
        }
        acc[asset.type].count += 1;
        acc[asset.type].totalCost += asset.totalCost;
        acc[asset.type].totalCarbon += asset.carbonEmissions;
        return acc;
      }, {}),
    [assets],
  );

  const typeData = Object.values(assetsByType);
  const totalCost = filteredAssets.reduce((sum, a) => sum + a.totalCost, 0);
  const totalCarbon = filteredAssets.reduce(
    (sum, a) => sum + a.carbonEmissions,
    0,
  );
  const avgUtilization = useMemo(() => {
    let sum = 0;
    let n = 0;
    for (const a of filteredAssets) {
      if (a.cpuUtilization != null) {
        sum += a.cpuUtilization;
        n++;
      }
      if (a.ramUtilization != null) {
        sum += a.ramUtilization;
        n++;
      }
    }
    if (n === 0) return null;
    return Math.round((sum / n) * 100) / 100;
  }, [filteredAssets]);

  const sortedAssets = useMemo(
    () => [...filteredAssets].sort((a, b) => b.totalCost - a.totalCost),
    [filteredAssets],
  );

  const pieChartData = typeData.map((item) => ({
    group: item.type,
    value: item.totalCost,
  }));
  const barChartData = sortedAssets
    .slice(0, 5)
    .map((asset) => ({ group: asset.name, key: "Cost", value: asset.totalCost }));

  const pieOptions = {
    title: "Cost by Asset Type",
    resizable: true,
    height: "300px",
    pie: { alignment: "center" as const },
    legend: { alignment: "center" as const },
  };

  const barOptions = {
    title: "Top 5 Assets by Cost",
    axes: {
      left: { mapsTo: "value", scaleType: ScaleTypes.LINEAR },
      bottom: { mapsTo: "group", scaleType: ScaleTypes.LABELS },
    },
    height: "300px",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loading description="Loading assets..." withOverlay={false} />
      </div>
    );
  }

  const AssetRow = ({ asset }: { asset: Asset }) => (
    <div className="p-3 rounded border border-[#e0e0e0] mb-2 hover:bg-[#f4f4f4] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-medium text-sm truncate" title={asset.name}>
              {asset.name}
            </h4>
            <Tag type="blue" size="sm">
              {asset.type}
            </Tag>
            {asset.preemptible && (
              <Tag type="outline" size="sm">
                Preemptible
              </Tag>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8d8d8d]">
            {asset.ip && <span title="Internal / node IP">{asset.ip}</span>}
            <span>{asset.cluster}</span>
            <span>{asset.region}</span>
            {(asset.cpuCores > 0 || asset.ramBytes > 0) && (
              <span>
                {asset.cpuCores > 0 ? `${asset.cpuCores} vCPU` : ""}
                {asset.cpuCores > 0 && asset.ramBytes > 0 ? " · " : ""}
                {asset.ramBytes > 0 ? formatRamGb(asset.ramBytes) : ""}
              </span>
            )}
            {asset.nodeType && (
              <span className="truncate max-w-[200px]" title={asset.nodeType}>
                {asset.nodeType}
              </span>
            )}
            <span>CPU: {formatUtilPct(asset.cpuUtilization)}</span>
            <span>RAM: {formatUtilPct(asset.ramUtilization)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-sm">
            ${asset.totalCost.toFixed(2)}
          </div>
          <div className="text-xs text-[#8d8d8d]">
            {asset.carbonEmissions.toFixed(2)} kg CO₂e
          </div>
        </div>
      </div>
    </div>
  );

  const handleExport = () => {
    const csv = [
      [
        "Name",
        "IP",
        "Node type",
        "Type",
        "Provider",
        "Cluster",
        "Region",
        "Category",
        "CPU %",
        "RAM %",
        "CPU Cost",
        "RAM Cost",
        "Total Cost",
        "Carbon (kg CO2e)",
      ].join(","),
      ...sortedAssets.map((a) =>
        [
          a.name,
          a.ip ?? "",
          a.nodeType ?? "",
          a.type,
          a.provider,
          a.cluster,
          a.region,
          a.category,
          a.cpuUtilization === null ? "" : String(a.cpuUtilization),
          a.ramUtilization === null ? "" : String(a.ramUtilization),
          a.cpuCost.toFixed(4),
          a.ramCost.toFixed(4),
          a.totalCost.toFixed(4),
          a.carbonEmissions.toFixed(4),
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets-${filterValues.window}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section-card w-full">
      <FilterableWidgetHeader
        title="Infrastructure Assets"
        description="Infrastructure assets with cost and carbon tracking"
        expanded={showFilters}
        onToggle={() => setShowFilters((s) => !s)}
        headerActions={
          <ChartTypeToggle mode={chartMode} onChange={setChartMode} />
        }
        filterContent={
          <AssetsFilterControls
            window={filterValues.window}
            aggregateBy={filterValues.aggregateBy}
            accumulate={filterValues.accumulate}
            includeIdle={filterValues.includeIdle}
            onWindowChange={(v) =>
              setFilterValues((p) => ({ ...p, window: v }))
            }
            onAggregateByChange={(v) =>
              setFilterValues((p) => ({ ...p, aggregateBy: v }))
            }
            onAccumulateChange={(v) =>
              setFilterValues((p) => ({ ...p, accumulate: v }))
            }
            onIncludeIdleChange={(v) =>
              setFilterValues((p) => ({ ...p, includeIdle: v }))
            }
            idPrefix="assets-widget"
          />
        }
      />

      {error && (
        <div className="p-3 bg-[#f1c21b] text-black rounded mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="metric-card">
          <div className="metric-label">Total Assets</div>
          <div className="metric-value">{assets.length}</div>
          <p className="metric-change text-[#525252]">
            {typeData.length} types
          </p>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Cost</div>
          <div className="metric-value">${totalCost.toFixed(2)}</div>
          <p className="metric-change text-[#525252]">This period</p>
        </div>
        <div className="metric-card">
          <div className="metric-label">Carbon Emissions</div>
          <div className="metric-value">{totalCarbon.toFixed(2)} kg CO₂e</div>
          <p className="metric-change text-[#525252]">Environmental impact</p>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Utilization</div>
          <div className="metric-value">
            {avgUtilization === null ? "—" : `${avgUtilization}%`}
          </div>
          <p className="metric-change text-[#525252]">
            CPU + Memory (where reported)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#f4f4f4] p-4 rounded">
          <PieChart data={pieChartData} options={pieOptions} />
        </div>
        <div className="bg-[#f4f4f4] p-4 rounded">
          <SwitchableChart
            data={barChartData}
            options={barOptions}
            mode={chartMode}
            stacked={false}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e0e0e0]">
          <div>
            <h4 className="text-base font-semibold text-[#161616]">
              All Assets
            </h4>
            <p className="text-sm text-[#525252]">
              View and manage infrastructure resources
            </p>
          </div>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Download}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>

        <Tabs>
          <TabList aria-label="Asset type tabs">
            <Tab onClick={() => setSelectedAssetType(null)}>
              All ({assets.length})
            </Tab>
            {typeData.map((type) => (
              <Tab
                key={type.type}
                onClick={() => setSelectedAssetType(type.type)}
              >
                {type.type} ({type.count})
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="mt-4 max-h-[400px] overflow-y-auto">
                {sortedAssets.map((asset) => (
                  <AssetRow key={asset.id} asset={asset} />
                ))}
              </div>
            </TabPanel>
            {typeData.map((type) => (
              <TabPanel key={type.type}>
                <div className="mt-4 max-h-[400px] overflow-y-auto">
                  {sortedAssets
                    .filter((a) => a.type === type.type)
                    .map((asset) => (
                      <AssetRow key={asset.id} asset={asset} />
                    ))}
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
