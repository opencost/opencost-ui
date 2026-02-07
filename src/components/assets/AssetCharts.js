import * as React from "react";
import { Box, Paper, Typography } from "@mui/material";
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
} from "recharts";

const COLORS = {
  Node: "#0f62fe",
  Disk: "#8a3ffc",
  Network: "#0072c3",
  LoadBalancer: "#198038",
  Management: "#fa4d56",
  Other: "#878d96",
  AWS: "#FF9900",
  GCP: "#4285F4",
  Azure: "#0078D4",
};

/**
 * AssetDonutChart - Donut chart showing cost by asset type
 */
const AssetDonutChart = ({ assetsByType, currency }) => {
  const data = Object.entries(assetsByType).map(([type, assets]) => {
    const totalCost = assets.reduce(
      (sum, asset) => sum + (asset.totalCost || 0),
      0,
    );
    return {
      name: type,
      value: parseFloat(totalCost.toFixed(2)),
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2">
            <strong>{payload[0].name}</strong>
          </Typography>
          <Typography variant="body2">
            ${payload[0].value.toFixed(2)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={2}
      sx={{ p: 3, borderRadius: "12px", background: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)" }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Cost by Asset Type
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={(entry) => entry.name}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || COLORS.Other}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

/**
 * AssetProviderChart - Bar chart showing cost by provider
 */
const AssetProviderChart = ({ assetsData, currency }) => {
  // Aggregate by provider
  const providerCosts = {};

  Object.values(assetsData || {}).forEach((asset) => {
    const provider = asset.properties?.provider || "Unknown";
    if (!providerCosts[provider]) {
      providerCosts[provider] = 0;
    }
    providerCosts[provider] += asset.totalCost || 0;
  });

  const data = Object.entries(providerCosts).map(([provider, cost]) => ({
    provider,
    cost: parseFloat(cost.toFixed(2)),
  }));

  return (
    <Paper
      elevation={2}
      sx={{ p: 3, borderRadius: "12px", background: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)" }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Cost by Provider
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="provider" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="cost" fill="#0f62fe" name="Total Cost">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.provider] || "#0f62fe"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

/**
 * AssetCharts - Container for donut and bar charts
 */
const AssetCharts = ({ assetsByType, assetsData, currency }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
        mb: 4,
      }}
    >
      <AssetDonutChart assetsByType={assetsByType} currency={currency} />
      <AssetProviderChart assetsData={assetsData} currency={currency} />
    </Box>
  );
};

export default AssetCharts;
