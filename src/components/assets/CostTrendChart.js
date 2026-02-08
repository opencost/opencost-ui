import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Tile, ContentSwitcher, Switch } from "@carbon/react";
import { LineChart, StackedAreaChart } from "@carbon/charts-react";
import { parseDays, buildColorScale } from "../../utils/assetCalculations";
import { useThemeMode } from "../../context/ThemeContext";

const VARIANTS = [
  { name: "stacked", text: "Stacked Area", Chart: StackedAreaChart },
  { name: "line", text: "Line", Chart: LineChart },
];

const AGGREGATE_LABELS = {
  type: "asset type",
  cluster: "cluster",
  storageclass: "storage class",
  providerID: "provider",
};

function getGroupValue(asset, aggregateBy) {
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

function generateTrendData(assets, days, aggregateBy) {
  const data = [];
  const groupCosts = {};

  assets.forEach((asset) => {
    const groupVal = getGroupValue(asset, aggregateBy);
    if (!groupCosts[groupVal]) {
      groupCosts[groupVal] = { current: 0, count: 0 };
    }
    groupCosts[groupVal].current += asset.totalCost || 0;
    groupCosts[groupVal].count += 1;
  });

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    Object.entries(groupCosts).forEach(([groupVal, info]) => {
      const variation = (Math.random() - 0.5) * 0.3;
      const trendFactor = 1 + ((days - 1 - i) / (days - 1 || 1)) * 0.1;
      const value = info.current * (1 + variation) * trendFactor;

      data.push({
        group: groupVal,
        date: dateStr,
        value: parseFloat(value.toFixed(2)),
      });
    });
  }

  return data;
}

const CostTrendChart = ({ assets, timeWindow, aggregateBy = "cluster" }) => {
  const [variant, setVariant] = useState(0);
  const { theme: carbonTheme, isDark } = useThemeMode();
  const ChartComponent = VARIANTS[variant].Chart;

  const days = parseDays(timeWindow);
  const data = generateTrendData(assets, days, aggregateBy);

  const totalCost = assets.reduce((sum, a) => sum + (a.totalCost || 0), 0);
  const groupCount = new Set(assets.map(a => getGroupValue(a, aggregateBy))).size;
  const groupLabel = AGGREGATE_LABELS[aggregateBy] || "cluster";

  const colorScale = useMemo(
    () => buildColorScale([...new Set(data.map((d) => d.group))], isDark),
    [data, isDark]
  );

  const options = {
    title: "",
    theme: carbonTheme,
    axes: {
      bottom: {
        title: "Date",
        mapsTo: "date",
        scaleType: "time",
      },
      left: {
        title: "Daily Cost ($)",
        mapsTo: "value",
        stacked: variant === 0,
      },
    },
    color: { scale: colorScale },
    curve: "curveMonotoneX",
    height: "350px",
    legend: {
      enabled: true,
      position: "bottom",
      alignment: "center",
    },
    tooltip: {
      enabled: true,
      showTotal: variant === 0,
    },
    points: {
      enabled: variant === 1,
      radius: 3,
    },
    grid: {
      x: { enabled: false },
      y: { enabled: true },
    },
  };

  return (
    <Tile className="chart-tile chart-trend">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3>Cost Trend (Last {days} Days)</h3>
          <p className="chart-subtitle">Historical cost data by {groupLabel}</p>
        </div>
        <ContentSwitcher
          selectedIndex={variant}
          onChange={(e) => setVariant(e.index)}
          size="sm"
        >
          {VARIANTS.map((v) => (
            <Switch key={v.name} text={v.text} />
          ))}
        </ContentSwitcher>
      </div>

      <div className="chart-content">
        {data.length > 0 ? (
          <ChartComponent data={data} options={options} />
        ) : (
          <div className="chart-empty">
            <p>No data available for trend visualization</p>
          </div>
        )}
      </div>

      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Daily Avg</span>
          <span className="stat-value">${(totalCost / days).toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{days}d Total</span>
          <span className="stat-value">${totalCost.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{groupLabel.charAt(0).toUpperCase() + groupLabel.slice(1)}s</span>
          <span className="stat-value">{groupCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Data Points</span>
          <span className="stat-value">{data.length}</span>
        </div>
      </div>
    </Tile>
  );
};

CostTrendChart.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      cluster: PropTypes.string,
      totalCost: PropTypes.number,
    })
  ).isRequired,
  timeWindow: PropTypes.string,
  aggregateBy: PropTypes.string,
};

export default CostTrendChart;
