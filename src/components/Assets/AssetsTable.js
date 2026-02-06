import React, { useState } from "react";
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
    Button,
    Pagination,
} from "@carbon/react";
import { Download } from "@carbon/icons-react";
import { toCurrency } from "../../util";

const headers = [
    { key: "name", header: "Name" },
    { key: "type", header: "Type" },
    { key: "service", header: "Service" },
    { key: "cpuCost", header: "CPU Cost" },
    { key: "ramCost", header: "RAM Cost" },
    { key: "totalCost", header: "Total Cost" },
];

const AssetsTable = ({ assets, currency }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Transform data for Carbon DataTable
    // keys in 'rows' must match 'key' in headers
    const allRows = Object.entries(assets).map(([id, asset]) => ({
        id: id,
        name: asset.properties.name || asset.properties.providerID,
        type: asset.type,
        service: asset.properties.service || "Unknown",
        cpuCost: toCurrency(asset.cpuCost, currency, 2),
        ramCost: toCurrency(asset.ramCost, currency, 2),
        totalCost: toCurrency(asset.totalCost, currency, 2),
    }));

    const exportToCSV = () => {
        // Create CSV content
        const csvHeaders = headers.map(h => h.header).join(",");
        const csvRows = allRows.map(row =>
            headers.map(h => {
                const value = row[h.key];
                // Escape values that contain commas
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(",")
        );

        const csvContent = [csvHeaders, ...csvRows].join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `assets_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <DataTable rows={allRows} headers={headers} isSortable>
                {({
                    rows,
                    headers,
                    getHeaderProps,
                    getRowProps,
                    getTableProps,
                    onInputChange,
                }) => {
                    // Paginate rows
                    const startIndex = (currentPage - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedRows = rows.slice(startIndex, endIndex);

                    return (
                        <>
                            <TableContainer title="Assets Inventory" description="Breakdown of infrastructure backing costs">
                                <TableToolbar>
                                    <TableToolbarContent>
                                        <TableToolbarSearch onChange={onInputChange} />
                                        <Button
                                            kind="ghost"
                                            renderIcon={Download}
                                            onClick={exportToCSV}
                                            size="sm"
                                        >
                                            Export CSV
                                        </Button>
                                    </TableToolbarContent>
                                </TableToolbar>
                                <Table {...getTableProps()}>
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
                                        {paginatedRows.map((row) => {
                                            const { key, ...rowProps } = getRowProps({ row });
                                            return (
                                                <TableRow key={key} {...rowProps}>
                                                    {row.cells.map((cell) => (
                                                        <TableCell key={cell.id}>{cell.value}</TableCell>
                                                    ))}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Pagination
                                page={currentPage}
                                pageSize={pageSize}
                                pageSizes={[5, 10, 20, 50]}
                                totalItems={rows.length}
                                onChange={({ page, pageSize }) => {
                                    setCurrentPage(page);
                                    setPageSize(pageSize);
                                }}
                            />
                        </>
                    );
                }}
            </DataTable>
        </>
    );
};

export default AssetsTable;
