import React from "react";
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
  Link,
} from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";

const CloudCost = ({
  cumulativeData,
  currency,
  totalData,
  drilldown,
  sampleData,
}) => {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Handle empty data case
  if (!cumulativeData || cumulativeData.length === 0) {
    return (
      <div style={{ 
        padding: "3rem", 
        textAlign: "center",
        color: "var(--cds-text-secondary)"
      }}>
        <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>No cloud cost data available</p>
        <p style={{ fontSize: "0.875rem" }}>
          This could be because no cloud cost data has been recorded yet, 
          or cloud cost integrations have not been configured.
        </p>
      </div>
    );
  }

  const headers = [
    { key: "name", header: "Name" },
    { key: "amortizedNetCost", header: "Amortized Net Cost" },
    { key: "amortizedListCost", header: "Amortized List Cost" },
    { key: "amortizedInlineDiscount", header: "Amortized Inline Discount" },
    { key: "netCost", header: "Net Cost" },
    { key: "listCost", header: "List Cost" },
    { key: "invoiceCost", header: "Invoice Cost" },
  ];

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const rows = (cumulativeData || []).map((item, index) => ({
    id: String(index),
    name: item.name,
    amortizedNetCost: formatCurrency(item.amortizedNetCost),
    amortizedListCost: formatCurrency(item.amortizedListCost),
    amortizedInlineDiscount: formatCurrency(item.amortizedInlineDiscount),
    netCost: formatCurrency(item.netCost),
    listCost: formatCurrency(item.listCost),
    invoiceCost: formatCurrency(item.invoiceCost),
    rawData: item,
  }));

  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <DataTable rows={paginatedRows} headers={headers}>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
        <div>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map((cell) => {
                    if (cell.info.header === "name") {
                      const rawItem = paginatedRows.find((r) => r.id === row.id)?.rawData;
                      return (
                        <TableCell key={cell.id}>
                          {!sampleData && (
                            <Link
                              href="#"
                              renderIcon={ArrowRight}
                              onClick={(e) => {
                                e.preventDefault();
                                drilldown(rawItem);
                              }}
                            >
                              {cell.value}
                            </Link>
                          )}
                          {sampleData && cell.value}
                        </TableCell>
                      );
                    }
                    return <TableCell key={cell.id}>{cell.value}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            backwardText="Previous page"
            forwardText="Next page"
            itemsPerPageText="Items per page:"
            page={page}
            pageNumberText="Page Number"
            pageSize={pageSize}
            pageSizes={[10, 20, 30, 40, 50]}
            totalItems={rows.length}
            onChange={({ page, pageSize }) => {
              setPage(page);
              setPageSize(pageSize);
            }}
          />
        </div>
      )}
    </DataTable>
  );
};

export default CloudCost;
