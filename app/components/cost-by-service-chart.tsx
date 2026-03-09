import { useEffect, useState } from "react";
import { AreaChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import CloudCostService from "~/services/cloud-cost";

interface ChartPoint {
  group: string;
  key: string;
  value: number;
}

function buildChartData(graphData: any[]): ChartPoint[] {
  if (!Array.isArray(graphData)) return [];
  const points: ChartPoint[] = [];
  for (const entry of graphData) {
    const date = entry.start
      ? new Date(entry.start).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
      : "?";
    if (Array.isArray(entry.items)) {
      for (const item of entry.items) {
        points.push({ group: date, key: item.name ?? "unknown", value: item.cost ?? 0 });
      }
    }
  }
  return points;
}

const chartOptions = {
  title: "Cloud Service Costs",
  axes: {
    left: { mapsTo: "value", scaleType: ScaleTypes.LINEAR },
    bottom: { mapsTo: "group", scaleType: ScaleTypes.LABELS },
  },
  curve: "curveMonotoneX",
  height: "400px",
};

export default function CostByServiceChart({ window = "7d" }: { window?: string }) {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await CloudCostService.fetchCloudCostData(window, "service", "AmortizedNetCost", []);
        if (!cancelled && resp?.graphData) {
          setChartData(buildChartData(resp.graphData));
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
      <AreaChart data={chartData} options={chartOptions} />
    </div>
  );
}
