import { useState, useEffect } from "react";
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
import { PieChart, SimpleBarChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import { Filter, Download } from "@carbon/icons-react";
import "@carbon/charts-react/styles.css";
import { fetchAssets, type Asset } from "~/lib/assets-api";

function getDemoAssets(): Asset[] {
  return [
    {
      id: "node-oracle-1",
      name: "10.0.147.137",
      type: "Node",
      provider: "Oracle",
      cluster: "default-cluster",
      region: "iad",
      category: "Compute",
      cpuCores: 4,
      ramBytes: 33347035136,
      cpuCoreHours: 66,
      cpuCost: 1.782,
      ramCost: 0.768657,
      totalCost: 2.550657,
      cpuUtilization: 0,
      ramUtilization: 0,
      carbonEmissions: 1.275,
      preemptible: true,
      lastModified: "2026-01-10",
    },
    {
      id: "node-oracle-2",
      name: "10.0.153.45",
      type: "Node",
      provider: "Oracle",
      cluster: "default-cluster",
      region: "iad",
      category: "Compute",
      cpuCores: 4,
      ramBytes: 33347035136,
      cpuCoreHours: 73.2,
      cpuCost: 1.9764,
      ramCost: 0.85251,
      totalCost: 2.82891,
      cpuUtilization: 0,
      ramUtilization: 0,
      carbonEmissions: 1.414,
      preemptible: true,
      lastModified: "2026-01-13",
    },
    {
      id: "pod-1",
      name: "web-pod-1",
      type: "Pod",
      provider: "Oracle",
      cluster: "default-cluster",
      region: "iad",
      category: "Compute",
      cpuCores: 2,
      ramBytes: 8589934592,
      cpuCoreHours: 48,
      cpuCost: 1.296,
      ramCost: 0.384,
      totalCost: 1.68,
      cpuUtilization: 45,
      ramUtilization: 62,
      carbonEmissions: 0.84,
      preemptible: false,
      lastModified: "2026-01-15",
    },
  ];
}

export default function AssetsVisualization() {
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      try {
        const fetchedAssets = await fetchAssets(
          "https://demo.infra.opencost.io/model/assets?window=7d&aggregate=namespace&includeIdle=true&step=1d&accumulate=false"
        );
        if (fetchedAssets.length > 0) {
          setAssets(fetchedAssets);
          setError(null);
        } else {
          setAssets(getDemoAssets());
          setError("Using demo data — connect to OpenCost API for real data");
        }
      } catch {
        setAssets(getDemoAssets());
        setError("Using demo data — connect to OpenCost API");
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, []);

  const filteredAssets = selectedAssetType
    ? assets.filter((a) => a.type === selectedAssetType)
    : assets;

  const assetsByType = assets.reduce<
    Record<string, { type: string; count: number; totalCost: number; totalCarbon: number }>
  >((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = { type: asset.type, count: 0, totalCost: 0, totalCarbon: 0 };
    }
    acc[asset.type].count += 1;
    acc[asset.type].totalCost += asset.totalCost;
    acc[asset.type].totalCarbon += asset.carbonEmissions;
    return acc;
  }, {});

  const typeData = Object.values(assetsByType);
  const totalCost = filteredAssets.reduce((sum, a) => sum + a.totalCost, 0);
  const totalCarbon = filteredAssets.reduce((sum, a) => sum + a.carbonEmissions, 0);
  const avgUtilization =
    filteredAssets.length > 0
      ? Math.round(
          (filteredAssets.reduce(
            (sum, a) => sum + a.cpuUtilization + a.ramUtilization,
            0
          ) /
            (filteredAssets.length * 2)) *
            100
        ) / 100
      : 0;

  const sortedAssets = [...filteredAssets].sort((a, b) => b.totalCost - a.totalCost);

  const pieChartData = typeData.map((item) => ({ group: item.type, value: item.totalCost }));
  const barChartData = sortedAssets
    .slice(0, 5)
    .map((asset) => ({ group: asset.name, value: asset.totalCost }));

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
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{asset.name}</h4>
            <Tag type="blue" size="sm">{asset.type}</Tag>
            {asset.preemptible && <Tag type="outline" size="sm">Preemptible</Tag>}
          </div>
          <div className="flex gap-4 text-xs text-[#8d8d8d]">
            <span>{asset.cluster}</span>
            <span>{asset.region}</span>
            <span>CPU: {asset.cpuUtilization}%</span>
            <span>RAM: {asset.ramUtilization}%</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-sm">${asset.totalCost.toFixed(2)}</div>
          <div className="text-xs text-[#8d8d8d]">{asset.carbonEmissions.toFixed(2)} kg CO₂e</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="section-card w-full">
      <div className="mb-6">
        <h3 className="section-title">Infrastructure Assets</h3>
        <p className="section-description">Infrastructure assets with cost and carbon tracking</p>
      </div>

      {error && (
        <div className="p-3 bg-[#f1c21b] text-black rounded mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="metric-card">
          <div className="metric-label">Total Assets</div>
          <div className="metric-value">{assets.length}</div>
          <p className="metric-change text-[#525252]">{typeData.length} types</p>
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
          <div className="metric-value">{avgUtilization}%</div>
          <p className="metric-change text-[#525252]">CPU + Memory</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#f4f4f4] p-4 rounded">
          <PieChart data={pieChartData} options={pieOptions} />
        </div>
        <div className="bg-[#f4f4f4] p-4 rounded">
          <SimpleBarChart data={barChartData} options={barOptions} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e0e0e0]">
          <div>
            <h4 className="text-base font-semibold text-[#161616]">All Assets</h4>
            <p className="text-sm text-[#525252]">View and manage infrastructure resources</p>
          </div>
          <div className="flex gap-2">
            <Button kind="ghost" size="sm" renderIcon={Filter}>Filter</Button>
            <Button kind="ghost" size="sm" renderIcon={Download}>Export</Button>
          </div>
        </div>

        <Tabs>
          <TabList aria-label="Asset type tabs">
            <Tab onClick={() => setSelectedAssetType(null)}>All ({assets.length})</Tab>
            {typeData.map((type) => (
              <Tab key={type.type} onClick={() => setSelectedAssetType(type.type)}>
                {type.type} ({type.count})
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="mt-4 max-h-[400px] overflow-y-auto">
                {sortedAssets.map((asset) => <AssetRow key={asset.id} asset={asset} />)}
              </div>
            </TabPanel>
            {typeData.map((type) => (
              <TabPanel key={type.type}>
                <div className="mt-4 max-h-[400px] overflow-y-auto">
                  {sortedAssets
                    .filter((a) => a.type === type.type)
                    .map((asset) => <AssetRow key={asset.id} asset={asset} />)}
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
