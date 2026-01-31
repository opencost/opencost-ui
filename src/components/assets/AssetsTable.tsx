import React, { useState, useEffect } from "react";
import { get } from "lodash";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { toCurrency } from "../../util";

type Order = "asc" | "desc";

interface HeadCell {
  id: string;
  numeric: boolean;
  label: string;
  width: number | string;
}

const headCells: HeadCell[] = [
  { id: "name", numeric: false, label: "Name", width: "auto" },
  { id: "type", numeric: false, label: "Type", width: 120 },
  { id: "cpuCost", numeric: true, label: "CPU Cost", width: 110 },
  { id: "gpuCost", numeric: true, label: "GPU Cost", width: 110 },
  { id: "ramCost", numeric: true, label: "RAM Cost", width: 110 },
  { id: "adjustment", numeric: true, label: "Adjustment", width: 110 },
  { id: "totalCost", numeric: true, label: "Total Cost", width: 130 },
];

interface AssetData {
  name?: string;
  type?: string;
  cpuCost?: number;
  gpuCost?: number;
  ramCost?: number;
  adjustment?: number;
  totalCost?: number;
}

interface TotalData {
  cpuCost?: number;
  gpuCost?: number;
  ramCost?: number;
  adjustment?: number;
  totalCost?: number;
}

interface AssetsTableProps {
  assetData?: AssetData[];
  totalData?: TotalData;
  currency?: string;
  drilldown?: (row: AssetData) => void;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  const aVal = get(a, orderBy) ?? 0;
  const bVal = get(b, orderBy) ?? 0;
  if (bVal < aVal) return -1;
  if (bVal > aVal) return 1;
  return 0;
}

function getComparator<T>(order: Order, orderBy: keyof T): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
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

const AssetsTable: React.FC<AssetsTableProps> = ({
  assetData = [],
  totalData = {},
  currency = "USD",
  drilldown,
}) => {
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<string>("totalCost");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const numData = assetData.length;

  useEffect(() => {
    setPage(0);
  }, [numData]);

  if (assetData.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
          backgroundColor: "var(--cds-layer-01, #f4f4f4)",
          borderRadius: 1,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No assets data available
        </Typography>
      </Box>
    );
  }

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const createSortHandler = (property: string) => (_event: React.MouseEvent) => {
    const isDesc = orderBy === property && order === "desc";
    setOrder(isDesc ? "asc" : "desc");
    setOrderBy(property);
  };

  const orderedRows = stableSort(assetData, getComparator(order, orderBy as keyof AssetData));
  const pageRows = orderedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRowClick = (row: AssetData) => {
    if (drilldown) {
      drilldown(row);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Section Title */}
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          textAlign: "center",
          color: "var(--cds-text-primary)",
        }}
      >
        Asset Details
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid var(--cds-border-subtle-01, #e0e0e0)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "var(--cds-layer-accent-01, #e0e0e0)",
                }}
              >
                {headCells.map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={cell.numeric ? "right" : "left"}
                    sortDirection={orderBy === cell.id ? order : false}
                    sx={{
                      width: cell.width,
                      fontWeight: 600,
                      color: "var(--cds-text-primary)",
                      borderBottom: "2px solid var(--cds-border-strong-01, #8d8d8d)",
                      py: 1.5,
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === cell.id}
                      direction={orderBy === cell.id ? order : "asc"}
                      onClick={createSortHandler(cell.id)}
                      sx={{
                        "&.Mui-active": {
                          color: "var(--cds-text-primary)",
                        },
                      }}
                    >
                      {cell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Totals row */}
              <TableRow
                sx={{
                  backgroundColor: "var(--cds-layer-02, #f4f4f4)",
                  "&:hover": {
                    backgroundColor: "var(--cds-layer-02, #f4f4f4)",
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  Total
                </TableCell>
                <TableCell>
                  <Chip label="All Types" size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {toCurrency(totalData.cpuCost || 0, currency, 2)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {toCurrency(totalData.gpuCost || 0, currency, 2)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {toCurrency(totalData.ramCost || 0, currency, 2)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {totalData.adjustment
                    ? toCurrency(totalData.adjustment, currency, 2)
                    : "—"}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--cds-text-primary)",
                  }}
                >
                  {toCurrency(totalData.totalCost || 0, currency, 2)}
                </TableCell>
              </TableRow>

              {/* Data rows */}
              {pageRows.map((row, index) => (
                <TableRow
                  key={row.name || index}
                  hover
                  onClick={() => handleRowClick(row)}
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
                  <TableCell align="right">
                    {toCurrency(row.cpuCost || 0, currency, 2)}
                  </TableCell>
                  <TableCell align="right">
                    {toCurrency(row.gpuCost || 0, currency, 2)}
                  </TableCell>
                  <TableCell align="right">
                    {toCurrency(row.ramCost || 0, currency, 2)}
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={numData}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid var(--cds-border-subtle-01, #e0e0e0)",
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              marginBottom: 0,
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default AssetsTable;
