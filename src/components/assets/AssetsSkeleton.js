import React from "react";
import { DataTableSkeleton } from "@carbon/react";

const AssetsSkeleton = () => {
  return (
    <div className="assets-skeleton">
      <div
        className="assets-summary-grid"
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "32px",
          justifyContent: "space-between",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "100px",
              backgroundColor: "#e0e0e0",
              borderRadius: "8px",
              animation: "pulse 1.5s infinite ease-in-out",
            }}
          />
        ))}
      </div>

      <div
        className="assets-cost-section"
        style={{
          height: "350px",
          backgroundColor: "#ffffff",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "#f4f4f4",
            animation: "pulse 1.5s infinite ease-in-out",
          }}
        />
      </div>

      <div style={{ marginTop: "32px" }}>
        <DataTableSkeleton
          columnCount={7}
          rowCount={10}
          headers={[
            "Name",
            "Type",
            "Provider",
            "Cluster",
            "CPU Cores",
            "RAM",
            "Total Cost",
          ]}
        />
      </div>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 0.8; }
            100% { opacity: 0.6; }
          }
        `}
      </style>
    </div>
  );
};

export default AssetsSkeleton;
