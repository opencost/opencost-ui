import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toCurrency } from "../../util";

const COLORS = ["#0f62fe", "#ff832b", "#198038", "#6929c4", "#8a3ffc", "#da1e28"];

const AssetsChart = ({ assetsData, currency = "USD", aggregateBy = "type" }) => {
  // Calculate summary statistics and chart data
  const { totalCost, assetCount, primaryData, secondaryData, categoryData, cpuCost, ramCost, storageCost } = React.useMemo(() => {
    if (!assetsData || typeof assetsData !== "object") {
      return { totalCost: 0, assetCount: 0, primaryData: [], secondaryData: [], categoryData: [], cpuCost: 0, ramCost: 0, storageCost: 0 };
    }

    let total = 0;
    let count = 0;
    let totalCpuCost = 0;
    let totalRamCost = 0;
    let totalStorageCost = 0;
    const byType = {};
    const byProvider = {};
    const byCategory = {};
    const byService = {};
    const byCluster = {};
    const byProject = {};

    // assetsData is a flat object
    Object.entries(assetsData).forEach(([key, asset]) => {
      if (!asset || typeof asset !== 'object' || !asset.type) {
        return;
      }
      
      // Calculate total cost
      let cost = 0;
      if (typeof asset.totalCost === 'number') {
        cost = asset.totalCost;
      } else {
        cost = (asset.cpuCost || 0) + (asset.ramCost || 0) + (asset.gpuCost || 0) + 
               (asset.pvCost || 0) + (asset.networkCost || 0) + (asset.loadBalancerCost || 0);
      }
      
      // Accumulate cost components by asset type
      totalCpuCost += (asset.cpuCost || 0);
      totalRamCost += (asset.ramCost || 0);
      
      // Storage cost comes from Disk type assets
      if (asset.type === 'Disk') {
        totalStorageCost += cost;
      }
      
      total += cost;
      count += 1;

      // Group by all dimensions
      const type = asset.type || "Unknown";
      const provider = asset.properties?.provider || asset.provider || "Unknown";
      const category = asset.properties?.category || asset.category || "Unknown";
      const service = asset.properties?.service || asset.service || "Unknown";
      const cluster = asset.properties?.cluster || asset.cluster || "Unknown";
      const project = asset.properties?.project || asset.project || "Unknown";

      byType[type] = (byType[type] || 0) + cost;
      byProvider[provider] = (byProvider[provider] || 0) + cost;
      byCategory[category] = (byCategory[category] || 0) + cost;
      byService[service] = (byService[service] || 0) + cost;
      byCluster[cluster] = (byCluster[cluster] || 0) + cost;
      byProject[project] = (byProject[project] || 0) + cost;
    });

    // Select primary and secondary data based on aggregateBy
    let primary, secondary;
    switch (aggregateBy) {
      case 'type':
        primary = byType;
        secondary = byProvider;
        break;
      case 'category':
        primary = byCategory;
        secondary = byProvider;
        break;
      case 'provider':
        primary = byProvider;
        secondary = byType;
        break;
      case 'service':
        primary = byService;
        secondary = byProvider;
        break;
      case 'cluster':
        primary = byCluster;
        secondary = byProvider;
        break;
      case 'project':
        primary = byProject;
        secondary = byProvider;
        break;
      default:
        primary = byType;
        secondary = byProvider;
    }

    return {
      totalCost: total,
      assetCount: count,
      cpuCost: totalCpuCost,
      ramCost: totalRamCost,
      storageCost: totalStorageCost,
      primaryData: Object.entries(primary)
        .map(([name, value]) => ({ name, value, percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0" }))
        .sort((a, b) => b.value - a.value),
      secondaryData: Object.entries(secondary)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      categoryData: Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    };
  }, [assetsData, aggregateBy]);

  // Get display names for aggregation types
  const getAggregationLabel = (agg) => {
    const labels = {
      type: 'Asset Type',
      category: 'Category',
      provider: 'Provider',
      service: 'Service',
      cluster: 'Cluster',
      project: 'Project'
    };
    return labels[agg] || 'Asset Type';
  };

  const primaryLabel = getAggregationLabel(aggregateBy);
  const secondaryLabel = aggregateBy === 'provider' ? 'Asset Type' : 'Provider';

  if (assetCount === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        No data available for chart
      </div>
    );
  }

  return (
    <div>
      {/* Cost Component Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {/* Total Infrastructure Cost Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderLeft: `4px solid #0f62fe`,
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#525252", marginBottom: "0.5rem" }}>
            Total Infrastructure Cost
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.25rem" }}>
            {toCurrency(totalCost, currency)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#525252" }}>
            {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
          </div>
        </div>
        {/* CPU Cost Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderLeft: `4px solid ${COLORS[0]}`,
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#525252", marginBottom: "0.5rem" }}>
            CPU Cost
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.25rem" }}>
            {toCurrency(cpuCost, currency)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#525252" }}>
            {totalCost > 0 ? ((cpuCost / totalCost) * 100).toFixed(1) : 0}% of total
          </div>
        </div>

        {/* RAM Cost Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderLeft: `4px solid ${COLORS[1]}`,
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#525252", marginBottom: "0.5rem" }}>
            RAM Cost
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.25rem" }}>
            {toCurrency(ramCost, currency)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#525252" }}>
            {totalCost > 0 ? ((ramCost / totalCost) * 100).toFixed(1) : 0}% of total
          </div>
        </div>

        {/* Storage Cost Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderLeft: `4px solid ${COLORS[2]}`,
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#525252", marginBottom: "0.5rem" }}>
            Storage Cost
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.25rem" }}>
            {toCurrency(storageCost, currency)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#525252" }}>
            {totalCost > 0 ? ((storageCost / totalCost) * 100).toFixed(1) : 0}% of total
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginTop: "2rem",
        }}
      >
        {/* Donut Chart - Primary aggregation */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "4px", border: "1px solid #e0e0e0" }}>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>Cost by {primaryLabel}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={primaryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {primaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => toCurrency(value, currency)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: "1rem" }}>
            {primaryData.map((item, idx) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: idx < primaryData.length - 1 ? "1px solid #e0e0e0" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      background: COLORS[idx % COLORS.length],
                      borderRadius: "2px",
                    }}
                  />
                  <span style={{ fontSize: "0.875rem" }}>{item.name}</span>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                    {toCurrency(item.value, currency)}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#525252" }}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Secondary aggregation */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "4px", border: "1px solid #e0e0e0" }}>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>Cost by {secondaryLabel}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={secondaryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => toCurrency(value, currency)}
                contentStyle={{ background: "#fff", border: "1px solid #e0e0e0" }}
              />
              <Bar dataKey="value" fill="#0f62fe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AssetsChart;
