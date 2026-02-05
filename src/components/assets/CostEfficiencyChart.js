import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Tile, ContentSwitcher, Switch } from "@carbon/react";
import { ComboChart, GroupedBarChart, AreaChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import { formatCurrency } from "../../utils/assetCalculations";

function aggregateClusters(assets) {
  const clusterMap = {};

  assets.forEach((asset) => {
    const cluster = asset.cluster || "Unknown";
    if (!clusterMap[cluster]) {
      clusterMap[cluster] = { totalCost: 0, count: 0, totalUtilization: 0 };
    }
    clusterMap[cluster].totalCost += asset.totalCost || 0;
    clusterMap[cluster].count += 1;
    clusterMap[cluster].totalUtilization += (1 - (asset.breakdown?.idle || 0)) * 100;
  });

  return clusterMap;
}

function buildStats(clusterMap, assetCount) {
  const totalCost = Object.values(clusterMap).reduce((s, c) => s + c.totalCost, 0);
  const avgUtilization = parseFloat(
    (Object.values(clusterMap).reduce((s, c) => s + c.totalUtilization, 0) / assetCount).toFixed(1)
  );
  return {
    clusters: Object.keys(clusterMap).length,
    totalCost,
    avgUtilization,
  };
}

function transformToComboData(assets) {
  if (!assets || assets.length === 0) return { data: [], stats: null };

  const clusterMap = aggregateClusters(assets);
  const data = [];

  Object.entries(clusterMap).forEach(([cluster, info]) => {
    const avgUtil = parseFloat((info.totalUtilization / info.count).toFixed(1));
    data.push({ group: "Total Cost", key: cluster, value: parseFloat(info.totalCost.toFixed(2)) });
    data.push({ group: "Avg Utilization (%)", key: cluster, value: avgUtil });
  });

  return { data, stats: buildStats(clusterMap, assets.length) };
}

function transformToGroupedData(assets) {
  if (!assets || assets.length === 0) return { data: [], stats: null };

  const clusterMap = aggregateClusters(assets);
  const data = [];

  Object.entries(clusterMap).forEach(([cluster, info]) => {
    const avgUtil = parseFloat((info.totalUtilization / info.count).toFixed(1));
    data.push({ group: "Cost ($)", key: cluster, value: parseFloat(info.totalCost.toFixed(2)) });
    data.push({ group: "Utilization (%)", key: cluster, value: avgUtil });
  });

  return { data, stats: buildStats(clusterMap, assets.length) };
}

function transformToAreaData(assets) {
  if (!assets || assets.length === 0) return { data: [], stats: null };

  const clusterMap = aggregateClusters(assets);
  const data = [];

  Object.entries(clusterMap).forEach(([cluster, info]) => {
    const avgUtil = parseFloat((info.totalUtilization / info.count).toFixed(1));
    data.push({ group: "Utilization (%)", key: cluster, value: avgUtil });
    data.push({ group: "Cost ($)", key: cluster, value: parseFloat(info.totalCost.toFixed(2)) });
  });

  return { data, stats: buildStats(clusterMap, assets.length) };
}

const comboOptions = {
  title: "",
  resizable: true,
  height: "350px",
  axes: {
    left: { title: "Cost ($)", mapsTo: "value", correspondingDatasets: ["Total Cost"] },
    right: { title: "Utilization (%)", mapsTo: "value", correspondingDatasets: ["Avg Utilization (%)"] },
    bottom: { mapsTo: "key", scaleType: "labels" },
  },
  comboChartTypes: [
    { type: "simple-bar", correspondingDatasets: ["Total Cost"] },
    { type: "line", correspondingDatasets: ["Avg Utilization (%)"], options: { points: { enabled: true, radius: 4 } } },
  ],
  color: { scale: { "Total Cost": "#0f62fe", "Avg Utilization (%)": "#da1e28" } },
  tooltip: { enabled: true },
  legend: { enabled: true, position: "bottom" },
};

const groupedOptions = {
  title: "",
  resizable: true,
  height: "350px",
  axes: {
    left: { mapsTo: "value", title: "Value" },
    bottom: { mapsTo: "key", scaleType: "labels" },
  },
  color: { scale: { "Cost ($)": "#0f62fe", "Utilization (%)": "#24a148" } },
  tooltip: { enabled: true },
  legend: { enabled: true, position: "bottom" },
};

const areaOptions = {
  title: "",
  resizable: true,
  height: "350px",
  axes: {
    left: { mapsTo: "value", title: "Value" },
    bottom: { mapsTo: "key", scaleType: "labels" },
  },
  color: { scale: { "Utilization (%)": "#0f62fe", "Cost ($)": "#da1e28" } },
  curve: "curveMonotoneX",
  tooltip: { enabled: true },
  legend: { enabled: true, position: "bottom" },
};

const VARIANTS = [
  { name: "combo", text: "Combo", Chart: ComboChart, transform: transformToComboData, options: comboOptions },
  { name: "grouped", text: "Grouped", Chart: GroupedBarChart, transform: transformToGroupedData, options: groupedOptions },
  { name: "area", text: "Area", Chart: AreaChart, transform: transformToAreaData, options: areaOptions },
];

const CostEfficiencyChart = ({ assets }) => {
  const [variant, setVariant] = useState(0);
  const current = VARIANTS[variant];

  const { data, stats } = useMemo(
    () => current.transform(assets),
    [assets, variant]
  );

  const { Chart } = current;

  return (
    <Tile className="chart-tile">
      <div className="chart-header">
        <div>
          <h3>Cost vs Efficiency</h3>
          <p className="chart-description">
            Cost per cluster with average utilization overlay
          </p>
        </div>
        <ContentSwitcher
          size="sm"
          selectedIndex={variant}
          onChange={(e) => setVariant(e.index)}
        >
          {VARIANTS.map((v) => (
            <Switch key={v.name} name={v.name} text={v.text} />
          ))}
        </ContentSwitcher>
      </div>
      {data.length > 0 ? (
        <>
          <div className="chart-content">
            <Chart data={data} options={current.options} />
          </div>
          {stats && (
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Total Cost</span>
                <span className="stat-value">{formatCurrency(stats.totalCost)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Utilization</span>
                <span className="stat-value">{stats.avgUtilization}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Clusters</span>
                <span className="stat-value">{stats.clusters}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="chart-empty">No efficiency data available</div>
      )}
    </Tile>
  );
};

CostEfficiencyChart.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      cluster: PropTypes.string,
      totalCost: PropTypes.number,
      breakdown: PropTypes.shape({ idle: PropTypes.number }),
    })
  ).isRequired,
};

export default CostEfficiencyChart;
