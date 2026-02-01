import React, { useState, useEffect } from "react";
import { get } from "lodash";
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
  Tag,
} from "@carbon/react";
import { toCurrency } from "../../util";
import { AssetData, AssetsTableProps, HeadCell } from "../../types/assets";

type Order = "asc" | "desc";

const headCells: HeadCell[] = [
  { id: "name", numeric: false, label: "Name", width: 200 },
  { id: "type", numeric: false, label: "Type", width: 120 },
  { id: "cpuCost", numeric: true, label: "CPU Cost", width: 110 },
  { id: "gpuCost", numeric: true, label: "GPU Cost", width: 110 },
  { id: "ramCost", numeric: true, label: "RAM Cost", width: 110 },
  { id: "adjustment", numeric: true, label: "Adjustment", width: 110 },
  { id: "totalCost", numeric: true, label: "Total Cost", width: 130 },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  const aVal = get(a, orderBy) ?? 0;
  const bVal = get(b, orderBy) ?? 0;
  if (bVal < aVal) return -1;
  if (bVal > aVal) return 1;
  return 0;
}

function getComparator<T>(
  order: Order,
  orderBy: keyof T,
): (a: T, b: T) => number {
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
const getTypeColor = (
  type: string,
): "blue" | "purple" | "green" | "magenta" | "cyan" | "gray" => {
  const typeColors: Record<
    string,
    "blue" | "purple" | "green" | "magenta" | "cyan" | "gray"
  > = {
    Node: "blue",
    Disk: "purple",
    ClusterManagement: "magenta",
    Network: "cyan",
    LoadBalancer: "green",
  };
  return typeColors[type] || "gray";
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          backgroundColor: "var(--cds-layer-01, #f4f4f4)",
          borderRadius: "4px",
        }}
      >
        <p style={{ color: "var(--cds-text-secondary)" }}>
          No assets data available
        </p>
      </div>
    );
  }

  const handleRowClick = (row: AssetData) => {
    if (drilldown) {
      drilldown(row);
    }
  };

  const headers = headCells.map((cell) => ({
    key: cell.id,
    header: cell.label,
  }));

  const orderedRows = stableSort(
    assetData,
    getComparator(order, orderBy as keyof AssetData),
  );
  const pageRows = orderedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const rows = pageRows.map((row, index) => ({
    id: row.name || String(index),
    ...row,
  }));

  return (
    <div style={{ width: "100%" }}>
      {/* Section Title */}
      <h3
        style={{
          marginBottom: "1rem",
          fontWeight: 600,
          textAlign: "center",
          color: "var(--cds-text-primary)",
        }}
      >
        Asset Details
      </h3>

      <DataTable rows={rows} headers={headers} isSortable>
        {({
          rows: tableRows,
          headers: tableHeaders,
          getTableProps,
          getHeaderProps,
          getRowProps,
        }) => (
          <TableContainer>
            <Table {...getTableProps()} size="lg">
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header) => {
                    const cell = headCells.find((c) => c.id === header.key);
                    return (
                      <TableHeader
                        {...getHeaderProps({ header })}
                        key={header.key}
                        onClick={() => {
                          const isDesc =
                            orderBy === header.key && order === "desc";
                          setOrder(isDesc ? "asc" : "desc");
                          setOrderBy(header.key);
                        }}
                        isSortHeader={orderBy === header.key}
                        sortDirection={
                          orderBy === header.key
                            ? order === "asc"
                              ? "ASC"
                              : "DESC"
                            : "NONE"
                        }
                        style={{ width: cell?.width }}
                      >
                        {header.header}
                      </TableHeader>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Totals row */}
                <TableRow
                  key="totals-row"
                  style={{ backgroundColor: "var(--cds-layer-02, #f4f4f4)" }}
                >
                  <TableCell
                    key="totals-name"
                    style={{ fontWeight: 700, fontSize: "0.95rem" }}
                  >
                    Total
                  </TableCell>
                  <TableCell key="totals-type">
                    <Tag type="gray" size="sm">
                      All Types
                    </Tag>
                  </TableCell>
                  <TableCell key="totals-cpu" style={{ fontWeight: 600 }}>
                    {toCurrency(totalData.cpuCost || 0, currency, 2)}
                  </TableCell>
                  <TableCell key="totals-gpu" style={{ fontWeight: 600 }}>
                    {toCurrency(totalData.gpuCost || 0, currency, 2)}
                  </TableCell>
                  <TableCell key="totals-ram" style={{ fontWeight: 600 }}>
                    {toCurrency(totalData.ramCost || 0, currency, 2)}
                  </TableCell>
                  <TableCell key="totals-adj" style={{ fontWeight: 600 }}>
                    {totalData.adjustment
                      ? toCurrency(totalData.adjustment, currency, 2)
                      : "—"}
                  </TableCell>
                  <TableCell
                    key="totals-total"
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "var(--cds-text-primary)",
                    }}
                  >
                    {toCurrency(totalData.totalCost || 0, currency, 2)}
                  </TableCell>
                </TableRow>

                {/* Data rows */}
                {tableRows.map((row) => {
                  const originalRow =
                    pageRows.find((r) => r.name === row.id) || pageRows[0];
                  return (
                    <TableRow
                      {...getRowProps({ row })}
                      key={row.id}
                      onClick={() => handleRowClick(originalRow)}
                      style={{
                        cursor: drilldown ? "pointer" : "default",
                      }}
                    >
                      <TableCell
                        key={`${row.id}-name`}
                        style={{
                          fontWeight: 500,
                          color: "var(--cds-text-primary)",
                          maxWidth: "300px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {originalRow.name || "Unknown"}
                      </TableCell>
                      <TableCell key={`${row.id}-type`}>
                        {originalRow.type ? (
                          <Tag type={getTypeColor(originalRow.type)} size="sm">
                            {originalRow.type}
                          </Tag>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell key={`${row.id}-cpu`}>
                        {toCurrency(originalRow.cpuCost || 0, currency, 2)}
                      </TableCell>
                      <TableCell key={`${row.id}-gpu`}>
                        {toCurrency(originalRow.gpuCost || 0, currency, 2)}
                      </TableCell>
                      <TableCell key={`${row.id}-ram`}>
                        {toCurrency(originalRow.ramCost || 0, currency, 2)}
                      </TableCell>
                      <TableCell key={`${row.id}-adj`}>
                        {originalRow.adjustment
                          ? toCurrency(originalRow.adjustment, currency, 2)
                          : "—"}
                      </TableCell>
                      <TableCell
                        key={`${row.id}-total`}
                        style={{
                          fontWeight: 600,
                          color: "var(--cds-text-primary)",
                        }}
                      >
                        {toCurrency(originalRow.totalCost || 0, currency, 2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      <Pagination
        totalItems={numData}
        pageSize={rowsPerPage}
        pageSizes={[10, 25, 50, 100]}
        page={page + 1}
        onChange={({ page: newPage, pageSize }) => {
          setPage(newPage - 1);
          setRowsPerPage(pageSize);
        }}
      />
    </div>
  );
};

export default AssetsTable;
