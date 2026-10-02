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

/**
 * Carbon Charts only uses stack totals for the Y-domain when axes.left.stacked
 * is true. Without it, the domain is the max of individual segments while bars
 * still draw stacked — so Breakdown → Service overflows the chart bounds.
 */
function withStackedRangeAxis(options: Record<string, any>): Record<string, any> {
  const left = options.axes?.left;
  if (!left || left.stacked === true) return options;
  return {
    ...options,
    axes: {
      ...options.axes,
      left: { ...left, stacked: true },
    },
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
      return (
        <StackedAreaChart
          data={data}
          options={withStackedRangeAxis(lineOptions)}
        />
      );
    }
    return <LineChart data={data} options={lineOptions} />;
  }

  if (stacked) {
    return (
      <StackedBarChart data={data} options={withStackedRangeAxis(options)} />
    );
  }
  return <SimpleBarChart data={data} options={options} />;
}
