import { useEffect, useState } from "react";
import { StackedBarChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import AllocationService from "~/services/allocation";

interface ChartPoint {
  group: string;
  key: string;
  value: number;
}

function buildChartData(rawData: any[]): ChartPoint[] {
  const points: ChartPoint[] = [];
  const TOP_N = 10;

  // Collect all namespaces + their total cost across all days
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

const chartOptions = {
  title: "Cost Allocation by Namespace",
  axes: {
    left: { mapsTo: "value", scaleType: ScaleTypes.LINEAR },
    bottom: { mapsTo: "group", scaleType: ScaleTypes.LABELS },
  },
  height: "400px",
};

export default function CostAllocationChart({ window = "7d" }: { window?: string }) {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await AllocationService.fetchAllocation(window, "namespace", { accumulate: false });
        if (!cancelled && resp?.data) {
          setChartData(buildChartData(resp.data));
        }
      } catch {
        // leave empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [window]);

  if (loading) {
    return <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "#8d8d8d" }}>Loading…</div>;
  }

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <StackedBarChart data={chartData} options={chartOptions} />
    </div>
  );
}
