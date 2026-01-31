import React from "react";
import { TableRow, TableCell, Tag } from "@carbon/react";
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
const getTypeColor = (type: string): "blue" | "purple" | "green" | "magenta" | "cyan" | "gray" => {
  const typeColors: Record<string, "blue" | "purple" | "green" | "magenta" | "cyan" | "gray"> = {
    Node: "blue",
    Disk: "purple",
    ClusterManagement: "magenta",
    Network: "cyan",
    LoadBalancer: "green",
  };
  return typeColors[type] || "gray";
};

const AssetsRow: React.FC<AssetsRowProps> = ({ row, currency = "USD", drilldown }) => {
  const handleClick = () => {
    if (drilldown) {
      drilldown(row);
    }
  };

  return (
    <TableRow
      onClick={handleClick}
      style={{
        cursor: drilldown ? "pointer" : "default",
      }}
    >
      <TableCell
        style={{
          fontWeight: 500,
          color: "var(--cds-text-primary)",
          maxWidth: "300px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {row.name || "Unknown"}
      </TableCell>
      <TableCell>
        {row.type ? (
          <Tag type={getTypeColor(row.type)} size="sm">
            {row.type}
          </Tag>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell style={{ textAlign: "right" }}>{toCurrency(row.cpuCost || 0, currency, 2)}</TableCell>
      <TableCell style={{ textAlign: "right" }}>{toCurrency(row.gpuCost || 0, currency, 2)}</TableCell>
      <TableCell style={{ textAlign: "right" }}>{toCurrency(row.ramCost || 0, currency, 2)}</TableCell>
      <TableCell style={{ textAlign: "right" }}>
        {row.adjustment ? toCurrency(row.adjustment, currency, 2) : "—"}
      </TableCell>
      <TableCell
        style={{
          fontWeight: 600,
          color: "var(--cds-text-primary)",
          textAlign: "right",
        }}
      >
        {toCurrency(row.totalCost || 0, currency, 2)}
      </TableCell>
    </TableRow>
  );
};

export default AssetsRow;
