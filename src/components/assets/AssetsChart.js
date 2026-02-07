import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toCurrency } from "../../util";
import { groupAssetsBy, getAssetColor } from "./assetUtils";
import { assetTypeConfig } from "./tokens";

const PROVIDER_COLORS = [
  "#0f62fe",
  "#198038",
  "#8a3ffc",
  "#009d9a",
  "#b28600",
  "#da1e28",
  "#6929c4",
  "#002d9c",
];

const BarTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 6,
        padding: "0.5rem 0.75rem",
        fontSize: "0.8125rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>
        {entry.name || entry.payload.name}
      </div>
      <div style={{ color: "#525252" }}>
        {toCurrency(entry.value, "USD")}
      </div>
    </div>
  );
};

/* Active sector shape — slightly expanded ring on hover */
const ActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 2}
      outerRadius={outerRadius + 4}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

/* Custom legend rendered below the donut */
const PieLegend = ({ pieData, total }) => (
  <div className="assets-pie-legend">
    {pieData.map((d) => (
      <div key={d.name} className="assets-pie-legend-item">
        <span
          className="assets-pie-legend-swatch"
          style={{ background: d.fill }}
        />
        <span className="assets-pie-legend-name">{d.name}</span>
        <span className="assets-pie-legend-value">
          {toCurrency(d.value, "USD")}
        </span>
        <span className="assets-pie-legend-pct">
          {total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : "0%"}
        </span>
      </div>
    ))}
  </div>
);

const AssetsChart = ({ assets }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const typeData = useMemo(() => groupAssetsBy(assets, "type"), [assets]);
  const providerData = useMemo(
    () => groupAssetsBy(assets, "provider"),
    [assets],
  );

  if (assets.length === 0) return null;

  const pieData = typeData.map((d) => ({
    name: assetTypeConfig[d.name] ? assetTypeConfig[d.name].label : d.name,
    value: d.totalCost,
    fill: getAssetColor(d.name),
  }));

  const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0);
  const hovered = activeIndex >= 0 ? pieData[activeIndex] : null;

  return (
    <div className="assets-charts">
      <div className="assets-chart-card">
        <div className="assets-chart-title">Cost by Asset Type</div>
        <div style={{ position: "relative" }}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={52}
                paddingAngle={2}
                label={false}
                strokeWidth={0}
                isAnimationActive={false}
                activeIndex={activeIndex >= 0 ? activeIndex : undefined}
                activeShape={ActiveShape}
                onMouseEnter={(_, idx) => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label inside the donut hole */}
          <div className="assets-donut-center" style={{ pointerEvents: "none" }}>
            {hovered ? (
              <>
                <div className="assets-donut-center-name">{hovered.name}</div>
                <div className="assets-donut-center-value">
                  {toCurrency(hovered.value, "USD")}
                </div>
              </>
            ) : (
              <>
                <div className="assets-donut-center-name">Total</div>
                <div className="assets-donut-center-value">
                  {toCurrency(pieTotal, "USD")}
                </div>
              </>
            )}
          </div>
        </div>
        <PieLegend pieData={pieData} total={pieTotal} />
      </div>

      <div className="assets-chart-card">
        <div className="assets-chart-title">Cost by Provider</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={providerData}
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => toCurrency(v, "USD", 0)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="totalCost" name="Total Cost" radius={[4, 4, 0, 0]}>
              {providerData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={PROVIDER_COLORS[i % PROVIDER_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(AssetsChart);
