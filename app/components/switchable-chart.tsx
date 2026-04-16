import {
  StackedBarChart,
  SimpleBarChart,
  LineChart,
  StackedAreaChart,
} from "@carbon/charts-react";
import type { ChartMode } from "./chart-type-toggle";

interface SwitchableChartProps {
  data: { group: string; key: string; value: number }[];
  options: Record<string, any>;
  mode: ChartMode;
  stacked?: boolean;
}

function buildLineOptions(options: Record<string, any>): Record<string, any> {
  const { bars, ...rest } = options;
  return {
    ...rest,
    curve: "curveMonotoneX",
    points: { enabled: true, radius: 3 },
  };
}

export function SwitchableChart({
  data,
  options,
  mode,
  stacked = true,
}: SwitchableChartProps) {
  if (mode === "line") {
    const lineOptions = buildLineOptions(options);
    if (stacked) {
      return <StackedAreaChart data={data} options={lineOptions} />;
    }
    return <LineChart data={data} options={lineOptions} />;
  }

  if (stacked) {
    return <StackedBarChart data={data} options={options} />;
  }
  return <SimpleBarChart data={data} options={options} />;
}
