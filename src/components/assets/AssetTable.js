import React, { useState } from "react";
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
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableBatchActions,
  TableBatchAction,
  TableSelectAll,
  TableSelectRow,
  Tag,
  DataTableSkeleton,
  Button,
  Tooltip,
} from "@carbon/react";
import { Download, Information } from "@carbon/icons-react";

/**
 * AssetTable - Professional data table following IBM Carbon Design standards
 * Includes TableToolbar with search and batch actions, sorting, and proper formatting
 */

// Map asset types to cool-gray tag colors per IBM guidelines
const typeColors = {
  Node: "cool-gray",
  Disk: "cool-gray",
  Network: "cool-gray",
  LoadBalancer: "cool-gray",
  ClusterManagement: "cool-gray",
  SharedAsset: "cool-gray",
};

const AssetTable = ({ data, isLoading, currency = "USD", onRowClick, onExport }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Table headers configuration with alignment info
  const headers = [
    { key: "name", header: "Name", align: "left" },
    { key: "type", header: "Type", align: "left" },
    { key: "cpuCores", header: "CPU Cores", align: "right" },
    { key: "ramGB", header: "RAM (GB)", align: "right" },
    { key: "preemptible", header: "Pricing", align: "left", hasTooltip: true, tooltipText: "Pricing estimates based on public cloud rates" },
    { key: "cpuCost", header: "CPU Cost", align: "right" },
    { key: "ramCost", header: "RAM Cost", align: "right" },
    { key: "totalCost", header: "Total Cost", align: "right" },
  ];

  // Render header content with optional tooltip
  const renderHeaderContent = (header) => {
    if (header.hasTooltip) {
      return (
        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {header.header}
          <Tooltip align="top" label={header.tooltipText}>
            <button type="button" className="cds--tooltip__trigger" style={{ background: "none", border: "none", padding: 0, cursor: "help" }}>
              <Information size={16} />
            </button>
          </Tooltip>
        </span>
      );
    }
    return header.header;
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={headers.length}
        rowCount={5}
        headers={headers}
        showHeader
        showToolbar
      />
    );
  }

  // Filter data based on search term
  const filteredData = data?.filter((asset) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      asset.name?.toLowerCase().includes(searchLower) ||
      asset.type?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <TableContainer title="Asset Details">
        <TableToolbar>
          <TableToolbarContent>
            <TableToolbarSearch
              placeholder="Search assets..."
              onChange={(e) => setSearchTerm(e.target.value || "")}
            />
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Download}
              onClick={onExport}
              disabled={!onExport}
            >
              Export CSV
            </Button>
          </TableToolbarContent>
        </TableToolbar>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader 
                  key={header.key}
                  style={{ textAlign: header.align }}
                >
                  {header.header}
                </TableHeader>
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
                    color: "var(--cds-text-secondary, var(--text-tertiary))",
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
  const rows = filteredData.map((asset) => ({
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

  // Handle batch export action
  const handleBatchExport = (selectedRows) => {
    if (onExport) {
      const selectedIds = selectedRows.map((row) => row.id);
      const selectedData = data.filter((asset) => selectedIds.includes(asset.id));
      onExport(selectedData);
    }
  };

  return (
    <DataTable rows={rows} headers={headers} isSortable>
      {({
        rows,
        headers,
        getTableProps,
        getHeaderProps,
        getRowProps,
        getTableContainerProps,
        getToolbarProps,
        getBatchActionProps,
        getSelectionProps,
        selectedRows,
        onInputChange,
      }) => {
        const batchActionProps = getBatchActionProps();
        
        return (
          <TableContainer 
            title="Asset Details" 
            description={`Showing ${rows.length} of ${data.length} assets`}
            {...getTableContainerProps()}
          >
            <TableToolbar {...getToolbarProps()}>
              <TableBatchActions {...batchActionProps}>
                <TableBatchAction
                  tabIndex={batchActionProps.shouldShowBatchActions ? 0 : -1}
                  renderIcon={Download}
                  onClick={() => handleBatchExport(selectedRows)}
                >
                  Export CSV
                </TableBatchAction>
              </TableBatchActions>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Search assets..."
                  persistent
                  onChange={(e) => {
                    setSearchTerm(e.target.value || "");
                    onInputChange(e);
                  }}
                />
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={Download}
                  onClick={() => onExport && onExport(data)}
                  disabled={!onExport}
                >
                  Export CSV
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableSelectAll {...getSelectionProps()} />
                  {headers.map((header) => {
                    const { key, ...headerProps } = getHeaderProps({ header });
                    const isNumeric = ["cpuCores", "ramGB", "cpuCost", "ramCost", "totalCost"].includes(header.key);
                    return (
                      <TableHeader 
                        key={header.key} 
                        {...headerProps}
                        style={{ 
                          textAlign: isNumeric ? "center" : "left",
                        }}
                      >
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
                      <TableSelectRow {...getSelectionProps({ row })} />
                      {row.cells.map((cell) => {
                        let cellContent = cell.value;
                        const isNumeric = ["cpuCores", "ramGB", "cpuCost", "ramCost", "totalCost"].includes(cell.info.header);

                        // Render type as a cool-gray tag
                        if (cell.info.header === "type") {
                          cellContent = (
                            <Tag type="cool-gray" size="sm">
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
                              <Tag type="teal" size="sm">
                                Spot
                              </Tag>
                            );
                          } else if (cell.value === false) {
                            cellContent = (
                              <Tag type="cool-gray" size="sm">
                                On-Demand
                              </Tag>
                            );
                          } else {
                            cellContent = "-";
                          }
                        }

                        // Format cost columns as currency
                        if (["cpuCost", "ramCost", "totalCost"].includes(cell.info.header)) {
                          cellContent = formatCurrency(cell.value);
                        }

                        return (
                          <TableCell 
                            key={cell.id}
                            style={{                               textAlign: isNumeric ? "center" : "left",
                            }}
                          >
                            {cellContent}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }}
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
  /** Callback for export action */
  onExport: PropTypes.func,
};

AssetTable.defaultProps = {
  isLoading: false,
  currency: "USD",
  onRowClick: null,
  onExport: null,
};

export default AssetTable;
