import { useEffect, useState, useMemo } from "react";
import { StackedBarChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import AllocationService from "~/services/allocation";
import { checkCustomWindow, toVerboseTimeRange, toCurrency } from "~/lib/legacy-util";
import { ALLOCATION_WINDOW_OPTIONS, ALLOCATION_AGGREGATE_OPTIONS, AllocationFilterControls, FilterableWidgetHeader } from "./scoped-views";
import { useAllocationFilters } from "./allocation-filters-context";
import { primary, greyscale, browns } from "~/constants/colors";
interface ChartPoint {
  group: string; 
  key: string; 
  value: number;
}

interface AllocationLike {
  name?: string;
  totalCost?: number;
  start?: string;
  window?: { start?: string };
  [k: string]: unknown;
}

function generateTitle(window: string, aggregateBy: string, accumulate: boolean): string {
  const winOpt = ALLOCATION_WINDOW_OPTIONS.find((o) => o.value === window);
  let windowName = winOpt?.name ?? "";
  if (windowName === "" && checkCustomWindow(window)) {
    windowName = toVerboseTimeRange(window) ?? window;
  }
  if (windowName === "") windowName = window;

  const aggOpt = ALLOCATION_AGGREGATE_OPTIONS.find((o) => o.value === aggregateBy);
  const aggregationName = (aggOpt?.name ?? aggregateBy).toLowerCase();

  let str = `${windowName} by ${aggregationName}`;
  if (!accumulate) str = `${str} daily`;
  return str;
}

function isIdle(alloc: AllocationLike): boolean {
  return ((alloc.name ?? "") as string).indexOf("__idle__") >= 0;
}

function aggregateAllocs(allocs: AllocationLike[], name: string): AllocationLike | null {
  if (allocs.length === 0) return null;
  const first = allocs[0];
  const totalCost = allocs.reduce((s, a) => s + (a.totalCost ?? 0), 0);
  const start = first?.window?.start ?? first?.start;
  return { name, totalCost, start, window: first?.window };
}

function topNPerDay(
  allocations: AllocationLike[],
  n: number,
  by: (a: AllocationLike) => number
): { top: AllocationLike[]; other: AllocationLike[]; idle: AllocationLike[] } {
  const sorted = [...allocations].sort((a, b) => by(b) - by(a));
  const active = sorted.filter((a) => !isIdle(a));
  const idle = sorted.filter((a) => isIdle(a));
  const top = active.slice(0, n);
  const rest = active.slice(n);
  const other: AllocationLike[] = rest.length > 0 && aggregateAllocs(rest, "other") ? [aggregateAllocs(rest, "other")!] : [];
  return { top, other, idle };
}

function getDateLabel(alloc: AllocationLike): string {
  const start = alloc?.window?.start ?? alloc?.start;
  if (!start) return "?";
  return new Date(start).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
}

function buildChartData(rawData: any[], topN: number, includeIdle: boolean): ChartPoint[] {
  const points: ChartPoint[] = [];

  for (const set of rawData) {
    const allocs: AllocationLike[] = Array.isArray(set) ? set : (Object.values(set) as AllocationLike[]);
    if (!allocs.length) continue;

    const { top, other, idle } = topNPerDay(allocs, topN, (a) => a.totalCost ?? 0);
    const date = getDateLabel(allocs[0]);

    for (const a of top) {
      const k = a.name ?? "?";
      points.push({ group: date, key: k, value: a.totalCost ?? 0 });
    }
    for (const a of other) {
      points.push({ group: date, key: "other", value: a.totalCost ?? 0 });
    }
    const totalCost = allocs.reduce((s, a) => s + (a.totalCost ?? 0), 0);
    points.push({ group: date, key: "total", value: totalCost });
    if (includeIdle && idle.length > 0) {
      const idleCost = idle.reduce((s, a) => s + (a.totalCost ?? 0), 0);
      if (idleCost > 0) {
        points.push({ group: date, key: "idle", value: idleCost });
      }
    }
  }

  return points;
}

function buildColorScale(points: ChartPoint[]): Record<string, string> {
  const keys = [...new Set(points.map((p) => p.key))]; // keys = stack segments
  const scale: Record<string, string> = {};
  let p = 0;
  for (const k of keys) {
    if (k === "idle") scale[k] = greyscale[1];
    else if (k === "total") scale[k] = greyscale[2];
    else if (k === "other") scale[k] = browns[0];
    else scale[k] = primary[p++ % primary.length];
  }
  return scale;
}

export interface CostAllocationChartProps {
  title?: string;
  description?: string;
  window?: string;
  aggregateBy?: string;
  accumulate?: boolean;
  includeIdle?: boolean;
  currency?: string;
  topN?: number;
  useSharedFilters?: boolean;
}

export default function CostAllocationChart({
  title = "Cost Allocation",
  description = "Cost breakdown by cluster, namespace, pod, or other dimension",
  window: windowProp,
  aggregateBy: aggregateByProp,
  accumulate: accumulateProp,
  includeIdle: includeIdleProp,
  currency: currencyProp,
  topN = 10,
  useSharedFilters = false,
}: CostAllocationChartProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [sharedFilters, setSharedFilters] = useAllocationFilters(useSharedFilters);
  const window = windowProp ?? sharedFilters.window;
  const aggregateBy = aggregateByProp ?? sharedFilters.drilldownAggregateBy ?? sharedFilters.aggregateBy;
  const accumulate = accumulateProp ?? sharedFilters.accumulate;
  const includeIdle = includeIdleProp ?? sharedFilters.includeIdle;
  const currency = currencyProp ?? sharedFilters.currency ?? "USD";
  const drilldownFilters = useSharedFilters ? (sharedFilters.drilldownFilters ?? []) : [];

  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const chartTitle = generateTitle(window, aggregateBy, accumulate);
  const chartData = useMemo(
    () => (rawData.length > 0 ? buildChartData(rawData, topN, includeIdle) : []),
    [rawData, topN, includeIdle],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await AllocationService.fetchAllocation(window, aggregateBy, {
          accumulate,
          includeIdle,
          filters: drilldownFilters.length > 0 ? drilldownFilters : undefined,
        });
        const raw = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
        if (!cancelled && raw.length > 0) {
          setRawData(raw);
        } else {
          setRawData([]);
        }
      } catch {
        setRawData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [window, aggregateBy, accumulate, includeIdle, drilldownFilters]);

  const chartOptions = useMemo(
    () => {
      const colorScale = buildColorScale(chartData);
      return {
        title: chartTitle,
        axes: {
          left: {
            mapsTo: "value",
            scaleType: ScaleTypes.LINEAR,
            ticks: { formatter: (v: number | Date) => toCurrency(typeof v === "number" ? v : v.getTime(), currency) },
          },
          bottom: { mapsTo: "group", scaleType: ScaleTypes.LABELS },
        },
        data: { groupMapsTo: "key" },
        height: "400px",
        color: { scale: colorScale },
        bars: {
          maxWidth: 48,
          spacingFactor: 0.65,
        },
        tooltip: {
          totalLabel: "Total:",
          valueFormatter: (value: number) => toCurrency(value, currency),
          showTotal: true,
          groupLabel: "Date",
          alwaysShowRulerTooltip: true,
          customHTML: (data: any, defaultHTML: string) => {
            let items: any[] = [];
            if (Array.isArray(data)) items = data;
            else if (data?.value !== undefined || data?.label !== undefined) items = [data];
            else if (data?.data && Array.isArray(data.data)) items = data.data;
            if (items.length === 0) return defaultHTML;
            let total = 0;
            const lines = items.map((item: any) => {
              const val = typeof item.value === "number" ? item.value : parseFloat(item.value) || 0;
              if (item.key === "total") return null;
              total += val;
              const name = item.label ?? item.key ?? item.name ?? item.group ?? "—";
              const fill = item.fill ?? colorScale[name] ?? "#8d8d8d";
              return `<p style="margin:0 0 4px 0;font-size:0.875rem;display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${fill};flex-shrink:0"></span><span>${String(name)}: ${toCurrency(val, currency)}</span></p>`;
            }).join("");
            return `<div style="padding:8px 12px">${lines}<p style="margin:8px 0 0 0;font-size:0.875rem;font-weight:600;border-top:1px solid #e0e0e0;padding-top:6px">Total: ${toCurrency(total, currency)}</p></div>`;
          },
        },
      };
    },
    [chartTitle, chartData, currency]
  );

  const setFilter = (key: keyof typeof sharedFilters, value: string | boolean) => {
    setSharedFilters((prev) => ({
      ...prev,
      [key]: value,
      drilldownAggregateBy: undefined,
      drilldownFilters: [],
    }));
  };

  return (
    <div className="w-full">
      <FilterableWidgetHeader
        title={title}
        description={description}
        expanded={showFilters}
        onToggle={() => setShowFilters((s) => !s)}
        filterContent={
          <AllocationFilterControls
            window={window}
            aggregateBy={aggregateBy}
            accumulate={accumulate}
            includeIdle={includeIdle}
            currency={currency}
            onWindowChange={(v) => setFilter("window", v)}
            onAggregateByChange={(v) => setFilter("aggregateBy", v)}
            onAccumulateChange={(v) => setFilter("accumulate", v)}
            onIncludeIdleChange={(v) => setFilter("includeIdle", v)}
            onCurrencyChange={(v) => setFilter("currency", v)}
            idPrefix="chart-alloc"
          />
        }
      />
      {loading ? (
        <div className="h-[400px] flex items-center justify-center text-[#8d8d8d]">
          Loading…
        </div>
      ) : (
        <div className="cost-allocation-chart w-full h-[400px] px-2">
          <StackedBarChart data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
