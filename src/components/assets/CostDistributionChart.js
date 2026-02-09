import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Tile, ContentSwitcher, Switch } from "@carbon/react";
import { StackedBarChart, GroupedBarChart, SimpleBarChart } from "@carbon/charts-react";
import { formatCurrency, buildColorScale } from "../../utils/assetCalculations";
import { useThemeMode } from "../../context/ThemeContext";

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
    percentage: totalCost > 0
      ? ((item.value / totalCost) * 100).toFixed(1)
      : "0.0",
  }));

  return { data, totalCost };
}

function transformToCostPerGBData(assets, aggregateBy) {
  if (!assets || assets.length === 0) return { data: [], totalCost: 0 };

  const grouped = {};
  assets.forEach((asset) => {
    const groupVal = getGroupField(asset, aggregateBy);
    if (!grouped[groupVal]) {
      grouped[groupVal] = { cost: 0, bytes: 0 };
    }
    grouped[groupVal].cost += asset.totalCost || 0;
    grouped[groupVal].bytes += asset.bytes || 0;
  });

  const data = Object.entries(grouped).map(([group, info]) => {
    const gb = info.bytes / Math.pow(1024, 3);
    return {
      group,
      key: group,
      value: gb > 0 ? parseFloat((info.cost / gb).toFixed(4)) : 0,
    };
  });

  return { data, totalCost: 0 };
}

const VARIANTS = [
  { name: "stacked", text: "Stacked", Chart: StackedBarChart },
  { name: "grouped", text: "Grouped", Chart: GroupedBarChart },
  { name: "horizontal", text: "Horizontal", Chart: SimpleBarChart },
  { name: "costpergb", text: "$/GB", Chart: SimpleBarChart },
];

const CostDistributionChart = ({ assets, timeWindow, aggregateBy = "cluster" }) => {
  const [variant, setVariant] = useState(0);
  const { theme: carbonTheme, isDark } = useThemeMode();
  const isCostPerGB = variant === 3;
  const isHorizontal = variant === 2;

  const axisLabel = AGGREGATE_LABELS[aggregateBy] || "Cluster";

  const { data, totalCost } = useMemo(
    () => isCostPerGB
      ? transformToCostPerGBData(assets, aggregateBy)
      : transformToBarData(assets, aggregateBy),
    [assets, aggregateBy, isCostPerGB]
  );

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const sorted = [...data].sort((a, b) => b.value - a.value);
    return {
      mostExpensive: sorted[0].group,
      cheapest: sorted[sorted.length - 1].group,
      avgCost: data.reduce((sum, d) => sum + d.value, 0) / data.length,
      groupCount: data.length,
    };
  }, [data]);

  const colorScale = useMemo(
    () => buildColorScale(data.map((d) => d.group), isDark),
    [data, isDark]
  );

  const chartOptions = useMemo(() => {
    const valueTitle = isCostPerGB ? "Cost per GB ($/GB)" : "Cost ($)";

    const baseOptions = {
      title: "",
      resizable: true,
      height: "420px",
      theme: carbonTheme,
      bars: { maxWidth: 60 },
      color: { scale: colorScale },
      tooltip: {
        enabled: true,
        showTotal: variant === 0,
        valueFormatter: (value, label) => {
          const num = typeof value === "number" ? value : Number(value);
          if (isNaN(num)) return String(value);
          if (isCostPerGB) {
            return `$${num.toFixed(4)}/GB`;
          }
          const item = data.find((d) => d.group === label);
          if (item && item.percentage) {
            return `$${num.toFixed(2)} (${item.percentage}%)`;
          }
          return `$${num.toFixed(2)}`;
        },
      },
      legend: { enabled: true, position: "bottom", clickable: true },
      toolbar: {
        enabled: true,
        controls: [{ type: "Export as CSV" }, { type: "Export as PNG" }],
      },
    };

    if (isHorizontal) {
      baseOptions.axes = {
        left: {
          mapsTo: "key",
          title: axisLabel,
          scaleType: "labels",
        },
        bottom: {
          mapsTo: "value",
          title: valueTitle,
        },
      };
    } else {
      baseOptions.axes = {
        left: {
          mapsTo: "value",
          title: valueTitle,
          stacked: variant === 0,
        },
        bottom: {
          mapsTo: "key",
          title: axisLabel,
          scaleType: "labels",
        },
      };
    }

    return baseOptions;
  }, [variant, axisLabel, colorScale, data, isCostPerGB, isHorizontal, carbonTheme]);

  const { Chart } = VARIANTS[variant];

  return (
    <Tile className="chart-tile chart-hero">
      <div className="chart-header">
        <div>
          <h3>Cost Distribution</h3>
          <p className="chart-description">
            {isCostPerGB
              ? `Cost efficiency by ${axisLabel.toLowerCase()} (${timeWindow || "30d"} window)`
              : `Total cost by ${axisLabel.toLowerCase()} (${timeWindow || "30d"} window)`}
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
          <div className="chart-total">
            {isCostPerGB ? "Efficiency View" : formatCurrency(totalCost)}
          </div>
        </div>
      </div>
      {data.length > 0 ? (
        <>
          <div className="chart-content">
            <Chart data={data} options={chartOptions} />
          </div>
          {stats && (
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Most Expensive</span>
                <span className="stat-value">{stats.mostExpensive}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Cheapest</span>
                <span className="stat-value">{stats.cheapest}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{isCostPerGB ? "Avg $/GB" : "Avg Cost"}</span>
                <span className="stat-value">
                  {isCostPerGB
                    ? `$${stats.avgCost.toFixed(4)}/GB`
                    : formatCurrency(stats.avgCost)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Groups</span>
                <span className="stat-value">{stats.groupCount}</span>
              </div>
            </div>
          )}
        </>
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
      bytes: PropTypes.number,
    })
  ).isRequired,
  timeWindow: PropTypes.string,
  aggregateBy: PropTypes.string,
};

export default CostDistributionChart;
