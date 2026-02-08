import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Tile, ContentSwitcher, Switch } from "@carbon/react";
import { StackedBarChart, GroupedBarChart } from "@carbon/charts-react";
import { formatCurrency, buildColorScale } from "../../utils/assetCalculations";

const AGGREGATE_LABELS = {
  type: "Asset Type",
  cluster: "Cluster",
  storageclass: "Storage Class",
  providerID: "Provider",
};

function getGroupField(asset, aggregateBy) {
  switch (aggregateBy) {
    case "type":
      return asset.assetType || "Unknown";
    case "storageclass":
      return asset.storageClass || "Unspecified";
    case "providerID":
      return asset.providerID || asset.name || "Unknown";
    case "cluster":
    default:
      return asset.cluster || "Unknown";
  }
}

function transformToBarData(assets, aggregateBy) {
  if (!assets || assets.length === 0) return { data: [], totalCost: 0 };

  const grouped = {};
  let totalCost = 0;

  assets.forEach((asset) => {
    const groupVal = getGroupField(asset, aggregateBy);
    const cost = asset.totalCost || 0;

    if (!grouped[groupVal]) {
      grouped[groupVal] = { group: groupVal, key: groupVal, value: 0 };
    }
    grouped[groupVal].value += cost;
    totalCost += cost;
  });

  const data = Object.values(grouped).map((item) => ({
    ...item,
    value: parseFloat(item.value.toFixed(2)),
  }));

  return { data, totalCost };
}

const VARIANTS = [
  { name: "stacked", text: "Stacked", Chart: StackedBarChart },
  { name: "grouped", text: "Grouped", Chart: GroupedBarChart },
];

const CostDistributionChart = ({ assets, timeWindow, aggregateBy = "cluster" }) => {
  const [variant, setVariant] = useState(0);

  const axisLabel = AGGREGATE_LABELS[aggregateBy] || "Cluster";

  const { data, totalCost } = useMemo(
    () => transformToBarData(assets, aggregateBy),
    [assets, aggregateBy]
  );

  const colorScale = useMemo(
    () => buildColorScale(data.map((d) => d.group)),
    [data]
  );

  const chartOptions = useMemo(
    () => ({
      title: "",
      resizable: true,
      height: "400px",
      theme: "white",
      bars: { maxWidth: 60 },
      axes: {
        left: {
          mapsTo: "value",
          title: "Cost ($)",
          stacked: variant === 0,
        },
        bottom: {
          mapsTo: "key",
          title: axisLabel,
          scaleType: "labels",
        },
      },
      color: { scale: colorScale },
      tooltip: { enabled: true, showTotal: variant === 0 },
      legend: { enabled: true, position: "bottom", clickable: true, alignment: "center" },
      toolbar: {
        enabled: true,
        controls: [{ type: "Export as CSV" }, { type: "Export as PNG" }],
      },
    }),
    [variant, axisLabel, colorScale]
  );

  const { Chart } = VARIANTS[variant];

  return (
    <Tile className="chart-tile chart-hero">
      <div className="chart-header">
        <div>
          <h3>Cost Distribution</h3>
          <p className="chart-description">
            Total cost by {axisLabel.toLowerCase()} ({timeWindow || "30d"} window)
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
          <Chart data={data} options={chartOptions} />
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
  timeWindow: PropTypes.string,
  aggregateBy: PropTypes.string,
};

export default CostDistributionChart;
