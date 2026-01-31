import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import { toCurrency } from "../../util";

interface AssetData {
  name?: string;
  type?: string;
  cpuCost?: number;
  gpuCost?: number;
  ramCost?: number;
  adjustment?: number;
  totalCost?: number;
}

interface AssetsRowProps {
  row: AssetData;
  currency?: string;
  drilldown?: (row: AssetData) => void;
}

// Type badge colors
const getTypeColor = (type: string): "primary" | "secondary" | "success" | "warning" | "info" | "default" => {
  const typeColors: Record<string, "primary" | "secondary" | "success" | "warning" | "info" | "default"> = {
    Node: "primary",
    Disk: "secondary",
    ClusterManagement: "warning",
    Network: "info",
    LoadBalancer: "success",
  };
  return typeColors[type] || "default";
};

const AssetsRow: React.FC<AssetsRowProps> = ({ row, currency = "USD", drilldown }) => {
  const handleClick = () => {
    if (drilldown) {
      drilldown(row);
    }
  };

  return (
    <TableRow
      hover
      onClick={handleClick}
      sx={{
        cursor: drilldown ? "pointer" : "default",
        "&:nth-of-type(odd)": {
          backgroundColor: "var(--cds-layer-01, #fff)",
        },
        "&:nth-of-type(even)": {
          backgroundColor: "var(--cds-layer-02, #f9f9f9)",
        },
        "&:hover": {
          backgroundColor: "var(--cds-layer-hover-01, #e8e8e8) !important",
        },
        transition: "background-color 0.15s ease",
      }}
    >
      <TableCell
        sx={{
          fontWeight: 500,
          color: "var(--cds-text-primary)",
          maxWidth: 300,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {row.name || "Unknown"}
      </TableCell>
      <TableCell>
        {row.type ? (
          <Chip
            label={row.type}
            size="small"
            color={getTypeColor(row.type)}
            variant="outlined"
            sx={{ fontSize: "0.75rem" }}
          />
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell align="right">{toCurrency(row.cpuCost || 0, currency, 2)}</TableCell>
      <TableCell align="right">{toCurrency(row.gpuCost || 0, currency, 2)}</TableCell>
      <TableCell align="right">{toCurrency(row.ramCost || 0, currency, 2)}</TableCell>
      <TableCell align="right">
        {row.adjustment ? toCurrency(row.adjustment, currency, 2) : "—"}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          fontWeight: 600,
          color: "var(--cds-text-primary)",
        }}
      >
        {toCurrency(row.totalCost || 0, currency, 2)}
      </TableCell>
    </TableRow>
  );
};

export default AssetsRow;
