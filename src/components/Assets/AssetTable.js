import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@carbon/react";

const AssetTable = ({ headers, rows, formatters = {}, onRowClick }) => {
  return (
    <DataTable rows={rows} headers={headers} isSortable>
      {({ rows, headers, getHeaderProps, getRowProps }) => (
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => {
                const { key, ...headerProps } = getHeaderProps({ header });
                return (
                  <TableHeader key={key} {...headerProps}>
                    {header.header}
                  </TableHeader>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const { key, ...rowProps } = getRowProps({ row });
              return (
                <TableRow
                  key={key}
                  {...rowProps}
                  onClick={() => onRowClick && onRowClick(row.id)}
                  style={{ cursor: "pointer" }}
                >
                  {row.cells.map((cell, index) => {
                    const headerKey = headers[index].key;
                    const formatter = formatters[headerKey];
                    const displayValue = formatter
                      ? formatter(cell.value)
                      : cell.value;
                    return <TableCell key={cell.id}>{displayValue}</TableCell>;
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </DataTable>
  );
};

export default AssetTable;
