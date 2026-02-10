import React, { useMemo, useState } from "react";
import {
  Row,
  Column,
  Tile,
  Toggle,
  OverflowMenu,
  OverflowMenuItem,
  SkeletonText,
} from "@carbon/react";
import {
  DonutChart,
  SimpleBarChart,
  StackedBarChart,
} from "@carbon/charts-react";
import { parseAssetsDataForCharts } from "../../util/assetChartsData";
import "@carbon/charts/styles.css";
import "./AssetChartsRow.scss";

const COLORS = {
  Compute: "#0f62fe",
  Management: "#8a3ffc",
  Storage: "#33b1ff",
  Network: "#007d79",
  Node: "#0f62fe",
  ClusterManagement: "#8a3ffc",
  Disk: "#33b1ff",
  LoadBalancer: "#007d79",
  Utilized: "#0f62fe",
  Wasted: "#ff832b",
};

function buildColorScale(items, key = "group") {
  return items.reduce((acc, item) => {
    if (!acc[item[key]]) acc[item[key]] = COLORS[item[key]] || "#0f62fe";
    return acc;
  }, {});
}

const AssetChartsRow = ({ assetsData, currency = "USD", loading = false }) => {
  const [showPercentage, setShowPercentage] = useState(false);

  const chartData = useMemo(
    () => parseAssetsDataForCharts(assetsData || {}),
    [assetsData]
  );

  const exportCsv = (name, rows, headers) => {
    const line = (row) => headers.map((h) => row[h] ?? "").join(",");
    const csv = [headers.join(","), ...rows.map(line)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const baseOptions = {
    resizable: true,
    height: "280px",
    toolbar: { enabled: true },
    tooltip: {
      valueFormatter: (v) => `${currency} ${Number(v).toFixed(2)}`,
    },
  };

  if (loading) {
    return (
      <div className="asset-charts-row">
        <Row className="asset-charts-row__grid">
          {[1, 2, 3, 4].map((i) => (
            <Column key={i} lg={4} md={4} sm={4}>
              <Tile className="asset-charts-row__tile">
                <SkeletonText heading width="60%" />
                <SkeletonText paragraph lineCount={4} />
              </Tile>
            </Column>
          ))}
        </Row>
      </div>
    );
  }

  const hasDistribution = chartData.costDistribution.length > 0;
  const hasByType = chartData.costByAssetType.length > 0;
  const hasByProvider = chartData.costByProvider.length > 0;
  const hasUtilization = chartData.utilizationWastage.length > 0;

  const distOptions = {
    ...baseOptions,
    title: "Cost Distribution by Category",
    donut: {
      center: {
        label: "Total",
        number: chartData.totalCost,
        numberFormatter: (v) => `${currency} ${Number(v).toFixed(2)}`,
      },
      alignment: "center",
    },
    legend: { position: "bottom", clickable: true },
    color: { scale: buildColorScale(chartData.costDistribution) },
  };

  const typeOptions = {
    ...baseOptions,
    title: "Cost by Asset Type",
    donut: {
      center: {
        label: "Total",
        number: chartData.totalCost,
        numberFormatter: (v) => `${currency} ${Number(v).toFixed(0)}`,
      },
      alignment: "center",
    },
    legend: { position: "bottom", clickable: true },
    color: { scale: buildColorScale(chartData.costByAssetType) },
  };

  const providerOptions = {
    ...baseOptions,
    title: "Cost by Provider",
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
    legend: { enabled: false },
    color: { scale: buildColorScale(chartData.costByProvider) },
    bars: { maxWidth: 80 },
  };

  const utilizationOptions = {
    ...baseOptions,
    title: "Utilization vs Wastage (top types)",
    axes: {
      left: { mapsTo: "group", scaleType: "labels" },
      bottom: {
        mapsTo: "value",
        title: showPercentage ? "Percentage (%)" : `Cost (${currency})`,
        stacked: true,
        percentage: showPercentage,
      },
    },
    legend: { position: "bottom", clickable: true },
    color: { scale: { Utilized: COLORS.Utilized, Wasted: COLORS.Wasted } },
    bars: { maxWidth: 48 },
  };

  return (
    <div className="asset-charts-row">
      <Row className="asset-charts-row__grid">
        {/* 1. Cost Distribution - 25% */}
        <Column lg={4} md={4} sm={4}>
          <Tile className="asset-charts-row__tile">
            <div className="asset-charts-row__tile-actions">
              <OverflowMenu size="sm" flipped>
                <OverflowMenuItem
                  itemText="Export CSV"
                  onClick={() =>
                    exportCsv(
                      "cost-distribution",
                      chartData.costDistribution,
                      ["group", "value", "percentage"]
                    )
                  }
                />
              </OverflowMenu>
            </div>
            <div className="asset-charts-row__chart">
              {hasDistribution ? (
                <DonutChart
                  data={chartData.costDistribution}
                  options={distOptions}
                />
              ) : (
                <div className="asset-charts-row__empty">No cost data</div>
              )}
            </div>
          </Tile>
        </Column>

        {/* 2. Cost by Asset Type - 25% */}
        <Column lg={4} md={4} sm={4}>
          <Tile className="asset-charts-row__tile">
            <div className="asset-charts-row__tile-actions">
              <OverflowMenu size="sm" flipped>
                <OverflowMenuItem
                  itemText="Export CSV"
                  onClick={() =>
                    exportCsv(
                      "cost-by-asset-type",
                      chartData.costByAssetType,
                      ["group", "value", "count"]
                    )
                  }
                />
              </OverflowMenu>
            </div>
            <div className="asset-charts-row__chart">
              {hasByType ? (
                <DonutChart
                  data={chartData.costByAssetType}
                  options={typeOptions}
                />
              ) : (
                <div className="asset-charts-row__empty">No asset type data</div>
              )}
            </div>
          </Tile>
        </Column>

        {/* 3. Cost by Provider - 25% */}
        <Column lg={4} md={4} sm={4}>
          <Tile className="asset-charts-row__tile">
            <div className="asset-charts-row__tile-actions">
              <OverflowMenu size="sm" flipped>
                <OverflowMenuItem
                  itemText="Export CSV"
                  onClick={() =>
                    exportCsv(
                      "cost-by-provider",
                      chartData.costByProvider,
                      ["group", "value", "percentage"]
                    )
                  }
                />
              </OverflowMenu>
            </div>
            <div className="asset-charts-row__chart">
              {hasByProvider ? (
                <SimpleBarChart
                  data={chartData.costByProvider}
                  options={providerOptions}
                />
              ) : (
                <div className="asset-charts-row__empty">No provider data</div>
              )}
            </div>
          </Tile>
        </Column>

        {/* 4. Utilization vs Wastage - 25% */}
        <Column lg={4} md={4} sm={4}>
          <Tile className="asset-charts-row__tile">
            <div className="asset-charts-row__tile-header">
              <Toggle
                id="asset-charts-percent-toggle"
                size="sm"
                labelText="Show %"
                toggled={showPercentage}
                onToggle={(_, toggled) => setShowPercentage(toggled)}
              />
              <OverflowMenu size="sm" flipped>
                <OverflowMenuItem
                  itemText="Export CSV"
                  onClick={() =>
                    exportCsv(
                      "utilization-wastage",
                      chartData.utilizationWastage,
                      ["group", "key", "value"]
                    )
                  }
                />
              </OverflowMenu>
            </div>
            <div className="asset-charts-row__chart">
              {hasUtilization ? (
                <StackedBarChart
                  data={chartData.utilizationWastage}
                  options={utilizationOptions}
                />
              ) : (
                <div className="asset-charts-row__empty">
                  No utilization data
                </div>
              )}
            </div>
          </Tile>
        </Column>
      </Row>
    </div>
  );
};

export default React.memo(AssetChartsRow);
