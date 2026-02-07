import React from "react";
import { Modal, Grid, Column, Tag, StructuredListWrapper, StructuredListBody, StructuredListRow, StructuredListCell } from "@carbon/react";
import { formatBytes, formatMinutes } from "./tokens";
import { toCurrency } from "../../util";
import { ASSET_COLORS } from "../../constants/colors";

const AssetDetailModal = ({ open, onClose, asset, currency = "USD" }) => {
  if (!asset) return null;

  const assetColor = ASSET_COLORS[asset.type] || "#0f62fe";
  const hasAdjustment = asset.adjustment !== undefined && asset.adjustment !== 0;
  const adjustmentColor = asset.adjustment > 0 ? "#24a148" : "#da1e28";
  const adjustmentLabel = asset.adjustment > 0 ? "Additional Charges" : "Cost Savings";
  const finalCost = asset.totalCost + (asset.adjustment || 0);

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading={
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span>Asset Details: {asset.name}</span>
          <Tag type="blue" size="md">{asset.type}</Tag>
        </div>
      }
      primaryButtonText="Close"
      onRequestSubmit={onClose}
      size="lg"
    >
      <Grid narrow style={{ paddingLeft: 0, paddingRight: 0 }}>
        {/* Professional Cost Summary Section */}
        <Column lg={16}>
          <div style={{
            padding: "1rem",
            backgroundColor: "#f4f4f4",
            borderRadius: "4px",
            marginBottom: "2rem",
            borderLeft: `4px solid ${assetColor}`
          }}>
            <Grid narrow>
              <Column lg={5}>
                <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Base Cost</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: assetColor }}>
                  {toCurrency(asset.totalCost, currency)}
                </p>
              </Column>
              
              {hasAdjustment && (
                <Column lg={5}>
                  <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {adjustmentLabel}
                  </p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: adjustmentColor }}>
                    {asset.adjustment > 0 ? "+" : ""}{toCurrency(asset.adjustment, currency)}
                  </p>
                </Column>
              )}
              
              <Column lg={6}>
                <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Final Cost</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#161616" }}>
                  {toCurrency(finalCost, currency)}
                </p>
              </Column>
            </Grid>
          </div>
        </Column>

        {/* Core Metrics Grid */}
        <Column lg={16}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
            padding: "1rem",
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px"
          }}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Provider</p>
              <p style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{asset.providerID || "N/A"}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cluster</p>
              <p style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{asset.cluster || "N/A"}</p>
            </div>
            {asset.minutes && (
              <div>
                <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Duration</p>
                <p style={{ fontSize: "1.rem", fontWeight: 600, margin: 0 }}>{formatMinutes(asset.minutes)}</p>
              </div>
            )}
          </div>
        </Column>

        {/* Properties with Professional Layout */}
        <Column lg={16}>
          <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1rem", fontWeight: 600 }}>Asset Properties</h4>
          <StructuredListWrapper style={{ marginBottom: "2rem" }}>
            <StructuredListBody>
              {asset.properties &&
                Object.entries(asset.properties).map(([key, value]) => (
                  <StructuredListRow key={key}>
                    <StructuredListCell style={{ fontWeight: 600, textTransform: "capitalize", color: "#161616" }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </StructuredListCell>
                    <StructuredListCell style={{ color: "#525252" }}>{value}</StructuredListCell>
                  </StructuredListRow>
                ))}
            </StructuredListBody>
          </StructuredListWrapper>
        </Column>

        {/* Labels with Visual Tags */}
        {asset.labels && Object.keys(asset.labels).length > 0 && (
          <Column lg={16}>
            <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1rem", fontWeight: 600 }}>Labels & Metadata</h4>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              {Object.entries(asset.labels).map(([key, value]) => (
                <Tag key={key} type="gray" size="md">
                  <strong>{key}:</strong> {value}
                </Tag>
              ))}
            </div>
          </Column>
        )}

        {/* Node Resource Breakdown with Visual Indicators */}
        {asset.type === "Node" && (
          <Column lg={16}>
            <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1rem", fontWeight: 600 }}>
              Resource Utilization Breakdown
            </h4>
            <div style={{ padding: "1rem", backgroundColor: "#f4f4f4", borderRadius: "4px", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#525252", margin: 0 }}>
                Detailed breakdown of CPU and RAM costs showing used, idle, and system allocations
              </p>
            </div>
            
            {/* CPU Breakdown */}
            <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #e0e0e0", borderRadius: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h5 style={{ margin: 0, fontWeight: 600 }}>
                  CPU Resources ({asset.cpuCores} cores)
                </h5>
                <span style={{ fontWeight: 700, fontSize: "1.125rem", color: assetColor }}>
                  {toCurrency(asset.cpuCost, currency)}
                </span>
              </div>
              {asset.cpuBreakdown && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ padding: "0.75rem", backgroundColor: "#24a14810", borderRadius: "4px", borderLeft: "3px solid #24a148" }}>
                    <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem" }}>Used</p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0, color: "#24a148" }}>
                      {toCurrency(asset.cpuBreakdown.used, currency)}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#525252", margin: 0, marginTop: "0.25rem" }}>
                      {((asset.cpuBreakdown.used / asset.cpuCost) * 100).toFixed(1)}% utilized
                    </p>
                  </div>
                  <div style={{ padding: "0.75rem", backgroundColor: "#ff990010", borderRadius: "4px", borderLeft: "3px solid #ff9900" }}>
                    <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem" }}>Idle</p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0, color: "#ff9900" }}>
                      {toCurrency(asset.cpuBreakdown.idle, currency)}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#525252", margin: 0, marginTop: "0.25rem" }}>
                      {((asset.cpuBreakdown.idle / asset.cpuCost) * 100).toFixed(1)}% idle
                    </p>
                  </div>
                  <div style={{ padding: "0.75rem", backgroundColor: "#0f62fe10", borderRadius: "4px", borderLeft: "3px solid #0f62fe" }}>
                    <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem" }}>System</p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0, color: "#0f62fe" }}>
                      {toCurrency(asset.cpuBreakdown.system, currency)}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#525252", margin: 0, marginTop: "0.25rem" }}>
                      {((asset.cpuBreakdown.system / asset.cpuCost) * 100).toFixed(1)}% system
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RAM Breakdown */}
            <div style={{ padding: "1rem", border: "1px solid #e0e0e0", borderRadius: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h5 style={{ margin: 0, fontWeight: 600 }}>
                  RAM Resources ({formatBytes(asset.ramBytes)})
                </h5>
                <span style={{ fontWeight: 700, fontSize: "1.125rem", color: assetColor }}>
                  {toCurrency(asset.ramCost, currency)}
                </span>
              </div>
              {asset.ramBreakdown && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ padding: "0.75rem", backgroundColor: "#24a14810", borderRadius: "4px", borderLeft: "3px solid #24a148" }}>
                    <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem" }}>Used</p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0, color: "#24a148" }}>
                      {toCurrency(asset.ramBreakdown.used, currency)}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#525252", margin: 0, marginTop: "0.25rem" }}>
                      {((asset.ramBreakdown.used / asset.ramCost) * 100).toFixed(1)}% utilized
                    </p>
                  </div>
                  <div style={{ padding: "0.75rem", backgroundColor: "#ff990010", borderRadius: "4px", borderLeft: "3px solid #ff9900" }}>
                    <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem" }}>Idle</p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0, color: "#ff9900" }}>
                      {toCurrency(asset.ramBreakdown.idle, currency)}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#525252", margin: 0, marginTop: "0.25rem" }}>
                      {((asset.ramBreakdown.idle / asset.ramCost) * 100).toFixed(1)}% idle
                    </p>
                  </div>
                  <div style={{ padding: "0.75rem", backgroundColor: "#0f62fe10", borderRadius: "4px", borderLeft: "3px solid #0f62fe" }}>
                    <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem" }}>System</p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0, color: "#0f62fe" }}>
                      {toCurrency(asset.ramBreakdown.system, currency)}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#525252", margin: 0, marginTop: "0.25rem" }}>
                      {((asset.ramBreakdown.system / asset.ramCost) * 100).toFixed(1)}% system
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Column>
        )}

        {/* Disk Storage Information */}
        {asset.type === "Disk" && asset.bytes && (
          <Column lg={16}>
            <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1rem", fontWeight: 600 }}>
              Storage Details
            </h4>
            <div style={{ padding: "1rem", backgroundColor: "#f4f4f4", borderRadius: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem" }}>Disk Size</p>
                  <p style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>{formatBytes(asset.bytes)}</p>
                </div>
                {asset.byteHours && (
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#525252", marginTop: 0, marginBottom: "0.25rem" }}>Byte Hours</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>{formatBytes(asset.byteHours)}</p>
                  </div>
                )}
              </div>
            </div>
          </Column>
        )}
      </Grid>
    </Modal>
  );
};

export default AssetDetailModal;
