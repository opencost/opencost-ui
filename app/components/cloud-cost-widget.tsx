import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
} from "@carbon/react";
import { ScaleTypes } from "@carbon/charts";
import { SwitchableChart } from "./switchable-chart";
import { ChartTypeToggle, type ChartMode } from "./chart-type-toggle";
import CloudCostService from "~/services/cloud-cost";
import {
  toCurrency,
  checkCustomWindow,
  toVerboseTimeRange,
} from "~/lib/legacy-util";
import { primary, greyscale, browns } from "~/constants/colors";
import {
  CLOUD_WINDOW_OPTIONS,
  CLOUD_AGGREGATION_OPTIONS,
} from "~/constants/cloud-cost-options";
import {
  CloudFilterControls,
  DEFAULT_CLOUD_FILTERS,
  FilterableWidgetHeader,
} from "./scoped-views";

interface ChartPoint {
  group: string;
  key: string;
  value: number;
}

interface CloudGraphEntry {
  start?: string;
  end?: string;
  items?: { name?: string; value?: number; cost?: number }[];
}

interface CloudCostRow {
  name?: string;
  labelName?: string;
  kubernetesPercent?: number;
  cost?: number;
  [k: string]: unknown;
}

function toDateLabel(start?: string): string {
  if (!start) return "?";
  return new Date(start).toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

function getItemCost(item: { value?: number; cost?: number }): number {
  return item.value ?? item.cost ?? 0;
}

function buildChartData(
  graphData: CloudGraphEntry[],
  topN: number,
): ChartPoint[] {
  if (!Array.isArray(graphData)) return [];
  const points: ChartPoint[] = [];
  for (const entry of graphData) {
    if (!Array.isArray(entry.items) || entry.items.length === 0) continue;
    const date = toDateLabel(entry.start);
    const sorted = [...entry.items].sort(
      (a, b) => getItemCost(b) - getItemCost(a),
    );
    const top = sorted.slice(0, topN);
    const remainder = sorted.slice(topN);
    const otherCost = remainder.reduce(
      (sum, item) => sum + getItemCost(item),
      0,
    );

    for (const item of top) {
      points.push({
        group: date,
        key: item.name ?? "unknown",
        value: getItemCost(item),
      });
    }
    if (otherCost > 0) {
      points.push({ group: date, key: "other", value: otherCost });
    }
  }
  return points;
}

function buildColorScale(points: ChartPoint[]): Record<string, string> {
  const scale: Record<string, string> = {};
  const keys = [...new Set(points.map((p) => p.key))];
  let index = 0;
  for (const key of keys) {
    if (key === "other") {
      scale[key] = browns[0];
      continue;
    }
    if (key.toLowerCase().includes("idle")) {
      scale[key] = greyscale[2];
      continue;
    }
    scale[key] = primary[index++ % primary.length];
  }
  return scale;
}

function generateTitle(
  window: string,
  aggregateBy: string,
  costMetric: string,
): string {
  const winOpt = CLOUD_WINDOW_OPTIONS.find((o) => o.value === window);
  let windowName = winOpt?.name ?? "";
  if (windowName === "" && checkCustomWindow(window)) {
    windowName = toVerboseTimeRange(window) ?? window;
  }
  if (windowName === "") windowName = window;

  const aggOpt = CLOUD_AGGREGATION_OPTIONS.find((o) => o.value === aggregateBy);
  const aggregationName = (aggOpt?.name ?? aggregateBy).trim().toLowerCase();

  return `Cumulative cost for ${windowName} by ${aggregationName}`;
}

const headers = [
  { key: "name", header: "Name", isSortable: true },
  { key: "kubernetesPercent", header: "K8s Utilization", isSortable: true },
  { key: "cost", header: "Total cost", isSortable: true },
];

export interface CloudCostWidgetProps {
  window?: string;
  aggregateBy?: string;
  costMetric?: string;
  currency?: string;
}

export default function CloudCostWidget({
  window: windowProp,
  aggregateBy: aggregateByProp,
  costMetric: costMetricProp,
  currency: currencyProp,
}: CloudCostWidgetProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("bar");
  const [localFilters, setLocalFilters] = useState({
    window: DEFAULT_CLOUD_FILTERS.cloudWindow,
    aggregateBy: DEFAULT_CLOUD_FILTERS.cloudAggregateBy,
    costMetric: DEFAULT_CLOUD_FILTERS.cloudCostMetric,
    currency: DEFAULT_CLOUD_FILTERS.cloudCurrency,
  });
  const window = windowProp ?? localFilters.window;
  const aggregateBy = aggregateByProp ?? localFilters.aggregateBy;
  const costMetric = costMetricProp ?? localFilters.costMetric;
  const currency = currencyProp ?? localFilters.currency;
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [tableRows, setTableRows] = useState<CloudCostRow[]>([]);
  const [tableTotal, setTableTotal] = useState<CloudCostRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "cost",
    direction: "desc",
  });

  const title = generateTitle(window, aggregateBy, costMetric);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await CloudCostService.fetchCloudCostData(
          window,
          aggregateBy,
          costMetric,
          [],
        );
        if (!cancelled && resp) {
          setChartData(buildChartData(resp.graphData ?? [], 10));
          setTableRows(Array.isArray(resp.tableRows) ? resp.tableRows : []);
          setTableTotal(resp.tableTotal ?? null);
        } else if (!cancelled) {
          setChartData([]);
          setTableRows([]);
          setTableTotal(null);
        }
      } catch {
        if (!cancelled) {
          setChartData([]);
          setTableRows([]);
          setTableTotal(null);
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
    const list = [...tableRows];
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
  }, [tableRows, sortConfig]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageRows = sortedRows.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [
    window,
    aggregateBy,
    costMetric,
    totalRows,
    sortConfig.key,
    sortConfig.direction,
  ]);

  const chartOptions = useMemo(() => {
    const colorScale = buildColorScale(chartData);
    return {
      title: "",
      axes: {
        left: {
          mapsTo: "value",
          scaleType: ScaleTypes.LINEAR,
          ticks: {
            formatter: (v: number | Date) =>
              toCurrency(typeof v === "number" ? v : v.getTime(), currency),
          },
        },
        bottom: { mapsTo: "group", scaleType: ScaleTypes.LABELS },
      },
      data: { groupMapsTo: "key" },
      height: "300px",
      color: { scale: colorScale },
      bars: { maxWidth: 48, spacingFactor: 0.65 },
      tooltip: {
        totalLabel: "Total:",
        valueFormatter: (value: number) => toCurrency(value, currency),
        showTotal: true,
        groupLabel: "Date",
        alwaysShowRulerTooltip: true,
        customHTML: (data: any, defaultHTML: string) => {
          let items: any[] = [];
          if (Array.isArray(data)) items = data;
          else if (data?.value !== undefined || data?.label !== undefined)
            items = [data];
          else if (data?.data && Array.isArray(data.data)) items = data.data;
          if (items.length === 0) return defaultHTML;
          let total = 0;
          const lines = items
            .map((item: any) => {
              const val =
                typeof item.value === "number"
                  ? item.value
                  : parseFloat(item.value) || 0;
              total += val;
              const name =
                item.label ?? item.key ?? item.name ?? item.group ?? "—";
              const fill = item.fill ?? colorScale[name] ?? "#8d8d8d";
              return `<p style="margin:0 0 4px 0;font-size:0.875rem;display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${fill};flex-shrink:0"></span><span>${String(name)}: ${toCurrency(val, currency)}</span></p>`;
            })
            .join("");
          return `<div style="padding:8px 12px">${lines}<p style="margin:8px 0 0 0;font-size:0.875rem;font-weight:600;border-top:1px solid #e0e0e0;padding-top:6px">Total: ${toCurrency(total, currency)}</p></div>`;
        },
      },
    };
  }, [chartData, currency]);

  const setFilter = (key: keyof typeof localFilters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div id="cloud-cost" className="w-full">
      <FilterableWidgetHeader
        title="Cloud Cost"
        description={title}
        expanded={showFilters}
        onToggle={() => setShowFilters((s) => !s)}
        headerActions={
          <ChartTypeToggle mode={chartMode} onChange={setChartMode} />
        }
        filterContent={
          <CloudFilterControls
            window={window}
            aggregateBy={aggregateBy}
            costMetric={costMetric}
            currency={currency}
            onWindowChange={(v) => setFilter("window", v)}
            onAggregateByChange={(v) => setFilter("aggregateBy", v)}
            onCostMetricChange={(v) => setFilter("costMetric", v)}
            onCurrencyChange={(v) => setFilter("currency", v)}
            idPrefix="cloud-widget"
          />
        }
      />

      {/* Chart */}
      <div id="cloud-graph" className="mb-6">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-[#8d8d8d]">
            Loading…
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-[#8d8d8d]">
            No cloud cost data available.
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <SwitchableChart
              data={chartData}
              options={chartOptions}
              mode={chartMode}
              stacked
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div id="cloud-cost-table">
        {loading ? (
          <div className="p-8 text-center text-[#8d8d8d]">Loading…</div>
        ) : tableRows.length === 0 ? (
          <div className="p-8 text-center text-[#8d8d8d]">No results</div>
        ) : (
          <>
            <TableContainer>
              <Table size="md" useZebraStyles>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        key={header.key}
                        isSortable={header.isSortable}
                        sortDirection={
                          sortConfig.key === header.key
                            ? sortConfig.direction === "desc"
                              ? "DESC"
                              : "ASC"
                            : "NONE"
                        }
                        onClick={() =>
                          setSortConfig((prev) => ({
                            key: header.key,
                            direction:
                              prev.key === header.key &&
                              prev.direction === "desc"
                                ? "asc"
                                : "desc",
                          }))
                        }
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow className="font-semibold">
                    <TableCell>{tableTotal?.name || "Totals"}</TableCell>
                    <TableCell>
                      {Math.round(
                        (Number(tableTotal?.kubernetesPercent) ?? 0) * 100,
                      )}
                      %
                    </TableCell>
                    <TableCell>
                      {toCurrency(Number(tableTotal?.cost ?? 0), currency)}
                    </TableCell>
                  </TableRow>
                  {pageRows.map((row, index) => (
                    <TableRow
                      key={`${row.name ?? row.labelName ?? "row"}-${startIndex + index}`}
                    >
                      <TableCell>
                        <span className="text-[#0f62fe] cursor-pointer">
                          {String(row.labelName ?? row.name ?? "")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {Math.round((Number(row.kubernetesPercent) || 0) * 100)}
                        %
                      </TableCell>
                      <TableCell>
                        {toCurrency(Number(row.cost ?? 0), currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Pagination
                backwardText="Previous"
                forwardText="Next"
                itemsPerPageText="Rows per page:"
                page={page}
                pageNumberText="Page"
                pageSize={pageSize}
                pageSizes={[10, 25, 50]}
                totalItems={totalRows}
                onChange={({
                  page: nextPage,
                  pageSize: nextPageSize,
                }: {
                  page?: number;
                  pageSize?: number;
                }) => {
                  if (nextPage !== undefined) setPage(nextPage);
                  if (nextPageSize !== undefined) setPageSize(nextPageSize);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
