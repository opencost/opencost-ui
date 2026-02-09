import React from "react";
import { Tile, Heading } from "@carbon/react";

const trendConfig = {
  success: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  error: { bg: "#ffebee", color: "#c62828", border: "#ef9a9a" },
  warning: { bg: "#fff8e1", color: "#e65100", border: "#ffe082" },
  default: { bg: "#f5f5f5", color: "#616161", border: "#e0e0e0" },
};

const SummaryCard = ({ label, value, secondary, icon, trend, accent, highlight }) => {
  const strip = accent || highlight || "#1976d2";
  const tc = trend ? trendConfig[trend.color] || trendConfig.default : null;

  return (
    <Tile
      style={{
        position: "relative",
        borderRadius: "8px",
        border: "1px solid #e4e7ec",
        backgroundColor: "#fff",
        overflow: "hidden",
        minHeight: 110,
        display: "flex",
        flexDirection: "column",
        padding: 0,
      }}
    >
      <div style={{ height: 3, background: strip, flexShrink: 0 }} />

      <div style={{ padding: "14px 16px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontSize: "0.62rem",
              fontWeight: 600,
              color: "#667085",
              margin: 0,
            }}
          >
            {label}
          </p>
          {icon ? <span style={{ color: strip, opacity: 0.7, display: "inline-flex" }}>{icon}</span> : null}
        </div>

        <Heading
          style={{
            fontWeight: 700,
            color: "#101828",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.15,
            fontSize: "1.1rem",
          }}
          title={typeof value === "string" ? value : String(value)}
        >
          {value}
        </Heading>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 6, gap: 8 }}>
          {secondary ? (
            <p style={{ color: "#667085", fontSize: "0.68rem", lineHeight: 1.3, minWidth: 0, margin: 0 }}>
              {secondary}
            </p>
          ) : <span />}

          {tc && trend && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px",
                borderRadius: 10,
                backgroundColor: tc.bg,
                border: `1px solid ${tc.border}`,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "0.58rem", fontWeight: 600, color: tc.color, whiteSpace: "nowrap" }}>
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </Tile>
  );
};

export default React.memo(SummaryCard);
