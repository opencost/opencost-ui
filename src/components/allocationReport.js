import React, { useEffect, useState, useMemo } from "react";
import { get, round } from "lodash";
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
} from "@carbon/react";
import AllocationChart from "./AllocationChart";
import { toCurrency } from "../util";


const headers = [
  { key: "name", header: "Name" },
  { key: "cpuCost", header: "CPU" },
  { key: "gpuCost", header: "GPU" },
  { key: "ramCost", header: "RAM" },
  { key: "pvCost", header: "PV" },
  { key: "totalEfficiency", header: "Efficiency" },
  { key: "totalCost", header: "Total cost" },
];

const AllocationReport = ({
  allocationData,
  cumulativeData,
  totalData,
  currency,
  aggregateBy,
  drilldown,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const numData = cumulativeData.length;

  useEffect(() => {
    setPage(1);
  }, [numData]);

  const totalPages = Math.ceil(numData / pageSize);

  const formatRowData = (row, index) => {
    if (row.name === "__unmounted__") {
      row.name = "Unmounted PVs";
    }

    let isIdle = row.name.indexOf("__idle__") >= 0;
    let isUnallocated = row.name.indexOf("__unallocated__") >= 0;
    let isUnmounted = row.name.indexOf("Unmounted PVs") >= 0;

    let efficiency = round(row.totalEfficiency * 100, 1);
    if (
      row.totalEfficiency == 1.0 &&
      row.cpuReqCoreHrs == 0 &&
      row.ramReqByteHrs == 0
    ) {
      efficiency = "Inf";
    }

    return {
      id: `row-${index}`,
      name: row.name,
      cpuCost: toCurrency(row.cpuCost, currency),
      gpuCost: toCurrency(row.gpuCost, currency),
      ramCost: toCurrency(row.ramCost, currency),
      pvCost: toCurrency(row.pvCost, currency),
      totalEfficiency: isIdle ? "—" : `${efficiency}%`,
      totalCost: toCurrency(row.totalCost, currency),
      _rowData: row,
      _canDrilldown: !isIdle && !isUnallocated && !isUnmounted,
    };
  };

  const rowDataMap = useMemo(() => {
    const map = new Map();
    cumulativeData.forEach((row, index) => {
      const formatted = formatRowData(row, index);
      map.set(formatted.id, { originalRow: row, canDrilldown: formatted._canDrilldown });
    });
    return map;
  }, [cumulativeData, currency]);

  const tableRows = useMemo(() => {
    const sortedData = [...cumulativeData].sort((a, b) => {
      if (b.totalCost < a.totalCost) return -1;
      if (b.totalCost > a.totalCost) return 1;
      return 0;
    });
    return sortedData.map((row, index) => formatRowData(row, index));
  }, [cumulativeData, currency]);

  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return tableRows.slice(startIndex, startIndex + pageSize);
  }, [tableRows, page, pageSize]);

  const totalsRow = {
    id: "totals",
    name: totalData.name || "Totals",
    cpuCost: toCurrency(totalData.cpuCost, currency),
    gpuCost: toCurrency(totalData.gpuCost, currency),
    ramCost: toCurrency(totalData.ramCost, currency),
    pvCost: toCurrency(totalData.pvCost, currency),
    totalEfficiency:
      totalData.totalEfficiency == 1.0 &&
      totalData.cpuReqCoreHrs == 0 &&
      totalData.ramReqByteHrs == 0
        ? "Inf%"
        : `${round(totalData.totalEfficiency * 100, 1)}%`,
    totalCost: toCurrency(totalData.totalCost, currency),
  };

  if (allocationData.length === 0) {
    return (
      <p style={{ padding: 24, color: "var(--opencost-text-secondary)" }}>
        No results
      </p>
    );
  }

  const drilldownHierarchy = {
    namespace: "controllerKind",
    controllerKind: "controller",
    controller: "pod",
    pod: "container",
  };
  const hasNextLevel = drilldownHierarchy[aggregateBy] !== undefined;

  const allRows = [totalsRow, ...paginatedRows];

  return (
    <div id="report">
      <AllocationChart
        allocationRange={allocationData}
        currency={currency}
        n={10}
        height={300}
      />
      <div>
        <DataTable rows={allRows} headers={headers} isSortable>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getCellProps,
        }) => (
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({ header })}
                      key={header.key}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const isTotalsRow = row.id === "totals";
                  const rowInfo = rowDataMap.get(row.id);
                  const canDrilldown =
                    rowInfo?.canDrilldown && hasNextLevel && drilldown;
                  return (
                    <TableRow
                      {...getRowProps({ row })}
                      key={row.id}
                      onClick={
                        canDrilldown
                          ? () => drilldown(rowInfo.originalRow)
                          : undefined
                      }
                      style={{
                        cursor: canDrilldown ? "pointer" : "default",
                        fontWeight: isTotalsRow ? 600 : "normal",
                        backgroundColor: isTotalsRow
                          ? "var(--opencost-surface-hover)"
                          : undefined,
                      }}
                    >
                      {row.cells.map((cell) => (
                        <TableCell
                          {...getCellProps({ cell })}
                          key={cell.id}
                          style={{
                            textAlign: "left",
                          }}
                        >
                          {cell.value}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </DataTable>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
        <div style={{ color: "var(--opencost-text-secondary)", fontSize: "0.875rem" }}>
          {numData} {numData === 1 ? "item" : "items"}
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          pageSizes={[10, 25, 50]}
          totalItems={numData}
          onChange={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(AllocationReport);
