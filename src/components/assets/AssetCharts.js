import * as React from "react";
import { Grid, Column } from "@carbon/react";
import { DonutChart, SimpleBarChart } from "@carbon/charts-react";

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
 * AssetDonutChart - Donut chart showing cost distribution by asset type
 * Professional visualization with formatted tooltips and total cost display
 */
const AssetDonutChart = ({ assetsByType, currency }) => {
  const chartData = Object.entries(assetsByType).map(([type, assets]) => {
    const totalCost = assets.reduce(
      (sum, asset) => sum + (asset.totalCost || 0),
      0,
    );
    return {
      group: type,
      value: parseFloat(totalCost.toFixed(2)),
      count: assets.length,
    };
  });

  // Calculate total for center display
  const totalCost = chartData.reduce((sum, item) => sum + item.value, 0);

  const options = {
    title: "Cost Distribution by Asset Type",
    resizable: true,
    legend: {
      alignment: "center",
      position: "bottom",
    },
    donut: {
      center: {
        label: "Total Cost",
        number: totalCost.toFixed(2),
        numberFormatter: (num) => `$${num.toLocaleString()}`,
      },
      alignment: "center",
    },
    height: "400px",
    tooltip: {
      customHTML: (data) => {
        const item = chartData.find((d) => d.group === data[0].group);
        const percentage = ((data[0].value / totalCost) * 100).toFixed(1);
        return `
          <div style="background: white; padding: 12px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <div style="font-weight: 600; margin-bottom: 8px; color: #161616;">${data[0].group}</div>
            <div style="font-size: 0.875rem; color: #525252;">
              <div style="margin-bottom: 4px;">
                <strong>Cost:</strong> $${data[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style="margin-bottom: 4px;">
                <strong>Percentage:</strong> ${percentage}%
              </div>
              <div>
                <strong>Assets:</strong> ${item?.count || 0}
              </div>
            </div>
          </div>
        `;
      },
    },
    color: {
      scale: COLORS,
    },
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <DonutChart data={chartData} options={options} />
      <div style={{ textAlign: "center", marginTop: "1rem", padding: "1rem", backgroundColor: "#f4f4f4", borderRadius: "4px" }}>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#525252" }}>
          Total Cost Across All Asset Types: <strong style={{ color: "#161616", fontSize: "1rem" }}>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </p>
      </div>
    </div>
  );
};

/**
 * AssetProviderChart - Bar chart showing cost comparison across cloud providers
 * Professional visualization with formatted axes and detailed tooltips
 */
const AssetProviderChart = ({ assetsData, currency }) => {
  // Aggregate by provider with detailed metrics
  const providerMetrics = {};

  Object.values(assetsData || {}).forEach((asset) => {
    const provider = asset.properties?.provider || "Unknown";
    if (!providerMetrics[provider]) {
      providerMetrics[provider] = {
        totalCost: 0,
        count: 0,
        adjustment: 0,
      };
    }
    providerMetrics[provider].totalCost += asset.totalCost || 0;
    providerMetrics[provider].count += 1;
    providerMetrics[provider].adjustment += asset.adjustment || 0;
  });

  // Convert to chart format
  const chartData = Object.entries(providerMetrics).map(([provider, metrics]) => ({
    group: provider,
    value: parseFloat(metrics.totalCost.toFixed(2)),
    count: metrics.count,
    adjustment: parseFloat(metrics.adjustment.toFixed(2)),
    avgPerAsset: parseFloat((metrics.totalCost / metrics.count).toFixed(2)),
  }));

  // Sort by cost descending
  chartData.sort((a, b) => b.value - a.value);

  const totalCost = chartData.reduce((sum, item) => sum + item.value, 0);

  const options = {
    title: "Cost by Cloud Provider",
    axes: {
      left: {
        mapsTo: "value",
        title: `Cost (${currency})`,
        scaleType: "linear",
      },
      bottom: {
        mapsTo: "group",
        title: "Provider",
        scaleType: "labels",
      },
    },
    height: "400px",
    resizable: true,
    legend: {
      enabled: false,
    },
    tooltip: {
      customHTML: (data) => {
        const item = chartData.find((d) => d.group === data[0].group);
        const percentage = ((data[0].value / totalCost) * 100).toFixed(1);
        return `
          <div style="background: white; padding: 12px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <div style="font-weight: 600; margin-bottom: 8px; color: #161616;">${data[0].group}</div>
            <div style="font-size: 0.875rem; color: #525252;">
              <div style="margin-bottom: 4px;">
                <strong>Total Cost:</strong> $${data[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style="margin-bottom: 4px;">
                <strong>Percentage:</strong> ${percentage}%
              </div>
              <div style="margin-bottom: 4px;">
                <strong>Assets:</strong> ${item?.count || 0}
              </div>
              <div style="margin-bottom: 4px;">
                <strong>Avg per Asset:</strong> $${item?.avgPerAsset?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
              ${item.adjustment && item.adjustment !== 0 ? `
                <div style="color: ${item.adjustment > 0 ? '#24a148' : '#da1e28'};">
                  <strong>Adjustment:</strong> ${item.adjustment > 0 ? '+' : ''}$${item.adjustment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      },
    },
    color: {
      scale: COLORS,
    },
  };

  return (
    <div>
      <SimpleBarChart data={chartData} options={options} />
      <div style={{ textAlign: "center", marginTop: "1rem", padding: "1rem", backgroundColor: "#f4f4f4", borderRadius: "4px" }}>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#525252" }}>
          Total Provider Costs: <strong style={{ color: "#161616", fontSize: "1rem" }}>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          {" • "}
          Providers: <strong style={{ color: "#161616" }}>{chartData.length}</strong>
        </p>
      </div>
    </div>
  );
};

/**
 * AssetCharts - Main component displaying both donut and bar charts
 */
const AssetCharts = ({ assetsByType, assetsData, currency }) => {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <Grid narrow>
        <Column lg={8} md={8} sm={4}>
          <AssetDonutChart assetsByType={assetsByType} currency={currency} />
        </Column>
        <Column lg={8} md={8} sm={4}>
          <AssetProviderChart assetsData={assetsData} currency={currency} />
        </Column>
      </Grid>
    </div>
  );
};

export default AssetCharts;
