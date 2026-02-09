import { Tile, Grid, Column } from "@carbon/react";
import { Wallet, Warning, Analytics, Renew } from "@carbon/icons-react";

export default function AssetSummaryCards({ metrics }) {
  const cards = [
    {
      icon: Wallet,
      label: "Total Spend",
      value: `$${metrics.totalCost.toFixed(2)}`,
      subtitle: `${metrics.assetCount} assets`
    },
    {
      icon: Warning,
      label: "Wasted Cost",
      value: `$${metrics.wastedCost.toFixed(2)}`,
      subtitle: "Potential savings"
    },
    {
      icon: Analytics,
      label: "Efficiency",
      value: `${metrics.efficiency.toFixed(1)}%`,
      subtitle: "Resource utilization"
    },
    {
      icon: Renew,
      label: "Adjustments",
      value: `$${metrics.totalAdjustment.toFixed(2)}`,
      subtitle: metrics.totalAdjustment < 0 ? "Savings" : "Additional cost"
    }
  ];

  return (
    <Grid narrow>
      {cards.map((card, idx) => (
        <Column key={idx} sm={4} md={4} lg={4}>
          <Tile style={{ padding: 20, height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <card.icon size={24} />
              <span style={{ fontSize: 14, color: "#525252" }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, marginBottom: 4 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 12, color: "#525252" }}>
              {card.subtitle}
            </div>
          </Tile>
        </Column>
      ))}
    </Grid>
  );
}