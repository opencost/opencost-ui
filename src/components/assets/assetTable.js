import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@carbon/react";
import { toCurrency } from "../../util";
import { typeColors } from "./tokens";

function utilizationColor(pct) {
  const v = parseFloat(pct);
  if (v < 30) return "#f44336";
  if (v < 70) return "#ff9800";
  return "#4caf50";
}
function utilizationLabel(pct) {
  const v = parseFloat(pct);
  if (v < 30) return "Low - consider right-sizing";
  if (v < 70) return "Moderate";
  return "Healthy";
}

const columns = [
  { id: "name", label: "Name", sortable: true, minWidth: 200 },
  { id: "type", label: "Type", sortable: true, minWidth: 80 },
  { id: "provider", label: "Provider", sortable: true, minWidth: 60 },
  { id: "cluster", label: "Cluster", sortable: true, minWidth: 100 },
  { id: "category", label: "Category", sortable: true, minWidth: 80 },
  { id: "cpuCost", label: "CPU", sortable: true, minWidth: 80, numeric: true },
  { id: "ramCost", label: "RAM", sortable: true, minWidth: 80, numeric: true },
  { id: "gpuCost", label: "GPU", sortable: true, minWidth: 80, numeric: true },
  { id: "adjustment", label: "Adjust.", sortable: true, minWidth: 80, numeric: true },
  { id: "totalCost", label: "Total Cost", sortable: true, minWidth: 100, numeric: true },
  { id: "utilization", label: "Utilization", sortable: false, minWidth: 120 },
  { id: "details", label: "", sortable: false, minWidth: 40 },
];

function getUtilization(asset) {
  if (asset.type === "Node" && asset.cpuBreakdown) {
    return ((1 - (asset.cpuBreakdown.idle || 0)) * 100).toFixed(0);
  }
  if (asset.type === "Disk" && asset.breakdown) {
    return ((1 - (asset.breakdown.idle || 0)) * 100).toFixed(0);
  }
  return null;
}

const AssetTable = ({ assets, currency, onSelectAsset, sortBy, sortDirection, onSort }) => {
  const handleSort = (column) => {
    if (column.sortable && onSort) {
      const isAsc = sortBy === column.id && sortDirection === "asc";
      onSort(column.id, isAsc ? "desc" : "asc");
    }
  };

  const renderHeaderLabel = (col) => {
    if (col.id !== sortBy) return col.label;
    return `${col.label} (${sortDirection})`;
  };

  const renderUtilizationBar = (utilPct) => {
    if (utilPct === null) return "-";
    const color = utilizationColor(utilPct);
    const pct = Math.min(parseFloat(utilPct), 100);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 70, height: 6, backgroundColor: "#e0e0e0", borderRadius: 3 }}>
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              backgroundColor: color,
              borderRadius: 3,
            }}
          />
        </div>
        <span style={{ fontSize: "0.75rem", minWidth: 32, fontWeight: 600, color }}>{utilPct}%</span>
      </div>
    );
  };

  return (
    <TableContainer>
      <Table size="sm" useZebraStyles>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableHeader
                key={col.id}
                onClick={() => handleSort(col)}
                style={{
                  minWidth: col.minWidth,
                  whiteSpace: "nowrap",
                  cursor: col.sortable ? "pointer" : "default",
                  textAlign: col.numeric ? "right" : "left",
                }}
              >
                {col.sortable ? renderHeaderLabel(col) : col.label}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((asset, idx) => {
            const utilPct = getUtilization(asset);
            return (
              <TableRow
                key={asset.key || idx}
                onClick={() => onSelectAsset && onSelectAsset(asset)}
                style={{ cursor: "pointer" }}
              >
                <TableCell style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span title={asset.properties?.name || asset.key || ""}>
                    {asset.properties?.name || asset.key || "Unknown"}
                  </span>
                </TableCell>
                <TableCell>
                  <Tag type="blue" style={{ backgroundColor: typeColors[asset.type] || "#607D8B", color: "#fff" }}>
                    {asset.type}
                  </Tag>
                </TableCell>
                <TableCell>{asset.properties?.provider || "-"}</TableCell>
                <TableCell>{asset.properties?.cluster || "-"}</TableCell>
                <TableCell>{asset.properties?.category || "-"}</TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  {asset.cpuCost != null && asset.cpuCost > 0
                    ? toCurrency(asset.cpuCost, currency)
                    : "-"}
                </TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  {asset.ramCost != null && asset.ramCost > 0
                    ? toCurrency(asset.ramCost, currency)
                    : "-"}
                </TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  {asset.gpuCost != null && asset.gpuCost > 0
                    ? toCurrency(asset.gpuCost, currency)
                    : "-"}
                </TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  {asset.adjustment != null && asset.adjustment !== 0 ? (
                    <span
                      title={`${asset.adjustment < 0 ? "Discount" : "Surcharge"}: ${toCurrency(asset.adjustment, currency)} | ${Math.abs((asset.adjustment / (asset.totalCost || 1)) * 100).toFixed(1)}% of total cost`}
                      style={{ color: asset.adjustment < 0 ? "#2e7d32" : "#d32f2f", fontWeight: 600 }}
                    >
                      {toCurrency(asset.adjustment, currency)}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: 700 }}>
                  {toCurrency(asset.totalCost || 0, currency)}
                </TableCell>
                <TableCell title={utilPct !== null ? utilizationLabel(utilPct) : ""}>
                  {renderUtilizationBar(utilPct)}
                </TableCell>
                <TableCell>
                  <Button
                    kind="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAsset && onSelectAsset(asset);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssetTable;
