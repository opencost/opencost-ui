import React from "react";
import {
  SkeletonText,
  SkeletonPlaceholder,
  Tile,
} from "@carbon/react";

interface PageSkeletonProps {
  type?: "table" | "chart" | "dashboard";
  rows?: number;
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({ type = "dashboard", rows = 5 }) => {
  if (type === "table") {
    return (
      <Tile>
        <div style={{ padding: "1rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <SkeletonText heading width="30%" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonText key={i} paragraph lineCount={1} width="100%" />
            ))}
          </div>
        </div>
      </Tile>
    );
  }

  if (type === "chart") {
    return (
      <Tile>
        <div style={{ padding: "1rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <SkeletonText heading width="40%" />
          </div>
          <SkeletonPlaceholder style={{ width: "100%", height: "300px" }} />
        </div>
      </Tile>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Tile key={i}>
            <div style={{ padding: "1rem" }}>
              <div style={{ marginBottom: "0.5rem" }}>
                <SkeletonText heading width="60%" />
              </div>
              <SkeletonText width="40%" />
            </div>
          </Tile>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Tile>
        <div style={{ padding: "1rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <SkeletonText heading width="30%" />
          </div>
          <SkeletonPlaceholder style={{ width: "100%", height: "350px" }} />
        </div>
      </Tile>

      {/* Table Skeleton */}
      <Tile>
        <div style={{ padding: "1rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <SkeletonText heading width="25%" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonText key={i} paragraph lineCount={1} width="100%" />
            ))}
          </div>
        </div>
      </Tile>
    </div>
  );
};

export default PageSkeleton;
