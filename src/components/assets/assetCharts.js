import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Treemap,
} from "recharts";
import { primary } from "../../constants/colors";
import { toCurrency } from "../../util";
import { typeColors } from "./tokens";

export const AssetTypePieChart = ({ assetsByType, currency }) => {
  const pieData = Object.entries(assetsByType)
    .map(([type, cost]) => ({
      name: type,
      value: cost,
      fill: typeColors[type] || primary[Object.keys(assetsByType).indexOf(type) % primary.length],
    }))
    .sort((a, b) => b.value - a.value);

  const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name, fill, value }) => {
    if (percent < 0.03) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN) + (cx + radius * Math.cos(-midAngle * RADIAN) > cx ? 4 : -4);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill={fill} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12}>
        {`${name}: ${toCurrency(value, currency)} (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="80%"
          innerRadius="45%"
          startAngle={90}
          endAngle={-270}
          label={renderLabel}
          labelLine
          animationDuration={400}
          paddingAngle={2}
        >
          {pieData.map((d, i) => (
            <Cell key={i} fill={d.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => toCurrency(value, currency)} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const TopAssetsCostBarChart = ({ assets, currency, limit = 8 }) => {
  const sorted = [...assets].sort((a, b) => b.totalCost - a.totalCost).slice(0, limit);
  const barData = sorted.map((a) => ({
    name: (a.properties?.name || a.key || "Unknown").slice(-30),
    totalCost: +a.totalCost.toFixed(2),
    type: a.type,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(250, barData.length * 40)}>
      <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(v) => toCurrency(v, currency)} />
        <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => toCurrency(value, currency)} />
        <Bar dataKey="totalCost" name="Total Cost">
          {barData.map((entry, i) => (
            <Cell key={i} fill={typeColors[entry.type] || primary[i % primary.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const NodeCostBreakdownChart = ({ nodes, currency }) => {
  if (!nodes || nodes.length === 0) return null;
  const barData = nodes.map((n) => ({
    name: (n.properties?.name || n.key || "Unknown").slice(-25),
    cpuCost: +(n.cpuCost || 0).toFixed(2),
    ramCost: +(n.ramCost || 0).toFixed(2),
    gpuCost: +(n.gpuCost || 0).toFixed(2),
    adjustment: +(n.adjustment || 0).toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, barData.length * 50)}>
      <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(v) => toCurrency(v, currency)} />
        <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => toCurrency(value, currency)} />
        <Legend />
        <Bar dataKey="cpuCost" name="CPU" stackId="stack" fill="#2196F3" />
        <Bar dataKey="ramCost" name="RAM" stackId="stack" fill="#4CAF50" />
        <Bar dataKey="gpuCost" name="GPU" stackId="stack" fill="#FF9800" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const CostDistributionTreemap = ({ assets, currency }) => {
  if (!assets || assets.length === 0) return null;
  const treemapPalette = {
    Node: "#e3f2fd",
    Disk: "#e8f5e9",
    LoadBalancer: "#fff3e0",
    Network: "#fce4ec",
    ClusterManagement: "#ede7f6",
    Other: "#eceff1",
  };

  const treemapBorder = {
    Node: "#90caf9",
    Disk: "#a5d6a7",
    LoadBalancer: "#ffcc80",
    Network: "#f8bbd0",
    ClusterManagement: "#b39ddb",
    Other: "#b0bec5",
  };

  const typeGroups = {};
  assets.forEach((a) => {
    const t = a.type || "Other";
    if (!typeGroups[t]) typeGroups[t] = { name: t, children: [], totalCost: 0 };
    typeGroups[t].children.push({
      name: (a.properties?.name || a.key || "Unknown").slice(-28),
      size: Math.max(a.totalCost || 0, 0.01),
      fullName: a.properties?.name || a.key || "Unknown",
      type: t,
      cost: a.totalCost || 0,
    });
    typeGroups[t].totalCost += a.totalCost || 0;
  });

  const treemapData = Object.values(typeGroups)
    .sort((a, b) => b.totalCost - a.totalCost)
    .map((g) => ({
      ...g,
      children: g.children.sort((a, b) => b.size - a.size).slice(0, 15),
    }));

  const CustomContent = (props) => {
    const { x, y, width, height, name, cost, type, depth } = props;
    if (width < 4 || height < 4) return null;

    const key = depth === 1 ? name : type;
    const fill = treemapPalette[key] || "#e3f2fd";
    const stroke = treemapBorder[key] || "#90caf9";

    const showLabel = width > 50 && height > 28;
    const showCost = width > 70 && height > 40;

    return (
      <g>
        <rect
          x={x} y={y} width={width} height={height}
          rx={3}
          style={{ fill, stroke, strokeWidth: 1.5, opacity: depth === 1 ? 0.5 : 0.95 }}
        />
        {showLabel && (
          <text x={x + 6} y={y + 16} fill="#263238" fontSize={11} fontWeight={600}>
            {name?.length > Math.floor(width / 7) ? name.slice(0, Math.floor(width / 7)) + "…" : name}
          </text>
        )}
        {showCost && cost !== undefined && (
          <text x={x + 6} y={y + 30} fill="#455a64" fontSize={10}>
            {toCurrency(cost, currency)}
          </text>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={360}>
      <Treemap
        data={treemapData}
        dataKey="size"
        nameKey="name"
        aspectRatio={4 / 3}
        animationDuration={300}
        content={<CustomContent />}
      >
        <Tooltip
          content={({ payload }) => {
            if (!payload || !payload.length) return null;
            const d = payload[0].payload;
            if (!d || d.depth === 1) return null;
            return (
              <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
                <div style={{ fontWeight: 600 }}>{d.fullName || d.name}</div>
                <div style={{ color: "#666" }}>Type: {d.type}</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{toCurrency(d.cost, currency)}</div>
              </div>
            );
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
};

function utilizationBarColor(pct) {
  if (pct < 30) return "#f44336";
  if (pct < 70) return "#ff9800";
  return "#4caf50";
}

export const NodeUtilizationChart = ({ nodes }) => {
  if (!nodes || nodes.length === 0) return null;
  const data = nodes.map((n) => ({
    name: (n.properties?.name || n.key || "").slice(-25),
    cpuUsed: +(((1 - (n.cpuBreakdown?.idle || 1)) * 100).toFixed(1)),
    ramUsed: +(((1 - (n.ramBreakdown?.idle || 1)) * 100).toFixed(1)),
  }));

  const CpuBarShape = (props) => {
    const { x, y, width, height, payload } = props;
    return <rect x={x} y={y} width={width} height={height} fill={utilizationBarColor(payload.cpuUsed)} rx={2} />;
  };
  const RamBarShape = (props) => {
    const { x, y, width, height, payload } = props;
    return <rect x={x} y={y} width={width} height={height} fill={utilizationBarColor(payload.ramUsed)} rx={2} />;
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 50)}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value) => {
            const label = value < 30 ? "Low — waste" : value < 70 ? "Moderate" : "Healthy";
            return [`${value}% (${label})`];
          }}
        />
        <Legend />
        <ReferenceLine x={30} stroke="#f44336" strokeDasharray="4 4" label={{ value: "30%", position: "top", fontSize: 10, fill: "#f44336" }} />
        <ReferenceLine x={70} stroke="#4caf50" strokeDasharray="4 4" label={{ value: "70%", position: "top", fontSize: 10, fill: "#4caf50" }} />
        <Bar dataKey="cpuUsed" name="CPU Utilization %" shape={<CpuBarShape />} />
        <Bar dataKey="ramUsed" name="RAM Utilization %" shape={<RamBarShape />} />
      </BarChart>
    </ResponsiveContainer>
  );
};
