import { get, toArray } from "lodash";
import AllocationService from "~/services/allocation";
import { parseFilters, rangeToCumulative, toCurrency } from "~/lib/legacy-util";
import type { AllocationMeasure, Report } from "~/types/report";

export interface AllocationReportRow {
  id: string;
  name: string;
  measureValue: number;
  measureDisplayValue: string;
}

export interface AllocationReportResult {
  groupingLabel: string;
  measureLabel: string;
  rows: AllocationReportRow[];
  totalValue: number;
  totalDisplayValue: string;
  timeSeries: {
    seriesKeys: string[];
    points: Array<{
      label: string;
      values: Record<string, number>;
    }>;
  };
}

const MEASURE_LABELS: Record<AllocationMeasure, string> = {
  totalCost: "Total Cost",
  cpuCost: "CPU Cost",
  gpuCost: "GPU Cost",
  ramCost: "RAM Cost",
  pvCost: "PV Cost",
  networkCost: "Network Cost",
  sharedCost: "Shared Cost",
  externalCost: "External Cost",
};

function formatGroupingToken(g: string): string {
  if (g.length === 0) return "Name";
  return g.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function toGroupingLabel(groupings: string[]): string {
  const parts = groupings.length > 0 ? groupings : ["namespace"];
  return parts.map(formatGroupingToken).join(", ");
}

function toPointLabel(rawDate: string): string {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function combinedMeasureValue(item: unknown, measures: AllocationMeasure[]): number {
  return measures.reduce(
    (sum, measure) => sum + Number(get(item as object, measure, 0)),
    0,
  );
}

function buildTimeSeries(
  rawSets: any[],
  measures: AllocationMeasure[],
): AllocationReportResult["timeSeries"] {
  const aggregateTotals = new Map<string, number>();

  rawSets.forEach((set) => {
    const items = Object.values(set) as any[];
    items.forEach((item) => {
      const name = String(item?.name ?? "Unknown");
      const v = combinedMeasureValue(item, measures);
      aggregateTotals.set(name, (aggregateTotals.get(name) ?? 0) + v);
    });
  });

  const topKeys = [...aggregateTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  const points = rawSets.map((set, index) => {
    const items = Object.values(set) as any[];
    const firstWindow =
      (get(items[0], "window.start", "") as string) ||
      (get(items[0], "start", "") as string) ||
      `Point ${index + 1}`;
    const values: Record<string, number> = {};
    for (const key of topKeys) values[key] = 0;
    values.Other = 0;

    items.forEach((item) => {
      const name = String(item?.name ?? "Unknown");
      const measureValue = combinedMeasureValue(item, measures);
      if (topKeys.includes(name)) {
        values[name] += measureValue;
      } else {
        values.Other += measureValue;
      }
    });

    return {
      label: toPointLabel(firstWindow),
      values,
    };
  });

  return {
    seriesKeys: topKeys.length > 0 ? [...topKeys, "Other"] : [],
    points,
  };
}

function measureListLabel(measures: AllocationMeasure[]): string {
  return measures.map((m) => MEASURE_LABELS[m] ?? m).join(", ");
}

export async function runAllocationReport(report: Report): Promise<AllocationReportResult> {
  const measures: AllocationMeasure[] =
    report.query.measures.length > 0 ? report.query.measures : ["totalCost"];
  const groupings =
    report.query.groupings.length > 0 ? report.query.groupings : ["namespace"];
  const aggregate = groupings.join(",");
  const metrics = measures.join(",");

  const response = await AllocationService.fetchAllocation(report.query.window, aggregate, {
    accumulate: report.query.accumulate,
    includeIdle: report.query.includeIdle,
    step: report.query.step,
    metrics,
    filters:
      report.query.filters.length > 0
        ? parseFilters(report.query.filters)
        : undefined,
  });

  const rawSets = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  const cumulativeKey = groupings[0] ?? "name";
  const cumulative = rangeToCumulative(rawSets, cumulativeKey);
  const rows = cumulative ? toArray(cumulative) : [];
  const sorted = [...rows].sort(
    (a, b) => combinedMeasureValue(b, measures) - combinedMeasureValue(a, measures),
  );

  const mappedRows: AllocationReportRow[] = sorted.map((row, index) => {
    const measureValue = combinedMeasureValue(row, measures);
    return {
      id: String((row as { name?: string }).name ?? `${aggregate}-${index}`),
      name: String((row as { name?: string }).name ?? "Unknown"),
      measureValue,
      measureDisplayValue: toCurrency(measureValue, report.query.currency),
    };
  });

  const totalValue = mappedRows.reduce((sum, row) => sum + row.measureValue, 0);
  const timeSeries = buildTimeSeries(rawSets, measures);

  return {
    groupingLabel: toGroupingLabel(groupings),
    measureLabel: measureListLabel(measures),
    rows: mappedRows,
    totalValue,
    totalDisplayValue: toCurrency(totalValue, report.query.currency),
    timeSeries,
  };
}
