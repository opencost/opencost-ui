import React, { useState, useMemo } from "react";
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
} from "@carbon/react";
import { toCurrency, bytesToString } from "../../util";

const headers = [
  { key: "name", header: "Name" },
  { key: "type", header: "Type" },
  { key: "provider", header: "Provider" },
  { key: "cluster", header: "Cluster" },
  { key: "cpuCores", header: "CPU Cores" },
  { key: "ramBytes", header: "RAM" },
  { key: "totalCost", header: "Total Cost" },
];

const AssetsDataTable = ({ assets, currency }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const safeAssets = Array.isArray(assets) ? assets : [];

  const sortedAssets = useMemo(() => {
    return [...safeAssets].sort(
      (a, b) => (b.totalCost || 0) - (a.totalCost || 0),
    );
  }, [safeAssets]);

  const filteredAssets = useMemo(() => {
    if (!searchTerm) return sortedAssets;
    const lowerSearch = searchTerm.toLowerCase();
    return sortedAssets.filter(
      (asset) =>
        (asset.name || "").toLowerCase().includes(lowerSearch) ||
        (asset.type || "").toLowerCase().includes(lowerSearch) ||
        (asset.provider || "").toLowerCase().includes(lowerSearch) ||
        (asset.cluster || "").toLowerCase().includes(lowerSearch),
    );
  }, [sortedAssets, searchTerm]);

  const rows = filteredAssets.map((asset, index) => ({
    id: asset.key || `${asset.name || "asset"}-${index}`,
    name: asset.name || "-",
    type: asset.type || "-",
    provider: asset.provider || "-",
    cluster: asset.cluster || "-",
    cpuCores: asset.cpuCores != null ? asset.cpuCores.toFixed(2) : "-",
    ramBytes: asset.ramBytes != null ? bytesToString(asset.ramBytes) : "-",
    totalCost: toCurrency(asset.totalCost || 0, currency),
    rawCost: asset.totalCost || 0,
  }));

  return (
    <div className="assets-data-table">
      <DataTable rows={rows} headers={headers} isSortable>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
          getToolbarProps,
        }) => (
          <TableContainer
            title="Infrastructure Assets"
            description="Detailed view of all infrastructure assets and their costs"
            {...getTableContainerProps()}
          >
            <TableToolbar {...getToolbarProps()}>
              <TableToolbarContent>
                <TableToolbarSearch
                  persistent
                  placeholder="Search assets..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} size="lg">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      key={header.key}
                      {...getHeaderProps({ header })}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default AssetsDataTable;
