import React from "react";
import PropTypes from "prop-types";
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  Tag,
  DataTableSkeleton,
} from "@carbon/react";

/**
 * AssetTable - Data table displaying detailed asset information
 * Uses Carbon DataTable with sorting capabilities
 */

// Map asset types to tag colors
const typeColors = {
  Node: "blue",
  Disk: "purple",
  Network: "teal",
  LoadBalancer: "cyan",
  ClusterManagement: "magenta",
  SharedAsset: "gray",
};

const AssetTable = ({ data, isLoading, currency = "USD", onRowClick }) => {
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Table headers configuration
  const headers = [
    { key: "name", header: "Name" },
    { key: "type", header: "Type" },
    { key: "cpuCores", header: "CPU Cores" },
    { key: "ramGB", header: "RAM (GB)" },
    { key: "preemptible", header: "Pricing" },
    { key: "cpuCost", header: "CPU Cost" },
    { key: "ramCost", header: "RAM Cost" },
    { key: "totalCost", header: "Total Cost" },
  ];

  // Show skeleton while loading
  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={headers.length}
        rowCount={5}
        headers={headers}
        showHeader
        showToolbar={false}
      />
    );
  }

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <TableContainer title="Asset Details">
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader key={header.key}>{header.header}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={headers.length}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--text-tertiary)",
                  }}
                >
                  No assets found for the selected time window
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Prepare rows for DataTable
  const rows = data.map((asset) => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    cpuCores: asset.cpuCores,
    ramGB: asset.ramGB,
    preemptible: asset.preemptible,
    cpuCost: asset.cpuCost,
    ramCost: asset.ramCost,
    totalCost: asset.totalCost,
    _rawAsset: asset._rawAsset,
  }));

  return (
    <DataTable rows={rows} headers={headers} isSortable>
      {({
        rows,
        headers,
        getTableProps,
        getHeaderProps,
        getRowProps,
        getTableContainerProps,
      }) => (
        <TableContainer title="Asset Details" {...getTableContainerProps()}>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => {
                  const { key, ...headerProps } = getHeaderProps({ header });
                  return (
                    <TableHeader key={header.key} {...headerProps}>
                      {header.header}
                    </TableHeader>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const { key, ...rowProps } = getRowProps({ row });
                const originalAsset = data.find((d) => d.id === row.id);
                return (
                  <TableRow
                    key={row.id}
                    {...rowProps}
                    onClick={() => onRowClick && onRowClick(originalAsset)}
                    style={{ cursor: onRowClick ? "pointer" : "default" }}
                  >
                    {row.cells.map((cell) => {
                      let cellContent = cell.value;

                      // Render type as a colored tag
                      if (cell.info.header === "type") {
                        const tagColor = typeColors[cell.value] || "gray";
                        cellContent = (
                          <Tag type={tagColor} size="sm">
                            {cell.value}
                          </Tag>
                        );
                      }

                      // Format CPU Cores
                      if (cell.info.header === "cpuCores") {
                        cellContent = cell.value > 0 ? cell.value : "-";
                      }

                      // Format RAM GB
                      if (cell.info.header === "ramGB") {
                        cellContent = cell.value > 0 ? `${cell.value.toFixed(1)} GB` : "-";
                      }

                      // Render preemptible/pricing as a tag
                      if (cell.info.header === "preemptible") {
                        if (cell.value === true) {
                          cellContent = (
                            <Tag type="cyan" size="sm">
                              Spot
                            </Tag>
                          );
                        } else if (cell.value === false) {
                          cellContent = (
                            <Tag type="gray" size="sm">
                              On-Demand
                            </Tag>
                          );
                        } else {
                          cellContent = "-";
                        }
                      }

                      // Format cost columns as currency
                      if (
                        ["cpuCost", "ramCost", "totalCost"].includes(
                          cell.info.header
                        )
                      ) {
                        cellContent = formatCurrency(cell.value);
                      }

                      return <TableCell key={cell.id}>{cellContent}</TableCell>;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};

AssetTable.propTypes = {
  /** Array of asset data for table rows */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      cpuCores: PropTypes.number,
      ramGB: PropTypes.number,
      preemptible: PropTypes.bool,
      cpuCost: PropTypes.number,
      ramCost: PropTypes.number,
      totalCost: PropTypes.number.isRequired,
    })
  ).isRequired,
  /** Loading state for skeleton display */
  isLoading: PropTypes.bool,
  /** Currency code for formatting */
  currency: PropTypes.string,
  /** Callback when a row is clicked */
  onRowClick: PropTypes.func,
};

AssetTable.defaultProps = {
  isLoading: false,
  currency: "USD",
  onRowClick: null,
};

export default AssetTable;
