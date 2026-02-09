import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
} from "@carbon/react";

function AssetsCostsTable({ rows }) {

  // Column definitions
  const headers = [
     { key: "date", header: "Date" },
  { key: "type", header: "Type" },
  { key: "category", header: "Category" },
  { key: "name", header: "Name" },
  { key: "service", header: "Service" },
  { key: "provider", header: "Provider" },
  { key: "totalCost", header: "Total Cost ($)" },
  ];

  return (
    <DataTable
      rows={rows}
      headers={headers}
      isSortable
    >
      {({
        rows,
        headers,
        getHeaderProps,
        getRowProps,
        getTableProps,
        onInputChange,
      }) => (

        <TableContainer title="Asset Cost Breakdown">

          {/* Search Bar */}
          <TableToolbar>
            <TableToolbarContent>
              <TableToolbarSearch
                onChange={onInputChange}
              />
            </TableToolbarContent>
          </TableToolbar>

          {/* Table */}
          <Table {...getTableProps()}>

            <TableHead>
              <TableRow>
               {headers.map(header => {
  const { key, ...rest } = getHeaderProps({ header });

  return (
    <TableHeader
      key={key}     // ✅ direct
      {...rest}     // ✅ no key inside spread
    >
      {header.header}
    </TableHeader>
  );
})}
              </TableRow>
            </TableHead>

            <TableBody>
  {rows.map(row => {
    const { key, ...rest } = getRowProps({ row });

    return (
      <TableRow key={key} {...rest}>

        {row.cells.map(cell => (
          <TableCell key={cell.id}>
            {cell.value}
          </TableCell>
        ))}

      </TableRow>
    );
  })}
</TableBody>


          </Table>

          {/* Pagination */}
          <Pagination
            pageSizes={[10, 20, 50]}
            totalItems={rows.length}
          />

        </TableContainer>
      )}
    </DataTable>
  );
}

export default AssetsCostsTable;