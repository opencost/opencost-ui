import * as React from "react";
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
  Tag,
  Button,
} from "@carbon/react";
import { ChevronDown, ChevronUp } from "@carbon/icons-react";
import { toCurrency } from "../../util";
import { formatBytes, formatMinutes } from "./tokens";

const TYPE_COLORS = {
  Node: "#0f62fe",
  Disk: "#8a3ffc",
  Network: "#0072c3",
  LoadBalancer: "#198038",
  Management: "#fa4d56",
  Other: "#878d96",
};

/**
 * AssetTable - Professional data table with comprehensive asset information
 * Includes search, pagination, and formatted cost display
 */
const AssetTable = ({ assets, assetType, currency, loading, onAssetClick }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  // Prepare rows with formatted data for professional presentation
  const rows = React.useMemo(() => {
    if (!assets) return [];
    
    const filtered = searchQuery
      ? assets.filter((asset) =>
          asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.properties?.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.properties?.cluster?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : assets;

    return filtered.map((asset, index) => ({
      id: `${asset.name}-${index}`,
      name: asset.name || "Unknown",
      provider: asset.properties?.provider || "-",
      cluster: asset.properties?.cluster || "-",
      totalCost: asset.totalCost || 0,
      totalCostFormatted: toCurrency(asset.totalCost || 0, currency),
      adjustment: asset.adjustment || 0,
      adjustmentFormatted: toCurrency(asset.adjustment || 0, currency),
      type: assetType,
      asset, // Store full asset for click handler
    }));
  }, [assets, assetType, searchQuery, currency]);

  const paginatedRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  // Define headers with professional formatting
  const headers = [
    { key: "name", header: "Asset Name" },
    { key: "provider", header: "Cloud Provider" },
    { key: "cluster", header: "Cluster" },
    { key: "totalCostFormatted", header: "Total Cost" },
    { key: "adjustmentFormatted", header: "Cost Adjustment" },
  ];

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#525252" }}>
        <div style={{ marginBottom: "1rem" }}>Loading asset data...</div>
        <div style={{ fontSize: "0.875rem" }}>Please wait while we fetch your infrastructure costs</div>
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div style={{ padding: "3rem", backgroundColor: "#f4f4f4", borderRadius: "4px", textAlign: "center" }}>
        <h4 style={{ margin: 0, marginBottom: "0.5rem", color: "#161616" }}>No Assets Found</h4>
        <p style={{ margin: 0, color: "#525252" }}>
          No {assetType.toLowerCase()} assets found for this time period. Try adjusting your filters or time window.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f4f4f4", borderRadius: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#161616", marginBottom: "0.25rem" }}>
              {assetType} Assets
            </h4>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#525252" }}>
              Showing {paginatedRows.length} of {rows.length} assets
            </p>
          </div>
          {searchQuery && (
            <div style={{ fontSize: "0.875rem", color: "#525252" }}>
              Filtered results for "<strong>{searchQuery}</strong>"
            </div>
          )}
        </div>
      </div>
      
      <DataTable rows={paginatedRows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getToolbarProps,
          onInputChange,
        }) => (
          <>
            <TableToolbar {...getToolbarProps()}>
              <TableToolbarContent>
                <TableToolbarSearch
                  onChange={(e) => {
                    onInputChange(e);
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder={`Search by name, provider, or cluster...`}
                  persistent
                />
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
                  <TableHeader>Details</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, rowIndex) => {
                  const rowData = paginatedRows[rowIndex];
                  const { key, ...rowProps } = getRowProps({ row });
                  return (
                    <TableRow key={key} {...rowProps}>
                      <TableCell>
                        <div style={{ fontWeight: 500 }}>
                          {rowData.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tag type="blue" size="sm">
                          {rowData.provider}
                        </Tag>
                      </TableCell>
                      <TableCell>{rowData.cluster}</TableCell>
                      <TableCell>
                        <strong style={{ color: "#161616" }}>
                          {rowData.totalCostFormatted}
                        </strong>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: rowData.adjustment > 0 ? "#24a148" : rowData.adjustment < 0 ? "#da1e28" : "#525252" }}>
                          {rowData.adjustmentFormatted}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          kind="ghost"
                          size="sm"
                          onClick={() => onAssetClick(rowData.asset)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination
              totalItems={rows.length}
              page={page}
              pageSize={pageSize}
              pageSizes={[10, 25, 50, 100]}
              onChange={({ page: newPage, pageSize: newPageSize }) => {
                setPage(newPage);
                setPageSize(newPageSize);
              }}
            />
          </>
        )}
      </DataTable>
    </div>
  );
};

export default AssetTable;
