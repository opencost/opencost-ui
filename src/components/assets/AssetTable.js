import { useState, useMemo } from "react";
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
  Pagination,
  Tag,
} from "@carbon/react";
import {
  calculateUsage,
  getAssetStatus,
  formatCurrency,
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

const AssetTable = ({ assets, totalAssets, filteredAssets }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.cluster.toLowerCase().includes(term) ||
        (row.namespace && row.namespace.toLowerCase().includes(term))
    );
  }, [rows, searchTerm]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const handlePaginationChange = ({ page, pageSize: newPageSize }) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  return (
    <div className="asset-table-carbon">
      <DataTable rows={paginatedRows} headers={headers} isSortable>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            title="Asset Details"
            description={`Showing ${paginatedRows.length} of ${filteredRows.length} assets${
              totalAssets > filteredAssets ? ` (filtered from ${totalAssets})` : ""
            }`}
            {...getTableContainerProps()}
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Search assets..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                />
              </TableToolbarContent>
            </TableToolbar>

            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
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
                    <TableRow key={row.id} {...rowProps}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === "name") {
                          return (
                            <TableCell key={cell.id}>
                              <div>
                                <strong>{rowData.name}</strong>
                                {rowData.namespace && (
                                  <div style={{ fontSize: "0.75rem", color: "#525252" }}>
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
                                <Tag type="high-contrast" size="sm">
                                  {rowData.storageClass}
                                </Tag>
                              ) : (
                                <span style={{ color: "#a8a8a8" }}>—</span>
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
                              ? "#24a148"
                              : rowData.usage >= 20
                              ? "#ff832b"
                              : "#da1e28";
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
                                  <div style={{ flex: 1, backgroundColor: "#e0e0e0" }} />
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#525252", marginTop: "4px" }}>
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              page={currentPage}
              pageSize={pageSize}
              pageSizes={ITEMS_PER_PAGE_OPTIONS}
              totalItems={filteredRows.length}
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
};

export default AssetTable;
