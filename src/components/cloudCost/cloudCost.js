import * as React from "react";
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

import { toCurrency } from "../../util";
import CloudCostChart from "./cloudCostChart";

const CloudCost = ({
  cumulativeData = [],
  totalData: totalsRow = {},
  graphData = [],
  currency = "USD",
  drilldown,
  sampleData = false,
}) => {
  const headers = [
    { key: "name", header: "Name" },
    { key: "kubernetesPercent", header: "K8s Utilization" },
    {
      key: "cost",
      header: sampleData ? "Sum of Sample Data" : "Total cost",
    },
  ];

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const numData = cumulativeData?.length || 0;

  React.useEffect(() => {
    setPage(1);
  }, [numData]);

  const displayCurrencyAsLessThanPenny = (amount, currency) =>
    amount > 0 && amount < 0.01
      ? `<${toCurrency(0.01, currency)}`
      : toCurrency(amount, currency);

  const formatRows = React.useMemo(() => {
    const suffix =
      { hourly: "/hr", monthly: "/mo", daily: "/day" }["cumulative"] || "";
    return cumulativeData.map((row, index) => {
      const name =
        sampleData && row.labelName ? row.labelName ?? "" : row.name ?? "";
      const kubernetesPercent = sampleData
        ? `${(row.kubernetesPercent * 100).toFixed(1)}%`
        : `${Math.round(row.kubernetesPercent * 100)}%`;
      return {
        id: `row-${index}`,
        name,
        kubernetesPercent,
        cost: `${displayCurrencyAsLessThanPenny(row.cost, currency)}${suffix}`,
        _originalRow: row,
      };
    });
  }, [cumulativeData, currency, sampleData]);

  const sortedRows = React.useMemo(() => {
    return [...formatRows].sort((a, b) => {
      const aCost = a._originalRow.cost || 0;
      const bCost = b._originalRow.cost || 0;
      if (bCost < aCost) return -1;
      if (bCost > aCost) return 1;
      return 0;
    });
  }, [formatRows]);

  const paginatedRows = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [sortedRows, page, pageSize]);

  const totalsRowData = {
    id: "totals",
    name: totalsRow?.name || "Totals",
    kubernetesPercent: `${Math.round(totalsRow?.kubernetesPercent * 100)}%`,
    cost: toCurrency(totalsRow?.cost || 0, currency),
  };

  if (cumulativeData.length === 0) {
    return (
      <p style={{ padding: 24, color: "var(--opencost-text-secondary)" }}>
        No results
      </p>
    );
  }

  const allRows = [totalsRowData, ...paginatedRows];

  const rowDataMap = React.useMemo(() => {
    const map = new Map();
    paginatedRows.forEach((row) => {
      map.set(row.id, row);
    });
    return map;
  }, [paginatedRows]);

  return (
    <div id="cloud-cost">
      <div id="cloud-graph-">
        <CloudCostChart
          currency={currency}
          graphData={graphData}
          height={300}
          n={10}
        />
      </div>
      <div id="cloud-cost-table">
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
                    return (
                      <TableRow
                        {...getRowProps({ row })}
                        key={row.id}
                        onClick={
                          rowInfo && drilldown
                            ? () => drilldown(rowInfo._originalRow)
                            : undefined
                        }
                        style={{
                          cursor: rowInfo && drilldown ? "pointer" : "default",
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
                              color:
                                cell.info.header === "Name" &&
                                rowInfo &&
                                drilldown
                                  ? "#0f62fe"
                                  : undefined,
                              padding:
                                cell.info.header === "Name" ? "1rem" : undefined,
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
      <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              color: "var(--opencost-text-secondary)",
              fontSize: "0.875rem",
            }}
          >
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

export default React.memo(CloudCost);
