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
  Typography,
} from "@mui/material";
import { toCurrency } from "../../util";
import AssetsRow from "./AssetsRow";

const headCells = [
  { id: "name", numeric: false, label: "Name", width: "auto" },
  { id: "type", numeric: false, label: "Type", width: 120 },
  { id: "cpuCost", numeric: true, label: "CPU", width: 100 },
  { id: "gpuCost", numeric: true, label: "GPU", width: 100 },
  { id: "ramCost", numeric: true, label: "RAM", width: 100 },
  { id: "adjustment", numeric: true, label: "Adjustment", width: 100 },
  { id: "totalCost", numeric: true, label: "Total Cost", width: 120 },
];

function descendingComparator(a, b, orderBy) {
  if (get(b, orderBy) < get(a, orderBy)) {
    return -1;
  }
  if (get(b, orderBy) > get(a, orderBy)) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const AssetsTable = ({ assetData = [], totalData = {}, currency = "USD", drilldown }) => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("totalCost");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const numData = assetData.length;

  useEffect(() => {
    setPage(0);
  }, [numData]);

  if (assetData.length === 0) {
    return (
      <Typography variant="body2" sx={{ padding: 3 }}>
        No results
      </Typography>
    );
  }

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const createSortHandler = (property) => (event) => {
    const isDesc = orderBy === property && order === "desc";
    setOrder(isDesc ? "asc" : "desc");
    setOrderBy(property);
  };

  const orderedRows = stableSort(assetData, getComparator(order, orderBy));
  const pageRows = orderedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((cell) => (
                <TableCell
                  key={cell.id}
                  align={cell.numeric ? "right" : "left"}
                  sortDirection={orderBy === cell.id ? order : false}
                  style={{ width: cell.width }}
                >
                  <TableSortLabel
                    active={orderBy === cell.id}
                    direction={orderBy === cell.id ? order : "asc"}
                    onClick={createSortHandler(cell.id)}
                  >
                    {cell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Totals row */}
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell>-</TableCell>
              <TableCell align="right" sx={{ fontWeight: 500 }}>
                {toCurrency(totalData.cpuCost || 0, currency)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 500 }}>
                {toCurrency(totalData.gpuCost || 0, currency)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 500 }}>
                {toCurrency(totalData.ramCost || 0, currency)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 500 }}>
                {totalData.adjustment ? toCurrency(totalData.adjustment, currency) : "-"}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {toCurrency(totalData.totalCost || 0, currency)}
              </TableCell>
            </TableRow>
            {/* Data rows */}
            {pageRows.map((row, index) => (
              <AssetsRow
                key={row.name || index}
                row={row}
                currency={currency}
                drilldown={drilldown}
              />
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
      />
    </>
  );
};

export default AssetsTable;
