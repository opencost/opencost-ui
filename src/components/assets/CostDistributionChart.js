import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Tile, ContentSwitcher, Switch } from "@carbon/react";
import { StackedBarChart, GroupedBarChart, DonutChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import { formatCurrency } from "../../utils/assetCalculations";

function transformToStackedData(assets) {
  if (!assets || assets.length === 0) return { data: [], totalCost: 0 };

  const grouped = {};
  let totalCost = 0;

  assets.forEach((asset) => {
    const type = asset.assetType || "Unknown";
    const cluster = asset.cluster || "Unknown";
    const cost = asset.totalCost || 0;
    const key = `${cluster}||${type}`;

    if (!grouped[key]) {
      grouped[key] = { group: type, key: cluster, value: 0 };
    }
    grouped[key].value += cost;
    totalCost += cost;
  });

  const data = Object.values(grouped).map((item) => ({
    ...item,
    value: parseFloat(item.value.toFixed(2)),
  }));

  return { data, totalCost };
}

function transformToDonutData(assets) {
  if (!assets || assets.length === 0) return { data: [], totalCost: 0 };

  const byType = {};
  let totalCost = 0;

  assets.forEach((asset) => {
    const type = asset.assetType || "Unknown";
    const cost = asset.totalCost || 0;
    byType[type] = (byType[type] || 0) + cost;
    totalCost += cost;
  });

  const data = Object.entries(byType).map(([group, value]) => ({
    group,
    value: parseFloat(value.toFixed(2)),
  }));

  return { data, totalCost };
}

const colorScale = {
  "Node Disk": "#0f62fe",
  Node: "#0f62fe",
  PVC: "#24a148",
  Storage: "#0043ce",
  Unknown: "#525252",
};

const stackedOptions = {
  title: "",
  resizable: true,
  height: "400px",
  bars: { maxWidth: 60 },
  axes: {
    left: { mapsTo: "value", title: "Cost ($)", stacked: true },
    bottom: { mapsTo: "key", title: "Cluster", scaleType: "labels" },
  },
  color: { scale: colorScale },
  tooltip: { enabled: true, showTotal: true },
  legend: { enabled: true, position: "bottom", clickable: true },
  toolbar: {
    enabled: true,
    controls: [{ type: "Export as CSV" }, { type: "Export as PNG" }],
  },
};

const groupedOptions = {
  ...stackedOptions,
  axes: {
    left: { mapsTo: "value", title: "Cost ($)" },
    bottom: { mapsTo: "key", title: "Cluster", scaleType: "labels" },
  },
};

const donutOptions = {
  title: "",
  resizable: true,
  height: "400px",
  donut: { center: { label: "Total Cost" } },
  color: { scale: colorScale },
  tooltip: { enabled: true },
  legend: { enabled: true, position: "bottom", clickable: true },
  toolbar: {
    enabled: true,
    controls: [{ type: "Export as CSV" }, { type: "Export as PNG" }],
  },
};

const VARIANTS = [
  { name: "stacked", text: "Stacked", Chart: StackedBarChart },
  { name: "grouped", text: "Grouped", Chart: GroupedBarChart },
  { name: "donut", text: "Donut", Chart: DonutChart },
];

const CostDistributionChart = ({ assets }) => {
  const [variant, setVariant] = useState(0);

  const { data, totalCost } = useMemo(() => {
    if (variant === 2) return transformToDonutData(assets);
    return transformToStackedData(assets);
  }, [assets, variant]);

  const options = [stackedOptions, groupedOptions, donutOptions][variant];
  const { Chart } = VARIANTS[variant];

  return (
    <Tile className="chart-tile chart-hero">
      <div className="chart-header">
        <div>
          <h3>Cost Distribution</h3>
          <p className="chart-description">
            Total cost per cluster, broken down by asset type
          </p>
        </div>
        <div className="chart-controls">
          <ContentSwitcher
            size="sm"
            selectedIndex={variant}
            onChange={(e) => setVariant(e.index)}
          >
            {VARIANTS.map((v) => (
              <Switch key={v.name} name={v.name} text={v.text} />
            ))}
          </ContentSwitcher>
          <div className="chart-total">{formatCurrency(totalCost)}</div>
        </div>
      </div>
      {data.length > 0 ? (
        <div className="chart-content">
          <Chart data={data} options={options} />
        </div>
      ) : (
        <div className="chart-empty">
          No cost data available for the selected period
        </div>
      )}
    </Tile>
  );
};

CostDistributionChart.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      assetType: PropTypes.string,
      cluster: PropTypes.string,
      totalCost: PropTypes.number,
    })
  ).isRequired,
};

export default CostDistributionChart;
