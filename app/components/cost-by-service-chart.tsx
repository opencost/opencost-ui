import { useEffect, useMemo, useState } from "react";
import { AreaChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import { Loading } from "@carbon/react";
import CloudCostService from "~/services/cloud-cost";
import { primary, greyscale, browns } from "~/constants/colors";
import { toCurrency } from "~/lib/legacy-util";
import { useAppTheme } from "~/components/theme-context";

interface ChartPoint {
  group: string;
  key: string;
  value: number;
}

interface CloudItem {
  name?: string;
  cost?: number;
}

interface CloudGraphEntry {
  start?: string;
  items?: CloudItem[];
}

function toDateLabel(start?: string): string {
  if (!start) return "?";
  return new Date(start).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
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
      (a, b) => (b.cost ?? 0) - (a.cost ?? 0),
    );
    const top = sorted.slice(0, topN);
    const remainder = sorted.slice(topN);
    const otherCost = remainder.reduce(
      (sum, item) => sum + (item.cost ?? 0),
      0,
    );

    for (const item of top) {
      points.push({
        group: date,
        key: item.name ?? "unknown",
        value: item.cost ?? 0,
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

export interface CostByServiceChartProps {
  window?: string;
  currency?: string;
  topN?: number;
}

export default function CostByServiceChart({
  window = "7d",
  currency = "USD",
  topN = 10,
}: CostByServiceChartProps) {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useAppTheme();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await CloudCostService.fetchCloudCostData(
          window,
          "service",
          "AmortizedNetCost",
          [],
        );
        if (!cancelled && resp?.graphData) {
          setChartData(buildChartData(resp.graphData, topN));
        } else if (!cancelled) {
          setChartData([]);
        }
      } catch {
        if (!cancelled) setChartData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [window, topN]);

  const chartOptions = useMemo(() => {
    const colorScale = buildColorScale(chartData);
    return {
      theme,
      title: "Cloud Service Costs",
      axes: {
        left: { mapsTo: "value", scaleType: ScaleTypes.LINEAR },
        bottom: { mapsTo: "group", scaleType: ScaleTypes.LABELS },
      },
      data: { groupMapsTo: "key" },
      curve: "curveMonotoneX",
      height: "400px",
      color: { scale: colorScale },
      points: { enabled: true, radius: 2 },
      tooltip: {
        groupLabel: "Date",
        valueFormatter: (value: number) => toCurrency(value, currency),
      },
    };
  }, [chartData, currency, theme]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loading description="Loading chart..." withOverlay={false} />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-[var(--cds-text-placeholder)]">
        No cloud cost data available.
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <AreaChart data={chartData} options={chartOptions} />
    </div>
  );
}
