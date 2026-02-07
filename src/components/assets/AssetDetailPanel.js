import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toCurrency } from "../../util";
import { formatCores, formatBytes, formatBreakdown } from "./assetUtils";

const AssetDetailPanel = ({ asset, onClose }) => {
  if (!asset) return null;

  const isNode = asset.type === "Node";
  const isDisk = asset.type === "Disk";

  const cpuBreakdown = isNode ? formatBreakdown(asset.cpuBreakdown) : null;
  const ramBreakdown = isNode ? formatBreakdown(asset.ramBreakdown) : null;
  const diskBreakdown = isDisk ? formatBreakdown(asset.breakdown) : null;

  const breakdownData = [];
  if (cpuBreakdown) {
    breakdownData.push({
      name: "CPU",
      User: cpuBreakdown.user,
      System: cpuBreakdown.system,
      Other: cpuBreakdown.other,
      Idle: cpuBreakdown.idle,
    });
  }
  if (ramBreakdown) {
    breakdownData.push({
      name: "RAM",
      User: ramBreakdown.user,
      System: ramBreakdown.system,
      Other: ramBreakdown.other,
      Idle: ramBreakdown.idle,
    });
  }
  if (diskBreakdown) {
    breakdownData.push({
      name: "Disk",
      User: diskBreakdown.user,
      System: diskBreakdown.system,
      Other: diskBreakdown.other,
      Idle: diskBreakdown.idle,
    });
  }

  const rows = [
    { label: "Type", value: asset.type },
    { label: "Category", value: asset.category },
    { label: "Provider", value: asset.provider },
    { label: "Cluster", value: asset.cluster },
    { label: "Project", value: asset.project },
    { label: "Provider ID", value: asset.providerID },
    { label: "Total Cost", value: toCurrency(asset.totalCost, "USD") },
    {
      label: "Active Duration",
      value: asset.minutes ? `${asset.minutes} min` : undefined,
    },
  ];

  if (isNode) {
    rows.push(
      { label: "Node Type", value: asset.nodeType },
      { label: "CPU Cores", value: formatCores(asset.cpuCores) },
      { label: "RAM", value: formatBytes(asset.ramBytes) },
      { label: "CPU Cost", value: toCurrency(asset.cpuCost || 0, "USD") },
      { label: "RAM Cost", value: toCurrency(asset.ramCost || 0, "USD") },
      { label: "GPU Cost", value: toCurrency(asset.gpuCost || 0, "USD") },
      {
        label: "Preemptible / Spot",
        value: asset.preemptible ? "Yes" : "No",
      },
      {
        label: "Discount",
        value:
          asset.discount !== undefined
            ? `${(asset.discount * 100).toFixed(0)}%`
            : undefined,
      },
    );
  }

  if (isDisk) {
    rows.push(
      { label: "Storage Size", value: formatBytes(asset.bytes) },
      { label: "Storage Class", value: asset.storageClass },
      { label: "Volume Name", value: asset.volumeName },
      { label: "Claim Name", value: asset.claimName },
      { label: "Claim Namespace", value: asset.claimNamespace },
    );
  }

  const hasLabels = asset.labels && Object.keys(asset.labels).length > 0;

  return (
    <div className="assets-modal-overlay" onClick={onClose}>
      <div className="assets-modal" onClick={(e) => e.stopPropagation()}>
        <div className="assets-modal-header">
          <div>
            <div className="assets-modal-label">
              {asset.type} Details
            </div>
            <div className="assets-modal-heading">{asset.name}</div>
          </div>
          <button className="assets-modal-close" onClick={onClose}>
            &#x2715;
          </button>
        </div>
        <div className="assets-modal-body">
          <table className="assets-detail-table">
            <tbody>
              {rows.map(
                (row, i) =>
                  row.value !== undefined &&
                  row.value !== "" && (
                    <tr key={i}>
                      <td>{row.label}</td>
                      <td>{row.value}</td>
                    </tr>
                  ),
              )}
            </tbody>
          </table>

          {breakdownData.length > 0 && (
            <div>
              <div className="assets-detail-section-title">
                Resource Utilization
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={breakdownData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e0e0e0"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="User"
                    stackId="a"
                    fill="#0f62fe"
                    name="User"
                  />
                  <Bar
                    dataKey="System"
                    stackId="a"
                    fill="#6929c4"
                    name="System"
                  />
                  <Bar
                    dataKey="Other"
                    stackId="a"
                    fill="#009d9a"
                    name="Other"
                  />
                  <Bar
                    dataKey="Idle"
                    stackId="a"
                    fill="#d4d4d4"
                    name="Idle"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {hasLabels && (
            <div style={{ marginTop: "1rem" }}>
              <div className="assets-detail-section-title">Labels</div>
              <div className="assets-labels-container">
                {Object.entries(asset.labels).map(([k, v]) => (
                  <span key={k} className="assets-label-tag">
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AssetDetailPanel);
