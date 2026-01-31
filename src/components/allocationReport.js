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

const AllocationReport = ({
  allocationData,
  cumulativeData,
  totalData,
  currency,
  aggregateBy,
  drilldown,
}) => {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const headers = [
    { key: "name", header: "Name" },
    { key: "cpuCost", header: "CPU" },
    { key: "gpuCost", header: "GPU" },
    { key: "ramCost", header: "RAM" },
    { key: "pvCost", header: "PV" },
    { key: "networkCost", header: "Network" },
    { key: "loadBalancerCost", header: "Load Balancer" },
    { key: "totalCost", header: "Total" },
  ];

  const rows = cumulativeData.map((item, index) => ({
    id: String(index),
    name: item.name,
    cpuCost: formatCurrency(item.cpuCost || 0, currency),
    gpuCost: formatCurrency(item.gpuCost || 0, currency),
    ramCost: formatCurrency(item.ramCost || 0, currency),
    pvCost: formatCurrency(item.pvCost || 0, currency),
    networkCost: formatCurrency(item.networkCost || 0, currency),
    loadBalancerCost: formatCurrency(item.loadBalancerCost || 0, currency),
    totalCost: formatCurrency(item.totalCost || 0, currency),
    rawData: item,
  }));

  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const canDrillDown = aggregateBy !== "container";

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
                          {canDrillDown ? (
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
                          ) : (
                            cell.value
                          )}
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

export default AllocationReport;
