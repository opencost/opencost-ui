import React from "react";
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandRow,
  TableExpandedRow,
  TableExpandHeader,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch
} from "@carbon/react";
import { calculateIdlePercent } from "../../services/asset_utils";
import AssetDetailsPanel from "./DatailsPanel";

import { Tag } from "@carbon/react";

function AssetIdleTag({ percent }) {
  let kind = "green";
  if (percent >= 70) kind = "red";
  else if (percent >= 40) kind = "orange";

  return (
    <Tag type={kind} size="sm">
      {percent.toFixed(0)}%
    </Tag>
  );
}

export default function AssetsTable({ assets }) {
  const headers = [
    { key: "type", header: "Type" },
    { key: "category", header: "Category" },
    { key: "provider", header: "Provider" },
    { key: "totalCost", header: "Total Cost" },
    { key: "idlePercent", header: "Idle %" },
    { key: "adjustment", header: "Adjustment" }
  ];

  const rows = assets.map((asset, idx) => {
    const idlePercent = calculateIdlePercent(asset);
    const totalCost = Number(asset.totalCost ?? 0);
    const adjustment = Number(asset.adjustment ?? 0);

    return {
      id: `${idx}`,
      type: asset.type,
      category: asset.properties?.category || "N/A",
      provider: asset.properties?.provider || "N/A",
      totalCost: `$${totalCost.toFixed(2)}`,
      idlePercent: idlePercent !== null ? (
        <AssetIdleTag percent={idlePercent} />
      ) : "N/A",
      adjustment: `$${adjustment.toFixed(2)}`
    };
  });

  return (
    <DataTable rows={rows} headers={headers}>
      {({ 
        rows, 
        headers, 
        getTableProps, 
        getHeaderProps, 
        getRowProps,
        getToolbarProps,
        onInputChange
      }) => (
        <TableContainer title="All Assets">
          <TableToolbar {...getToolbarProps()}>
            <TableToolbarContent>
              <TableToolbarSearch 
                onChange={onInputChange}
                placeholder="Search assets..."
                persistent
              />
            </TableToolbarContent>
          </TableToolbar>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                <TableExpandHeader />
                {headers.map(header => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => {
                const { key, ...rowProps } = getRowProps({ row });
                const assetIndex = parseInt(row.id);
                const originalAsset = assets[assetIndex];

                return (
                  <React.Fragment key={row.id}>
                    <TableExpandRow key={key} {...rowProps}>
                      {row.cells.map(cell => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>

                    {row.isExpanded && (
                      <TableExpandedRow colSpan={headers.length + 1}>
                        <AssetDetailsPanel asset={originalAsset} />
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
}