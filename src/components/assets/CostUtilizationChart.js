import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Tile, ContentSwitcher, Switch } from "@carbon/react";
import { ScatterChart, DonutChart, SimpleBarChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";

function categorize(asset) {
  const idle = asset.breakdown?.idle || 0;
  const utilization = Math.round((1 - idle) * 100);

  if (utilization >= 80) return { status: "Efficient", utilization };
  if (utilization < 30) return { status: "Critical", utilization };
  return { status: "Healthy", utilization };
}

function transformToScatterData(assets) {
  if (!assets || assets.length === 0) return { data: [], stats: null };

  let efficient = 0, healthy = 0, critical = 0;

  const data = assets
    .map((asset) => {
      const { status, utilization } = categorize(asset);
      if (status === "Efficient") efficient++;
      else if (status === "Critical") critical++;
      else healthy++;

      return {
        group: status,
        x: utilization,
        y: parseFloat((asset.totalCost || 0).toFixed(2)),
      };
    })
    .filter((item) => item.y > 0);

  return {
    data,
    stats: { efficient, healthy, critical, total: data.length },
  };
}

function transformToDonutData(assets) {
  if (!assets || assets.length === 0) return { data: [], stats: null };

  let efficient = 0, healthy = 0, critical = 0;

  assets.forEach((asset) => {
    const { status } = categorize(asset);
    if (status === "Efficient") efficient++;
    else if (status === "Critical") critical++;
    else healthy++;
  });

  const data = [
    { group: "Efficient", value: efficient },
    { group: "Healthy", value: healthy },
    { group: "Critical", value: critical },
  ].filter((d) => d.value > 0);

  return {
    data,
    stats: { efficient, healthy, critical, total: assets.length },
  };
}

function transformToBarData(assets) {
  if (!assets || assets.length === 0) return { data: [], stats: null };

  let efficient = 0, healthy = 0, critical = 0;

  const data = assets
    .map((asset) => {
      const { status, utilization } = categorize(asset);
      if (status === "Efficient") efficient++;
      else if (status === "Critical") critical++;
      else healthy++;

      return {
        group: status,
        key: asset.name || asset.id,
        value: utilization,
      };
    })
    .sort((a, b) => b.value - a.value);

  return {
    data,
    stats: { efficient, healthy, critical, total: data.length },
  };
}

const statusColors = {
  Efficient: "#24a148",
  Healthy: "#0f62fe",
  Critical: "#da1e28",
};

const scatterOptions = {
  title: "",
  resizable: true,
  height: "350px",
  legend: { enabled: true, position: "bottom", clickable: true },
  tooltip: { enabled: true },
  axes: {
    left: { mapsTo: "y", title: "Monthly Cost ($)" },
    bottom: { mapsTo: "x", title: "Utilization (%)", domain: [0, 100] },
  },
  color: { scale: statusColors },
  points: { radius: 6, fillOpacity: 0.7 },
};

const donutOptions = {
  title: "",
  resizable: true,
  height: "350px",
  donut: { center: { label: "Assets" } },
  color: { scale: statusColors },
  tooltip: { enabled: true },
  legend: { enabled: true, position: "bottom", clickable: true },
};

const barOptions = {
  title: "",
  resizable: true,
  height: "350px",
  axes: {
    left: { mapsTo: "value", title: "Utilization (%)", domain: [0, 100] },
    bottom: { mapsTo: "key", scaleType: "labels" },
  },
  color: { scale: statusColors },
  tooltip: { enabled: true },
  legend: { enabled: true, position: "bottom", clickable: true },
  bars: { maxWidth: 40 },
};

const VARIANTS = [
  { name: "scatter", text: "Scatter", Chart: ScatterChart, transform: transformToScatterData, options: scatterOptions },
  { name: "donut", text: "Donut", Chart: DonutChart, transform: transformToDonutData, options: donutOptions },
  { name: "bar", text: "Bar", Chart: SimpleBarChart, transform: transformToBarData, options: barOptions },
];

const CostUtilizationChart = ({ assets }) => {
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
          <h3>Cost vs Utilization</h3>
          <p className="chart-description">
            Asset efficiency — green is well-utilized, red needs attention
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
                <span className="stat-label">Efficient (&ge;80%)</span>
                <span className="stat-count efficient">{stats.efficient}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Healthy (30-79%)</span>
                <span className="stat-count healthy">{stats.healthy}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Critical (&lt;30%)</span>
                <span className="stat-count critical">{stats.critical}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Tracked</span>
                <span className="stat-value">{stats.total}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="chart-empty">No utilization data available</div>
      )}
    </Tile>
  );
};

CostUtilizationChart.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      totalCost: PropTypes.number,
      breakdown: PropTypes.shape({ idle: PropTypes.number }),
    })
  ).isRequired,
};

export default CostUtilizationChart;
