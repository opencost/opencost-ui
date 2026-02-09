import { Tile, InlineNotification } from "@carbon/react";

export default function AssetSavingsPanel({ alerts }) {
  const totalSavings = alerts.reduce((sum, a) => sum + a.savings, 0);

  return (
    <Tile style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h4 style={{ margin: 0 }}>Savings Opportunities</h4>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#0f62fe" }}>
          Potential: ${totalSavings.toFixed(2)}/week
        </div>
      </div>

      {alerts.map((alert, idx) => (
        <InlineNotification
          key={idx}
          kind={alert.severity}
          title={alert.title}
          subtitle={alert.message}
          lowContrast
          hideCloseButton
          style={{ marginBottom: 12, maxWidth: "100%" }}
        />
      ))}
    </Tile>
  );
}