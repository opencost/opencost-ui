import { useEffect, useState } from "react";
import { StackedBarChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import AllocationService from "~/services/allocation";
import { checkCustomWindow, toVerboseTimeRange } from "~/lib/legacy-util";
import { ALLOCATION_WINDOW_OPTIONS, ALLOCATION_AGGREGATE_OPTIONS } from "./scoped-views";

interface ChartPoint {
  group: string;
  key: string;
  value: number;
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

function buildChartData(rawData: any[]): ChartPoint[] {
  const points: ChartPoint[] = [];
  const TOP_N = 10;

  const totals: Record<string, number> = {};
  for (const set of rawData) {
    for (const alloc of Object.values(set) as any[]) {
      if (alloc.name === "__idle__") continue;
      totals[alloc.name] = (totals[alloc.name] ?? 0) + (alloc.totalCost ?? 0);
    }
  }

  const topNames = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N)
    .map(([name]) => name);

  for (const set of rawData) {
    const allocValues = Object.values(set) as any[];
    if (!allocValues.length) continue;
    const sampleAlloc = allocValues[0];
    const date = sampleAlloc?.window?.start
      ? new Date(sampleAlloc.window.start).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
      : "?";

    for (const name of topNames) {
      const alloc = allocValues.find((a: any) => a.name === name);
      points.push({ group: date, key: name, value: alloc?.totalCost ?? 0 });
    }
  }

  return points;
}

export interface CostAllocationChartProps {
  window?: string;
  aggregateBy?: string;
  accumulate?: boolean;
  includeIdle?: boolean;
}

export default function CostAllocationChart({
  window = "7d",
  aggregateBy = "namespace",
  accumulate = false,
  includeIdle = true,
}: CostAllocationChartProps) {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const title = generateTitle(window, aggregateBy, accumulate);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await AllocationService.fetchAllocation(window, aggregateBy, {
          accumulate,
          includeIdle,
        });
        const raw = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
        if (!cancelled && raw.length > 0) {
          setChartData(buildChartData(raw));
        } else {
          setChartData([]);
        }
      } catch {
        setChartData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [window, aggregateBy, accumulate, includeIdle]);

  const chartOptions = {
    title,
    axes: {
      left: { mapsTo: "value", scaleType: ScaleTypes.LINEAR },
      bottom: { mapsTo: "group", scaleType: ScaleTypes.LABELS },
    },
    height: "400px",
  };

  if (loading) {
    return (
      <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "#8d8d8d" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <StackedBarChart data={chartData} options={chartOptions} />
    </div>
  );
}
