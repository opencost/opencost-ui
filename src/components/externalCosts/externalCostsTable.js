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
import { useLocation, useNavigate } from "react-router";
import { toCurrency } from "../../util";
import { aggToKeyMapExternalCosts } from "./tokens";

const ExternalCostsTable = ({
  tableData,
  currency = "USD",
  aggregateBy = "usageUnit",
  drilldown,
}) => {
  const headers = [
    { key: "name", header: "Name" },
    { key: "costType", header: "Cost Type" },
    { key: "cost", header: "Cost" },
  ];

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const numData = tableData.customCosts?.length ?? 0;

  React.useEffect(() => {
    setPage(1);
  }, [numData]);

  const displayCurrencyAsLessThanPenny = (amount, currency) =>
    amount > 0 && amount < 0.01
      ? `<${toCurrency(0.01, currency)}`
      : toCurrency(amount, currency);

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const formatRows = React.useMemo(() => {
    if (!tableData || !("customCosts" in tableData)) return [];
    return tableData.customCosts.map((row, index) => {
      const name = row[aggToKeyMapExternalCosts[aggregateBy]] || "Unallocated";
      const canDrilldown = !!row[aggToKeyMapExternalCosts[aggregateBy]];
      return {
        id: `row-${index}`,
        name,
        costType: capitalizeFirstLetter(row.cost_type),
        cost: displayCurrencyAsLessThanPenny(row.cost, currency),
        _originalRow: row,
        _canDrilldown: canDrilldown,
      };
    });
  }, [tableData, aggregateBy, currency]);

  const paginatedRows = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return formatRows.slice(startIndex, startIndex + pageSize);
  }, [formatRows, page, pageSize]);

  const totalsRow = {
    id: "totals",
    name: "Total Cost",
    costType: "",
    cost: toCurrency(tableData.totalCost || 0, currency),
  };

  if ("customCosts" in tableData && tableData.customCosts.length === 0) {
    return (
      <p style={{ padding: 24, color: "var(--opencost-text-secondary)" }}>
        No results
      </p>
    );
  }

  const allRows = [totalsRow, ...paginatedRows];

  const handleRowClick = (row) => {
    if (row._canDrilldown && drilldown) {
      drilldown(row._originalRow);
    }
  };

  const rowDataMap = React.useMemo(() => {
    const map = new Map();
    paginatedRows.forEach((row) => {
      map.set(row.id, row);
    });
    return map;
  }, [paginatedRows]);

  return (
    <>
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
                    const canDrilldown = rowInfo?._canDrilldown && drilldown;
                    return (
                      <TableRow
                        {...getRowProps({ row })}
                        key={row.id}
                        onClick={
                          canDrilldown ? () => handleRowClick(rowInfo) : undefined
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
                              color:
                                cell.info.header === "Name" && canDrilldown
                                  ? "#0f62fe"
                                  : undefined,
                              padding: cell.info.header === "Name" ? "1rem" : undefined,
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
    </>
  );
};

export default React.memo(ExternalCostsTable);
