import { useState, useMemo, Fragment } from "react";
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
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableSelectAll,
  TableSelectRow,
  TableBatchActions,
  TableBatchAction,
  Pagination,
  Tag,
} from "@carbon/react";
import { Export } from "@carbon/icons-react";
import {
  calculateUsage,
  getAssetStatus,
  formatCurrency,
  bytesToGB,
} from "../../utils/assetCalculations";

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

const headers = [
  { key: "name", header: "Asset Name" },
  { key: "cluster", header: "Cluster" },
  { key: "assetType", header: "Type" },
  { key: "storageClass", header: "Storage Class" },
  { key: "cost", header: "Monthly Cost" },
  { key: "usage", header: "Usage" },
  { key: "status", header: "Status" },
];

const AssetTable = ({ assets, totalAssets, filteredAssets, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rows = useMemo(() => {
    return assets.map((asset) => {
      const usage = calculateUsage(asset);
      const status = getAssetStatus(asset);

      return {
        id: asset.id,
        name: asset.name,
        cluster: asset.cluster,
        assetType: asset.assetType,
        storageClass: asset.storageClass || "-",
        cost: asset.totalCost || 0,
        costFormatted: formatCurrency(asset.totalCost || 0),
        usage: parseFloat(usage.usedPercentage),
        usageFormatted: `${usage.usedPercentage}%`,
        status: status.label,
        statusType: status.type,
        namespace: asset.claimNamespace,
        _asset: asset,
      };
    });
  }, [assets]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return rows.slice(startIndex, startIndex + pageSize);
  }, [rows, currentPage, pageSize]);

  const handlePaginationChange = ({ page, pageSize: newPageSize }) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const renderExpandedContent = (rowData) => {
    const asset = rowData._asset;
    const breakdown = asset.breakdown || {};
    const idle = ((breakdown.idle || 0) * 100).toFixed(1);
    const system = ((breakdown.system || 0) * 100).toFixed(1);
    const user = ((breakdown.user || 0) * 100).toFixed(1);
    const size = asset.bytes ? bytesToGB(asset.bytes) : null;

    return (
      <div className="expanded-row-content">
        <div className="expanded-detail">
          <strong>Size</strong>
          <span>{size != null ? `${size} GB` : "N/A"}</span>
        </div>
        <div className="expanded-detail">
          <strong>Breakdown</strong>
          <div className="expanded-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Idle</span>
              <span className="breakdown-value">{idle}%</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">System</span>
              <span className="breakdown-value">{system}%</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">User</span>
              <span className="breakdown-value">{user}%</span>
            </div>
          </div>
        </div>
        {rowData.namespace && (
          <div className="expanded-detail">
            <strong>Namespace</strong>
            <span>{rowData.namespace}</span>
          </div>
        )}
        <div className="expanded-detail">
          <strong>Cluster</strong>
          <span>{rowData.cluster}</span>
        </div>
      </div>
    );
  };

  const handleBatchExport = (selectedRows) => {
    const selectedAssets = selectedRows.map(row => {
      const asset = paginatedRows.find(r => r.id === row.id)?._asset;
      return asset;
    }).filter(Boolean);

    const csv = convertToCSV(selectedAssets);
    downloadCSV(csv, `assets-export-${Date.now()}.csv`);
  };

  const escapeCSVField = (field) => {
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const convertToCSV = (assetsList) => {
    const csvHeaders = ['Name', 'Type', 'Cluster', 'Storage Class', 'Size (GB)', 'Cost', 'Utilization', 'Status'];
    const csvRows = assetsList.map(asset => {
      const usage = calculateUsage(asset);
      const status = getAssetStatus(asset);
      return [
        asset.name,
        asset.assetType,
        asset.cluster,
        asset.storageClass || '-',
        bytesToGB(asset.bytes),
        asset.totalCost || 0,
        `${usage.usedPercentage}%`,
        status.label,
      ].map(escapeCSVField);
    });

    return [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="asset-table-carbon">
      <DataTable rows={paginatedRows} headers={headers} isSortable radio={false}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
          getExpandHeaderProps,
          getSelectionProps,
          getBatchActionProps,
          selectedRows,
        }) => (
          <TableContainer
            title="Asset Details"
            description={`Showing ${paginatedRows.length} of ${rows.length} assets${
              totalAssets > filteredAssets ? ` (filtered from ${totalAssets})` : ""
            }`}
            {...getTableContainerProps()}
          >
            <TableBatchActions {...getBatchActionProps()}>
              <TableBatchAction
                tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                renderIcon={Export}
                onClick={() => handleBatchExport(selectedRows)}
              >
                Export Selected
              </TableBatchAction>
            </TableBatchActions>

            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableSelectAll {...getSelectionProps()} />
                  <TableExpandHeader
                    aria-label="Expand all rows"
                    {...getExpandHeaderProps()}
                  />
                  {headers.map((header) => {
                    const { key, ...headerProps } = getHeaderProps({ header });
                    return (
                      <TableHeader
                        key={header.key}
                        {...headerProps}
                        isSortable
                      >
                        {header.header}
                      </TableHeader>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const rowData = paginatedRows.find((r) => r.id === row.id);
                  if (!rowData) return null;

                  const { key, ...rowProps } = getRowProps({ row });
                  return (
                    <Fragment key={row.id}>
                      <TableExpandRow {...rowProps}>
                        <TableSelectRow {...getSelectionProps({ row })} />
                        {row.cells.map((cell) => {
                          if (cell.info.header === "name") {
                            return (
                              <TableCell key={cell.id}>
                                <div
                                  onClick={() => onRowClick && onRowClick(rowData._asset)}
                                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                  className="asset-name-cell"
                                >
                                  <strong>{rowData.name}</strong>
                                  {rowData.namespace && (
                                    <div style={{ fontSize: "0.75rem", color: "var(--cds-text-secondary)" }}>
                                      ns: {rowData.namespace}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            );
                          }

                          if (cell.info.header === "assetType") {
                            const typeTagColor = {
                              "Node Disk": "blue",
                              PVC: "teal",
                              Unknown: "gray",
                            };
                            return (
                              <TableCell key={cell.id}>
                                <Tag type={typeTagColor[rowData.assetType] || "gray"} size="sm">
                                  {rowData.assetType}
                                </Tag>
                              </TableCell>
                            );
                          }

                          if (cell.info.header === "storageClass") {
                            return (
                              <TableCell key={cell.id}>
                                {rowData.storageClass !== "-" ? (
                                  <Tag type="cool-gray" size="sm">
                                    {rowData.storageClass}
                                  </Tag>
                                ) : (
                                  <span style={{ color: "var(--cds-text-placeholder)" }}>—</span>
                                )}
                              </TableCell>
                            );
                          }

                          if (cell.info.header === "cost") {
                            return (
                              <TableCell key={cell.id}>
                                <div style={{ textAlign: "right" }}>
                                  <strong>{rowData.costFormatted}</strong>
                                </div>
                              </TableCell>
                            );
                          }

                          if (cell.info.header === "usage") {
                            const meterColor =
                              rowData.usage >= 60
                                ? "var(--cds-support-success)"
                                : rowData.usage >= 20
                                ? "var(--cds-support-warning)"
                                : "var(--cds-support-error)";
                            return (
                              <TableCell key={cell.id}>
                                <div style={{ minWidth: "150px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      height: "8px",
                                      borderRadius: "4px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${Math.min(100, rowData.usage)}%`,
                                        backgroundColor: meterColor,
                                        transition: "width 0.3s",
                                      }}
                                    />
                                    <div style={{ flex: 1, backgroundColor: "var(--cds-border-subtle-01)" }} />
                                  </div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--cds-text-secondary)", marginTop: "4px" }}>
                                    {rowData.usageFormatted} used · {(100 - rowData.usage).toFixed(1)}% idle
                                  </div>
                                </div>
                              </TableCell>
                            );
                          }

                          if (cell.info.header === "status") {
                            return (
                              <TableCell key={cell.id}>
                                <Tag type={rowData.statusType} size="sm">
                                  {rowData.status}
                                </Tag>
                              </TableCell>
                            );
                          }

                          return <TableCell key={cell.id}>{cell.value}</TableCell>;
                        })}
                      </TableExpandRow>
                      <TableExpandedRow colSpan={headers.length + 2}>
                        {renderExpandedContent(rowData)}
                      </TableExpandedRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              page={currentPage}
              pageSize={pageSize}
              pageSizes={ITEMS_PER_PAGE_OPTIONS}
              totalItems={rows.length}
              onChange={handlePaginationChange}
            />
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

AssetTable.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      cluster: PropTypes.string.isRequired,
      assetType: PropTypes.string.isRequired,
      storageClass: PropTypes.string,
      claimNamespace: PropTypes.string,
      totalCost: PropTypes.number,
      bytes: PropTypes.number,
      breakdown: PropTypes.shape({
        idle: PropTypes.number,
        system: PropTypes.number,
        user: PropTypes.number,
      }),
    })
  ).isRequired,
  totalAssets: PropTypes.number,
  filteredAssets: PropTypes.number,
  onRowClick: PropTypes.func,
};

export default AssetTable;
