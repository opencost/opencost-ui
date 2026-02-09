import React from "react";
import {
  Button,
  ComposedModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StructuredListBody,
  StructuredListCell,
  StructuredListRow,
  StructuredListWrapper,
  Tag,
  Heading,
} from "@carbon/react";
import { toCurrency } from "../../util";

function bytesToReadable(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function hoursToReadable(hours) {
  if (!hours) return "0h";
  if (hours < 1) return `${(hours * 60).toFixed(0)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

const UtilizationBar = ({ label, breakdown }) => {
  if (!breakdown) return null;
  const used = ((1 - (breakdown.idle || 0)) * 100).toFixed(1);
  const system = ((breakdown.system || 0) * 100).toFixed(1);
  const user = ((breakdown.user || 0) * 100).toFixed(1);
  const color = parseFloat(used) < 30 ? "#da1e28" : parseFloat(used) < 70 ? "#f1c21b" : "#24a148";
  const statusLabel = parseFloat(used) < 30 ? "Low - consider right-sizing" : parseFloat(used) < 70 ? "Moderate" : "Healthy";
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{label} Utilization</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color, fontWeight: 700 }}>{used}%</span>
          <span style={{ color: "#6f6f6f", fontSize: "0.75rem" }}>
            ({statusLabel})
          </span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, backgroundColor: "#e0e0e0", overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.min(parseFloat(used), 100)}%`,
            height: "100%",
            backgroundColor: color,
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, color: "#525252", fontSize: "0.75rem" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4589ff" }} /> System: {system}%
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8a3ffc" }} /> User: {user}%
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e0e0e0" }} /> Idle: {((breakdown.idle || 0) * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <StructuredListRow>
    <StructuredListCell style={{ fontWeight: 600 }}>{label}</StructuredListCell>
    <StructuredListCell>{value}</StructuredListCell>
  </StructuredListRow>
);

const AssetDetailModal = ({ open, onClose, asset, currency }) => {
  if (!asset) return null;

  const props = asset.properties || {};
  const labels = asset.labels || {};
  const isNode = asset.type === "Node";
  const isDisk = asset.type === "Disk";

  return (
    <ComposedModal open={open} onClose={onClose} size="md">
      <ModalHeader>
        <Tag type="blue" size="sm">{asset.type}</Tag>
        <Heading style={{ marginTop: "6px", fontWeight: 600 }}>{props.name || asset.key || "Unknown Asset"}</Heading>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 120px", padding: "16px", background: "#f4f4f4", borderBottom: "2px solid #0f62fe", borderRadius: "2px" }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#161616" }}>
              {toCurrency(asset.totalCost || 0, currency)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#525252", fontWeight: 500, marginTop: "4px", textTransform: "uppercase" }}>
              Total Cost
            </div>
          </div>
          
          {asset.adjustment !== undefined && asset.adjustment !== 0 && (
            <div style={{ 
              flex: "1 1 120px", 
              padding: "16px", 
              background: asset.adjustment < 0 ? "#e5f6ff" : "#fff1f1", 
              borderBottom: `2px solid ${asset.adjustment < 0 ? "#0043ce" : "#da1e28"}`,
              borderRadius: "2px" 
            }}>
              <div style={{ 
                fontSize: "1.25rem", 
                fontWeight: 600, 
                color: asset.adjustment < 0 ? "#0043ce" : "#da1e28" 
              }}>
                {toCurrency(asset.adjustment, currency)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#525252", fontWeight: 500, marginTop: "4px", textTransform: "uppercase" }}>
                Adjustment
              </div>
            </div>
          )}

          {asset.minutes > 0 && (
            <div style={{ flex: "1 1 120px", padding: "16px", background: "#f4f4f4", borderBottom: "2px solid #8d8d8d", borderRadius: "2px" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#161616" }}>
                {hoursToReadable(asset.minutes / 60)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#525252", fontWeight: 500, marginTop: "4px", textTransform: "uppercase" }}>
                Active Time
              </div>
            </div>
          )}

          {isNode && asset.discount > 0 && (
            <div style={{ flex: "1 1 120px", padding: "16px", background: "#defbe6", borderBottom: "2px solid #198038", borderRadius: "2px" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#198038" }}>
                {(asset.discount * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "#525252", fontWeight: 500, marginTop: "4px", textTransform: "uppercase" }}>
                Discount
              </div>
            </div>
          )}
        </div>

        <Heading size="sm" style={{ marginBottom: 8 }}>Properties</Heading>
        <StructuredListWrapper isCondensed>
          <StructuredListBody>
            {props.provider && <DetailRow label="Provider" value={props.provider} />}
            {props.cluster && <DetailRow label="Cluster" value={props.cluster} />}
            {props.project && <DetailRow label="Project" value={props.project} />}
            {props.service && <DetailRow label="Service" value={props.service} />}
            {props.category && <DetailRow label="Category" value={props.category} />}
            {props.providerID && (
              <DetailRow label="Provider ID" value={<span style={{ wordBreak: "break-all" }}>{props.providerID}</span>} />
            )}
            <DetailRow
              label="Window"
              value={`${asset.start ? new Date(asset.start).toLocaleString() : "N/A"} - ${asset.end ? new Date(asset.end).toLocaleString() : "N/A"}`}
            />
          </StructuredListBody>
        </StructuredListWrapper>

        {isNode && (
          <>
            <Heading size="sm" style={{ margin: "16px 0 8px" }}>Cost Breakdown</Heading>
            <StructuredListWrapper isCondensed>
              <StructuredListBody>
                <DetailRow label="CPU Cost" value={toCurrency(asset.cpuCost || 0, currency)} />
                <DetailRow label="RAM Cost" value={toCurrency(asset.ramCost || 0, currency)} />
                <DetailRow label="GPU Cost" value={toCurrency(asset.gpuCost || 0, currency)} />
                <DetailRow label="Adjustment" value={toCurrency(asset.adjustment || 0, currency)} />
              </StructuredListBody>
            </StructuredListWrapper>

            <Heading size="sm" style={{ margin: "16px 0 8px" }}>Hardware Specifications</Heading>
            <StructuredListWrapper isCondensed>
              <StructuredListBody>
                {asset.nodeType && <DetailRow label="Instance Type" value={asset.nodeType} />}
                <DetailRow label="CPU Cores" value={asset.cpuCores || 0} />
                <DetailRow label="RAM" value={bytesToReadable(asset.ramBytes)} />
                <DetailRow label="CPU Core-Hours" value={(asset.cpuCoreHours || 0).toFixed(1)} />
                <DetailRow label="RAM Byte-Hours" value={bytesToReadable(asset.ramByteHours)} />
                {asset.gpuCount > 0 && (
                  <>
                    <DetailRow label="GPU Count" value={asset.gpuCount} />
                    <DetailRow label="GPU Hours" value={(asset.GPUHours || 0).toFixed(1)} />
                  </>
                )}
                {asset.preemptible !== undefined && (
                  <DetailRow label="Preemptible" value={asset.preemptible > 0 ? "Yes" : "No"} />
                )}
              </StructuredListBody>
            </StructuredListWrapper>

            <Heading size="sm" style={{ margin: "16px 0 8px" }}>Utilization</Heading>
            <UtilizationBar label="CPU" breakdown={asset.cpuBreakdown} />
            <UtilizationBar label="RAM" breakdown={asset.ramBreakdown} />
          </>
        )}

        {isDisk && (
          <>
            <Heading size="sm" style={{ margin: "16px 0 8px" }}>Disk Details</Heading>
            <StructuredListWrapper isCondensed>
              <StructuredListBody>
                {asset.storageClass && <DetailRow label="Storage Class" value={asset.storageClass} />}
                {asset.claimName && (
                  <DetailRow label="PVC Claim" value={`${asset.claimNamespace}/${asset.claimName}`} />
                )}
                {asset.volumeName && <DetailRow label="Volume" value={asset.volumeName} />}
                <DetailRow label="Total Size" value={bytesToReadable(asset.bytes)} />
                <DetailRow label="Byte-Hours Total" value={bytesToReadable(asset.byteHours)} />
                <DetailRow label="Byte-Hours Used" value={bytesToReadable(asset.byteHoursUsed)} />
              </StructuredListBody>
            </StructuredListWrapper>
            {asset.breakdown && (
              <>
                <Heading size="sm" style={{ margin: "16px 0 8px" }}>Storage Utilization</Heading>
                <UtilizationBar label="Storage" breakdown={asset.breakdown} />
              </>
            )}
          </>
        )}

        {Object.keys(labels).length > 0 && (
          <>
            <Heading size="sm" style={{ margin: "16px 0 8px" }}>Labels</Heading>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(labels).map(([k, v]) => (
                <Tag key={k} type="gray">
                  {k}: {v}
                </Tag>
              ))}
            </div>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="primary" onClick={onClose}>Close</Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default AssetDetailModal;
