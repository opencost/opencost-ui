import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
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
  if (v < 30) return "Low — consider right-sizing";
  if (v < 70) return "Moderate";
  return "Healthy";
}

function bytesToShort(bytes) {
  if (!bytes || bytes === 0) return "-";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
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

  return (
    <TableContainer>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.numeric ? "right" : "left"}
                sx={{
                  fontWeight: "bold",
                  minWidth: col.minWidth,
                  backgroundColor: "#fafafa",
                  whiteSpace: "nowrap",
                }}
              >
                {col.sortable ? (
                  <TableSortLabel
                    active={sortBy === col.id}
                    direction={sortBy === col.id ? sortDirection : "asc"}
                    onClick={() => handleSort(col)}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((asset, idx) => {
            const utilPct = getUtilization(asset);
            return (
              <TableRow
                key={asset.key || idx}
                hover
                sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f0f7ff" } }}
                onClick={() => onSelectAsset && onSelectAsset(asset)}
              >
                <TableCell sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Tooltip title={asset.properties?.name || asset.key || ""}>
                    <span>{asset.properties?.name || asset.key || "Unknown"}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={asset.type}
                    size="small"
                    sx={{
                      backgroundColor: typeColors[asset.type] || "#607D8B",
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: "0.7rem",
                    }}
                  />
                </TableCell>
                <TableCell>{asset.properties?.provider || "-"}</TableCell>
                <TableCell>{asset.properties?.cluster || "-"}</TableCell>
                <TableCell>{asset.properties?.category || "-"}</TableCell>
                <TableCell align="right">
                  {asset.cpuCost != null && asset.cpuCost > 0
                    ? toCurrency(asset.cpuCost, currency)
                    : "-"}
                </TableCell>
                <TableCell align="right">
                  {asset.ramCost != null && asset.ramCost > 0
                    ? toCurrency(asset.ramCost, currency)
                    : "-"}
                </TableCell>
                <TableCell align="right">
                  {asset.gpuCost != null && asset.gpuCost > 0
                    ? toCurrency(asset.gpuCost, currency)
                    : "-"}
                </TableCell>
                <TableCell align="right">
                  {asset.adjustment != null && asset.adjustment !== 0 ? (
                    <Tooltip
                      title={
                        <span>
                          {asset.adjustment < 0 ? "Discount" : "Surcharge"}: {toCurrency(asset.adjustment, currency)}
                          <br />
                          {Math.abs((asset.adjustment / (asset.totalCost || 1)) * 100).toFixed(1)}% of total cost
                        </span>
                      }
                      arrow
                    >
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                        <span style={{ color: asset.adjustment < 0 ? "#2e7d32" : "#d32f2f", fontWeight: 500 }}>
                          {toCurrency(asset.adjustment, currency)}
                        </span>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6rem" }}>
                          {asset.adjustment < 0 ? "disc." : "surch."}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {toCurrency(asset.totalCost || 0, currency)}
                </TableCell>
                <TableCell>
                  {utilPct !== null ? (
                    <Tooltip
                      title={
                        <span>
                          {asset.type === "Node" && asset.cpuBreakdown ? (
                            <>
                              CPU: {((1 - (asset.cpuBreakdown.idle || 0)) * 100).toFixed(1)}%
                              (sys {((asset.cpuBreakdown.system || 0) * 100).toFixed(1)}%,
                              user {((asset.cpuBreakdown.user || 0) * 100).toFixed(1)}%)
                              <br />
                            </>
                          ) : null}
                          {asset.ramBreakdown ? (
                            <>
                              RAM: {((1 - (asset.ramBreakdown.idle || 0)) * 100).toFixed(1)}%
                              <br />
                            </>
                          ) : null}
                          {utilizationLabel(utilPct)}
                        </span>
                      }
                      arrow
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(parseFloat(utilPct), 100)}
                          sx={{
                            width: 60,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: utilizationColor(utilPct),
                            },
                          }}
                        />
                        <span style={{ fontSize: "0.75rem", minWidth: 30, fontWeight: 500, color: utilizationColor(utilPct) }}>
                          {utilPct}%
                        </span>
                      </Box>
                    </Tooltip>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSelectAsset && onSelectAsset(asset); }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
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
