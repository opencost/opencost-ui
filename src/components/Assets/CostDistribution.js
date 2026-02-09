import { Tile, Grid, Column, ProgressBar } from "@carbon/react";
import { DonutChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";

export default function AssetCostDistribution({ assets, categorized }) {
  const totalCost = assets.reduce((sum, a) => sum + a.totalCost, 0);
  
  const donutData = assets
    .sort((a, b) => Number(b.totalCost ?? 0) - Number(a.totalCost ?? 0))
    .map(asset => ({
      group: asset.type,
      value: Number(asset.totalCost ?? 0)
    }));

  const donutOptions = {
    title: "Cost by Asset Type",
    resizable: true,
    donut: {
      center: {
        label: "Total Cost"
      }
    },
    height: "400px",
    theme: "g10",
    legend: {
      alignment: "center"
    }
  };

  return (
    <Tile style={{ padding: 24 }}>
      <h4 style={{ marginBottom: 24 }}>Cost Distribution</h4>

      <Grid narrow>
        <Column sm={4} md={8} lg={8}>
          <DonutChart data={donutData} options={donutOptions} />
        </Column>

        <Column sm={4} md={8} lg={8}>
          <h5 style={{ marginBottom: 20 }}>By Category</h5>
          {Object.entries(categorized)
            .sort(([, a], [, b]) => b - a)
            .map(([category, cost]) => {
              const percent = (cost / totalCost) * 100;
              return (
                <div key={category} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>{category}</span>
                    <span style={{ fontWeight: 600 }}>
                      ${cost.toFixed(2)} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <ProgressBar value={percent} max={100} size="big" />
                </div>
              );
            })}
        </Column>
      </Grid>
    </Tile>
  );
}