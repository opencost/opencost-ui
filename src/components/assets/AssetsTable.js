import React, { useMemo, useState } from "react";
import { Tag } from "@carbon/react";
import { toCurrency } from "../../util";
import { stableSort, getComparator, getAssetColor } from "./assetUtils";

const headers = [
  { key: "name", label: "Name", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "provider", label: "Provider", sortable: true },
  { key: "cluster", label: "Cluster", sortable: true },
  { key: "totalCost", label: "Total Cost", sortable: true },
];

const typeTagColor = {
  Node: "blue",
  Disk: "green",
  LoadBalancer: "purple",
  Network: "teal",
  ClusterManagement: "warm-gray",
  Cloud: "red",
};

const AssetsTable = ({ assets, onRowClick }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("totalCost");
  const [sortDir, setSortDir] = useState("desc");

  const searched = useMemo(() => {
    if (!searchTerm) return assets;
    const term = searchTerm.toLowerCase();
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.type.toLowerCase().includes(term) ||
        a.provider.toLowerCase().includes(term) ||
        a.cluster.toLowerCase().includes(term),
    );
  }, [assets, searchTerm]);

  const sorted = useMemo(
    () => stableSort(searched, getComparator(sortDir, sortKey)),
    [searched, sortKey, sortDir],
  );

  const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(searched.length / pageSize));

  // Reset to first page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [searchTerm, assets]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortArrow = (key) => {
    if (sortKey !== key) return "";
    return sortDir === "desc" ? " \u25BC" : " \u25B2";
  };

  return (
    <div className="assets-table-section">
      <div className="assets-table-toolbar">
        <div className="assets-table-title">Infrastructure Assets</div>
        <input
          className="assets-table-search"
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => h.sortable && handleSort(h.key)}
                style={{
                  padding: "0.75rem 1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  background: "#e0e0e0",
                  borderBottom: "1px solid #c6c6c6",
                  cursor: h.sortable ? "pointer" : "default",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {h.label}
                {sortArrow(h.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 && (
            <tr>
              <td
                colSpan={headers.length}
                style={{ padding: "2rem", textAlign: "center", color: "#525252" }}
              >
                No assets found
              </td>
            </tr>
          )}
          {pageRows.map((asset) => (
            <tr
              key={asset.key}
              onClick={() => onRowClick(asset)}
              style={{ cursor: "pointer", borderBottom: "1px solid #e0e0e0" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e8e8e8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <td style={{ padding: "0.625rem 1rem", fontSize: "0.875rem" }}>
                {asset.name}
              </td>
              <td style={{ padding: "0.625rem 1rem", fontSize: "0.875rem" }}>
                <Tag
                  type={typeTagColor[asset.type] || "gray"}
                  size="sm"
                >
                  {asset.type}
                </Tag>
              </td>
              <td style={{ padding: "0.625rem 1rem", fontSize: "0.875rem" }}>
                {asset.category}
              </td>
              <td style={{ padding: "0.625rem 1rem", fontSize: "0.875rem" }}>
                {asset.provider}
              </td>
              <td style={{ padding: "0.625rem 1rem", fontSize: "0.875rem" }}>
                {asset.cluster}
              </td>
              <td
                style={{
                  padding: "0.625rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {toCurrency(asset.totalCost, "USD")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="assets-pagination">
        <div>
          Showing {searched.length === 0 ? 0 : page * pageSize + 1}
          {" - "}
          {Math.min((page + 1) * pageSize, searched.length)} of{" "}
          {searched.length}
        </div>
        <div className="assets-pagination-controls">
          <span>Rows per page:</span>
          <select
            className="assets-pagination-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            {[10, 25, 50].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            className="assets-pagination-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="assets-pagination-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AssetsTable);
