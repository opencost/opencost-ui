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

const AssetTable = ({ data, isLoading, currency = "USD" }) => {
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
    { key: "providerID", header: "Provider ID" },
    { key: "cpuCost", header: "CPU Cost" },
    { key: "ramCost", header: "RAM Cost" },
    { key: "gpuCost", header: "GPU Cost" },
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
    providerID: asset.providerID,
    cpuCost: asset.cpuCost,
    ramCost: asset.ramCost,
    gpuCost: asset.gpuCost,
    totalCost: asset.totalCost,
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
                return (
                  <TableRow key={row.id} {...rowProps}>
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

                      // Format cost columns as currency
                      if (
                        ["cpuCost", "ramCost", "gpuCost", "totalCost"].includes(
                          cell.info.header
                        )
                      ) {
                        cellContent = formatCurrency(cell.value);
                      }

                      // Truncate long provider IDs
                      if (cell.info.header === "providerID") {
                        const maxLength = 40;
                        if (cell.value && cell.value.length > maxLength) {
                          cellContent = (
                            <span title={cell.value}>
                              {cell.value.substring(0, maxLength)}...
                            </span>
                          );
                        }
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
      providerID: PropTypes.string,
      cpuCost: PropTypes.number,
      ramCost: PropTypes.number,
      gpuCost: PropTypes.number,
      totalCost: PropTypes.number.isRequired,
    })
  ).isRequired,
  /** Loading state for skeleton display */
  isLoading: PropTypes.bool,
  /** Currency code for formatting */
  currency: PropTypes.string,
};

AssetTable.defaultProps = {
  isLoading: false,
  currency: "USD",
};

export default AssetTable;
