import { useEffect, useState, useMemo } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
} from "@carbon/react";
import { Close } from "@carbon/icons-react";
import { get, round, toArray, sortBy, reverse } from "lodash";
import AllocationService from "~/services/allocation";
import {
  rangeToCumulative,
  cumulativeToTotals,
  toCurrency,
  checkCustomWindow,
  toVerboseTimeRange,
} from "~/lib/legacy-util";
import {
  ALLOCATION_WINDOW_OPTIONS,
  ALLOCATION_AGGREGATE_OPTIONS,
  AllocationFilterControls,
  FilterableWidgetHeader,
} from "./scoped-views";
import { useAllocationFilters } from "./allocation-filters-context";

function generateTitle(
  window: string,
  aggregateBy: string,
  accumulate: boolean,
): string {
  const winOpt = ALLOCATION_WINDOW_OPTIONS.find((o) => o.value === window);
  let windowName = winOpt?.name ?? "";
  if (windowName === "" && checkCustomWindow(window)) {
    windowName = toVerboseTimeRange(window) ?? window;
  }
  if (windowName === "") windowName = window;
  const aggOpt = ALLOCATION_AGGREGATE_OPTIONS.find(
    (o) => o.value === aggregateBy,
  );
  const aggregationName = (aggOpt?.name ?? aggregateBy).toLowerCase();
  let str = `${windowName} by ${aggregationName}`;
  if (!accumulate) str = `${str} daily`;
  return str;
}

const drilldownHierarchy: Record<string, string> = {
  namespace: "controllerKind",
  controllerKind: "controller",
  controller: "pod",
  pod: "container",
};

const filterPropertyMap: Record<string, string> = {
  namespace: "namespace",
  controllerKind: "controllerKind",
  controller: "controllerName",
  pod: "pod",
  container: "container",
};

const headers = [
  { key: "name", header: "Name", isSortable: true },
  { key: "cpuCost", header: "CPU", isSortable: true },
  { key: "gpuCost", header: "GPU", isSortable: true },
  { key: "ramCost", header: "RAM", isSortable: true },
  { key: "pvCost", header: "PV", isSortable: true },
  { key: "totalEfficiency", header: "Efficiency", isSortable: true },
  { key: "totalCost", header: "Total cost", isSortable: true },
];

export interface CostAllocationTableProps {
  title?: string;
  description?: string;
  window?: string;
  aggregateBy?: string;
  accumulate?: boolean;
  includeIdle?: boolean;
  currency?: string;
  useSharedFilters?: boolean;
}

export default function CostAllocationTable({
  title = "Allocation Breakdown",
  description = "Cost allocation breakdown by cluster, namespace, pod, or other dimension",
  window: windowProp,
  aggregateBy: globalAggregateByProp,
  accumulate: accumulateProp,
  includeIdle: includeIdleProp,
  currency: currencyProp,
  useSharedFilters = false,
}: CostAllocationTableProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [sharedFilters, setSharedFilters] =
    useAllocationFilters(useSharedFilters);
  const window = windowProp ?? sharedFilters.window;
  const globalAggregateBy = globalAggregateByProp ?? sharedFilters.aggregateBy;
  const accumulate = accumulateProp ?? sharedFilters.accumulate;
  const includeIdle = includeIdleProp ?? sharedFilters.includeIdle;
  const currency = currencyProp ?? sharedFilters.currency ?? "USD";

  const [localDrilldownFilters, setLocalDrilldownFilters] = useState<
    { property: string; value: string }[]
  >([]);
  const [effectiveAggregateBy, setEffectiveAggregateBy] =
    useState(globalAggregateBy);
  const drilldownFilters = useSharedFilters
    ? (sharedFilters.drilldownFilters ?? [])
    : localDrilldownFilters;

  const setDrilldownFilters = (
    filters: { property: string; value: string }[],
  ) => {
    if (useSharedFilters) {
      setSharedFilters((prev) => ({ ...prev, drilldownFilters: filters }));
      return;
    }
    setLocalDrilldownFilters(filters);
  };

  const setDrilldownAggregateBy = (nextAggregateBy: string | undefined) => {
    if (!useSharedFilters) return;
    setSharedFilters((prev) => ({
      ...prev,
      drilldownAggregateBy: nextAggregateBy,
    }));
  };

  // Sync effective aggregate when global changes; reset drilldown
  useEffect(() => {
    setEffectiveAggregateBy(globalAggregateBy);
    setDrilldownFilters([]);
    setDrilldownAggregateBy(undefined);
  }, [globalAggregateBy]);

  const aggregateBy = effectiveAggregateBy;
  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "totalCost", direction: "desc" });

  const dataTitle = generateTitle(window, aggregateBy, accumulate);

  const cumulativeData = useMemo(() => {
    const cumulative = rangeToCumulative(allocationData, aggregateBy);
    return cumulative ? toArray(cumulative) : [];
  }, [allocationData, aggregateBy]);

  const totalData = useMemo(() => {
    const cumulative = rangeToCumulative(allocationData, aggregateBy);
    return cumulative ? cumulativeToTotals(cumulative) : {};
  }, [allocationData, aggregateBy]);

  const sortedRows = useMemo(() => {
    const sorted = sortBy(cumulativeData, (r) => {
      const v = get(r, sortConfig.key);
      return typeof v === "number" ? v : (v ?? "");
    });
    return sortConfig.direction === "desc" ? reverse(sorted) : sorted;
  }, [cumulativeData, sortConfig]);

  const pageStart = (page - 1) * pageSize;
  const pageRows = sortedRows.slice(pageStart, pageStart + pageSize);
  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await AllocationService.fetchAllocation(
          window,
          aggregateBy,
          {
            accumulate,
            includeIdle,
            filters: drilldownFilters.length > 0 ? drilldownFilters : undefined,
          },
        );
        const raw = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp)
            ? resp
            : [];
        if (!cancelled && raw.length > 0) {
          const sorted = sortBy(raw, (set: any) => {
            const arr = Object.values(set) as any[];
            return arr[0]?.window?.start ?? "";
          });
          setAllocationData(sorted);
        } else {
          setAllocationData([]);
        }
      } catch {
        setAllocationData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [window, aggregateBy, accumulate, includeIdle, drilldownFilters]);

  useEffect(() => {
    setPage(1);
  }, [totalRows, sortConfig.key, sortConfig.direction]);

  function handleDrilldown(row: any) {
    const isIdle = String(row.name).indexOf("__idle__") >= 0;
    const isUnallocated = String(row.name).indexOf("__unallocated__") >= 0;
    const isUnmounted = row.name === "Unmounted PVs";
    const hasNextLevel = drilldownHierarchy[aggregateBy];
    if (
      isIdle ||
      isUnallocated ||
      isUnmounted ||
      !hasNextLevel ||
      !row.name?.trim()
    )
      return;

    const nextAgg = drilldownHierarchy[aggregateBy];
    const filterProperty = filterPropertyMap[aggregateBy];
    let filterValue = String(row.name).trim();

    let updatedFilters = [...drilldownFilters];
    if (aggregateBy === "controller" && filterValue.includes(":")) {
      const parts = filterValue.split(":");
      const maybeKind = parts[0]?.trim() ?? "";
      const trimmedName = parts.slice(1).join(":").trim();
      if (trimmedName) filterValue = trimmedName;
      if (
        maybeKind &&
        !updatedFilters.some((f) => f.property === "controllerKind")
      ) {
        updatedFilters = [
          ...updatedFilters,
          { property: "controllerKind", value: maybeKind },
        ];
      }
    }

    const newFilters = [
      ...updatedFilters,
      { property: filterProperty, value: filterValue },
    ];
    setDrilldownFilters(newFilters);
    setEffectiveAggregateBy(nextAgg);
    setDrilldownAggregateBy(nextAgg);
    setPage(1);
  }

  function handleBreadcrumb(level: number) {
    if (level === -1) {
      setDrilldownFilters([]);
      setEffectiveAggregateBy(globalAggregateBy);
      setDrilldownAggregateBy(undefined);
      setPage(1);
      return;
    }
    // Remove the selected filter chip and any deeper drilldown levels.
    const trimmed = drilldownFilters.slice(0, level);
    setDrilldownFilters(trimmed);
    const aggHierarchy = [
      "namespace",
      "controllerKind",
      "controller",
      "pod",
      "container",
    ];
    const nextAgg = aggHierarchy[trimmed.length] ?? globalAggregateBy;
    setEffectiveAggregateBy(nextAgg);
    setDrilldownAggregateBy(trimmed.length > 0 ? nextAgg : undefined);
    setPage(1);
  }

  const formatEfficiency = (row: any) => {
    if (String(row.name).indexOf("__idle__") >= 0) return "—";
    const eff = row.totalEfficiency;
    if (
      eff == 1.0 &&
      get(row, "cpuReqCoreHrs", 0) == 0 &&
      get(row, "ramReqByteHrs", 0) == 0
    )
      return "Inf%";
    return `${round((eff ?? 0) * 100, 1)}%`;
  };

  const formatTotalsEfficiency = () => {
    const t = totalData;
    if (
      t.totalEfficiency == 1.0 &&
      get(t, "cpuReqCoreHrs", 0) == 0 &&
      get(t, "ramReqByteHrs", 0) == 0
    )
      return "Inf%";
    return `${round((t.totalEfficiency ?? 0) * 100, 1)}%`;
  };

  const rowsForTable = pageRows.map((row, i) => {
    const displayName =
      row.name === "__unmounted__" ? "Unmounted PVs" : row.name;
    const canDrilldown =
      !String(row.name).includes("__idle__") &&
      !String(row.name).includes("__unallocated__") &&
      row.name !== "Unmounted PVs" &&
      !!drilldownHierarchy[aggregateBy];

    return {
      id: `row-${pageStart + i}`,
      _raw: row,
      name: displayName,
      cpuCost: toCurrency(row.cpuCost ?? 0, currency),
      gpuCost: toCurrency(row.gpuCost ?? 0, currency),
      ramCost: toCurrency(row.ramCost ?? 0, currency),
      pvCost: toCurrency(row.pvCost ?? 0, currency),
      totalEfficiency: formatEfficiency(row),
      totalCost: toCurrency(row.totalCost ?? 0, currency),
      canDrilldown,
    };
  });

  if (loading) {
    return <div className="p-8 text-center text-[var(--cds-text-placeholder)]">Loading…</div>;
  }

  if (allocationData.length === 0) {
    return (
      <div className="w-full">
        <p className="p-8 text-center text-[var(--cds-text-placeholder)]">
          No allocation data available.
        </p>
      </div>
    );
  }

  const setFilter = (
    key: keyof typeof sharedFilters,
    value: string | boolean,
  ) => {
    setSharedFilters((prev) => ({
      ...prev,
      [key]: value,
      drilldownAggregateBy: undefined,
      drilldownFilters: [],
    }));
  };

  return (
    <div className="w-full">
      {useSharedFilters ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold m-0">{title}</h3>
          {description && (
            <p className="text-sm text-[var(--cds-text-secondary)] mt-1 mb-0">{description}</p>
          )}
        </div>
      ) : (
        <FilterableWidgetHeader
          title={title}
          description={description}
          expanded={showFilters}
          onToggle={() => setShowFilters((s) => !s)}
          filterContent={
            <AllocationFilterControls
              window={window}
              aggregateBy={globalAggregateBy}
              accumulate={accumulate}
              includeIdle={includeIdle}
              currency={currency}
              onWindowChange={(v) => setFilter("window", v)}
              onAggregateByChange={(v) => setFilter("aggregateBy", v)}
              onAccumulateChange={(v) => setFilter("accumulate", v)}
              onIncludeIdleChange={(v) => setFilter("includeIdle", v)}
              onCurrencyChange={(v) => setFilter("currency", v)}
              idPrefix="table-alloc"
            />
          }
        />
      )}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        {drilldownFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[var(--cds-text-secondary)]">Filters:</span>
            {drilldownFilters.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleBreadcrumb(i)}
                className="text-xs px-2 py-[2px] rounded border border-[var(--cds-border-subtle)] bg-[var(--cds-layer-accent)] cursor-pointer inline-flex items-center gap-1"
                aria-label={`Remove filter ${f.property}: ${f.value}`}
              >
                <span>
                  {f.property}: {f.value}
                </span>
                <Close size={12} aria-hidden="true" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleBreadcrumb(-1)}
              className="text-xs text-[var(--cds-link-primary)] bg-transparent border-none cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <p className="text-sm font-semibold mb-3">{dataTitle}</p>

      <TableContainer>
        <Table size="md" useZebraStyles>
          <TableHead>
            <TableRow>
              {headers.map((header: any) => (
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
                    header.isSortable &&
                    setSortConfig((s) => ({
                      key: header.key,
                      direction:
                        s.key === header.key && s.direction === "desc"
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
              <TableCell>Totals</TableCell>
              <TableCell>
                {toCurrency(totalData.cpuCost ?? 0, currency)}
              </TableCell>
              <TableCell>
                {toCurrency(totalData.gpuCost ?? 0, currency)}
              </TableCell>
              <TableCell>
                {toCurrency(totalData.ramCost ?? 0, currency)}
              </TableCell>
              <TableCell>
                {toCurrency(totalData.pvCost ?? 0, currency)}
              </TableCell>
              <TableCell>{formatTotalsEfficiency()}</TableCell>
              <TableCell>
                {toCurrency(totalData.totalCost ?? 0, currency)}
              </TableCell>
            </TableRow>
            {rowsForTable.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => row.canDrilldown && handleDrilldown(row._raw)}
                className={row.canDrilldown ? "cursor-pointer" : ""}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.cpuCost}</TableCell>
                <TableCell>{row.gpuCost}</TableCell>
                <TableCell>{row.ramCost}</TableCell>
                <TableCell>{row.pvCost}</TableCell>
                <TableCell>{row.totalEfficiency}</TableCell>
                <TableCell>{row.totalCost}</TableCell>
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
          onChange={({ page: p, pageSize: ps }: any) => {
            if (p !== undefined) setPage(p);
            if (ps !== undefined) setPageSize(ps);
          }}
        />
      )}
    </div>
  );
}
