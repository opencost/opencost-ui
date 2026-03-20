import { useEffect, useMemo, useState } from "react";
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@carbon/react";
import CloudCostService from "~/services/cloud-cost";
import { toCurrency } from "~/lib/legacy-util";

interface CloudCostRow {
  name?: string;
  labelName?: string;
  kubernetesPercent?: number;
  cost?: number;
  [k: string]: unknown;
}

const headers = [
  { key: "name", header: "Name", isSortable: true },
  { key: "kubernetesPercent", header: "K8s Utilization", isSortable: true },
  { key: "cost", header: "Total cost", isSortable: true },
];

export interface CloudCostTableWidgetProps {
  window?: string;
  aggregateBy?: string;
  costMetric?: string;
  currency?: string;
}

export default function CloudCostTableWidget({
  window = "7d",
  aggregateBy = "service",
  costMetric = "AmortizedNetCost",
  currency = "USD",
}: CloudCostTableWidgetProps) {
  const [rows, setRows] = useState<CloudCostRow[]>([]);
  const [totals, setTotals] = useState<CloudCostRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "cost",
    direction: "desc",
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await CloudCostService.fetchCloudCostData(window, aggregateBy, costMetric, []);
        if (!cancelled) {
          setRows(Array.isArray(resp?.tableRows) ? resp.tableRows : []);
          setTotals(resp?.tableTotal ?? null);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setTotals(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [window, aggregateBy, costMetric]);

  const sortedRows = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      if (sortConfig.key === "name") {
        const aName = String(a.labelName ?? a.name ?? "").toLowerCase();
        const bName = String(b.labelName ?? b.name ?? "").toLowerCase();
        if (aName < bName) return sortConfig.direction === "asc" ? -1 : 1;
        if (aName > bName) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }
      const aVal = Number(a[sortConfig.key] ?? 0);
      const bVal = Number(b[sortConfig.key] ?? 0);
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [rows, sortConfig]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageRows = sortedRows.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [window, aggregateBy, costMetric, totalRows, sortConfig.key, sortConfig.direction]);

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "#8d8d8d" }}>Loading...</div>;
  }

  if (rows.length === 0) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "#8d8d8d" }}>No cloud cost data available.</div>;
  }

  return (
    <div style={{ width: "100%" }}>
      <TableContainer>
        <Table size="md" useZebraStyles>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader
                  key={header.key}
                  isSortable={header.isSortable}
                  sortDirection={sortConfig.key === header.key ? (sortConfig.direction === "desc" ? "DESC" : "ASC") : "NONE"}
                  onClick={() =>
                    setSortConfig((prev) => ({
                      key: header.key,
                      direction: prev.key === header.key && prev.direction === "desc" ? "asc" : "desc",
                    }))
                  }
                >
                  {header.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow style={{ fontWeight: 600 }}>
              <TableCell>{totals?.name || "Totals"}</TableCell>
              <TableCell>{Math.round((totals?.kubernetesPercent ?? 0) * 100)}%</TableCell>
              <TableCell>{toCurrency(Number(totals?.cost ?? 0), currency)}</TableCell>
            </TableRow>
            {pageRows.map((row, index) => (
              <TableRow key={`${row.name ?? row.labelName ?? "row"}-${startIndex + index}`}>
                <TableCell>{String(row.labelName ?? row.name ?? "")}</TableCell>
                <TableCell>{Math.round((Number(row.kubernetesPercent) || 0) * 100)}%</TableCell>
                <TableCell>{toCurrency(Number(row.cost ?? 0), currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Pagination
          backwardText="Previous"
          forwardText="Next"
          itemsPerPageText="Items per page:"
          page={page}
          pageNumberText="Page"
          pageSize={pageSize}
          pageSizes={[10, 25, 50]}
          totalItems={totalRows}
          onChange={({ page: nextPage, pageSize: nextPageSize }: { page?: number; pageSize?: number }) => {
            if (nextPage !== undefined) setPage(nextPage);
            if (nextPageSize !== undefined) setPageSize(nextPageSize);
          }}
        />
      )}
    </div>
  );
}
