import { Grid, Column, Tag } from "@carbon/react";
import { ProgressBar } from "@carbon/react";

function AssetBreakdownBar({ label, value }) {
  const percent = value > 1 ? value : value * 100;
  
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ textTransform: "capitalize", fontSize: 14 }}>
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>
          {percent.toFixed(1)}%
        </span>
      </div>
      <ProgressBar value={percent} max={100} size="small" />
    </div>
  );
}
export default function AssetDetailsPanel({ asset }) {
  if (!asset) return null;
  
  const totalCost = Number(asset.totalCost ?? 0);
  const adjustment = Number(asset.adjustment ?? 0);
  
  return (
    <div style={{ padding: 24 }}>
      <h5 style={{ marginBottom: 16 }}>
        {asset.type} Details - {asset.properties?.cluster || 'Unknown Cluster'}
      </h5>

      {/* CPU and RAM Utilization Side by Side */}
      {(asset.cpuBreakdown || asset.ramBreakdown) && (
        <Grid narrow style={{ marginBottom: 24 }}>
          {asset.cpuBreakdown && (
            <Column sm={4} md={8} lg={8}>
              <div style={{ 
                padding: 16, 
                background: "#f4f4f4", 
                borderRadius: 4,
                height: "100%" 
              }}>
                <h6 style={{ marginBottom: 12 }}>CPU Utilization</h6>
                {Object.entries(asset.cpuBreakdown).map(([key, value]) => (
                  <AssetBreakdownBar key={key} label={key} value={value} />
                ))}
              </div>
            </Column>
          )}

          {asset.ramBreakdown && (
            <Column sm={4} md={8} lg={8}>
              <div style={{ 
                padding: 16, 
                background: "#f4f4f4", 
                borderRadius: 4,
                height: "100%" 
              }}>
                <h6 style={{ marginBottom: 12 }}>RAM Utilization</h6>
                {Object.entries(asset.ramBreakdown).map(([key, value]) => (
                  <AssetBreakdownBar key={key} label={key} value={value} />
                ))}
              </div>
            </Column>
          )}
        </Grid>
      )}

      {/* Generic Breakdown (Disk, etc.) */}
      {asset.breakdown && !asset.cpuBreakdown && (
        <div style={{ marginBottom: 24 }}>
          <h6 style={{ marginBottom: 12 }}>Usage Breakdown</h6>
          {Object.entries(asset.breakdown).map(([key, value]) => (
            <AssetBreakdownBar key={key} label={key} value={value} />
          ))}
        </div>
      )}

      {/* Cost Breakdown */}
      <div style={{ padding: 16, background: "#e0e0e0", borderRadius: 4, marginBottom: 16 }}>
        <h6 style={{ marginBottom: 12 }}>Cost Breakdown</h6>
        <div style={{ fontSize: 14 }}>
          {asset.cpuCost > 0 && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: "#525252" }}>CPU Cost:</span>{" "}
              <span style={{ fontWeight: 600 }}>${asset.cpuCost.toFixed(2)}</span>
            </div>
          )}
          {asset.ramCost > 0 && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: "#525252" }}>RAM Cost:</span>{" "}
              <span style={{ fontWeight: 600 }}>${asset.ramCost.toFixed(2)}</span>
            </div>
          )}
          {asset.gpuCost > 0 && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: "#525252" }}>GPU Cost:</span>{" "}
              <span style={{ fontWeight: 600 }}>${asset.gpuCost.toFixed(2)}</span>
            </div>
          )}
          {adjustment !== 0 && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: "#525252" }}>Adjustment:</span>{" "}
              <span style={{ fontWeight: 600, color: adjustment < 0 ? "#24a148" : "#da1e28" }}>
                ${adjustment.toFixed(2)}
              </span>
            </div>
          )}
          <div style={{ 
            marginTop: 12, 
            paddingTop: 12, 
            borderTop: "1px solid #8d8d8d",
            fontWeight: 600,
            fontSize: 16
          }}>
            Total: ${totalCost.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Resource Specs */}
      {(asset.cpuCores || asset.ramBytes) && (
        <div style={{ padding: 16, background: "#f4f4f4", borderRadius: 4, marginBottom: 16 }}>
          <h6 style={{ marginBottom: 8 }}>Resource Specifications</h6>
          <div style={{ fontSize: 14, color: "#525252" }}>
            {asset.cpuCores && <div>CPU Cores: {asset.cpuCores}</div>}
            {asset.ramBytes && (
              <div>RAM: {(asset.ramBytes / (1024 ** 3)).toFixed(2)} GB</div>
            )}
            {asset.gpuCount > 0 && <div>GPU Count: {asset.gpuCount}</div>}
          </div>
        </div>
      )}

      {/* Labels */}
      {asset.labels && Object.keys(asset.labels).length > 0 && (
        <div>
          <h6 style={{ marginBottom: 8 }}>Labels</h6>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(asset.labels)
              .slice(0, 10)
              .map(([key, value]) => (
                <Tag key={key} type="gray" size="sm">
                  {key}: {value}
                </Tag>
              ))}
            {Object.keys(asset.labels).length > 10 && (
              <Tag type="outline" size="sm">
                +{Object.keys(asset.labels).length - 10} more
              </Tag>
            )}
          </div>
        </div>
      )}
    </div>
  );
}