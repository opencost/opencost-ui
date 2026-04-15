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

function toGroupingLabel(groupings: string[]): string {
  const firstGrouping = groupings[0] ?? "namespace";
  if (firstGrouping.length === 0) return "Name";
  return firstGrouping
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function toPointLabel(rawDate: string): string {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function buildTimeSeries(
  rawSets: any[],
  measure: AllocationMeasure,
): AllocationReportResult["timeSeries"] {
  const aggregateTotals = new Map<string, number>();

  rawSets.forEach((set) => {
    const items = Object.values(set) as any[];
    items.forEach((item) => {
      const name = String(item?.name ?? "Unknown");
      aggregateTotals.set(
        name,
        (aggregateTotals.get(name) ?? 0) + Number(get(item, measure, 0)),
      );
    });
  });

  const topKeys = [...aggregateTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  const points = rawSets.map((set) => {
    const items = Object.values(set) as any[];
    const firstWindow = get(items[0], "window.start", "") as string;
    const values: Record<string, number> = {};
    for (const key of topKeys) values[key] = 0;
    values.Other = 0;

    items.forEach((item) => {
      const name = String(item?.name ?? "Unknown");
      const measureValue = Number(get(item, measure, 0));
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

export async function runAllocationReport(report: Report): Promise<AllocationReportResult> {
  const grouping = report.query.groupings.join(",") || "namespace";
  const response = await AllocationService.fetchAllocation(report.query.window, grouping, {
    accumulate: report.query.accumulate,
    includeIdle: report.query.includeIdle,
    step: report.query.step,
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

  const cumulative = rangeToCumulative(rawSets, report.query.groupings[0] ?? "name");
  const rows = cumulative ? toArray(cumulative) : [];
  const sorted = [...rows].sort(
    (a, b) =>
      Number(get(b, report.query.measure, 0)) -
      Number(get(a, report.query.measure, 0)),
  );

  const mappedRows: AllocationReportRow[] = sorted.map((row) => {
    const measureValue = Number(get(row, report.query.measure, 0));
    return {
      id: String(row.name ?? Math.random()),
      name: String(row.name ?? "Unknown"),
      measureValue,
      measureDisplayValue: toCurrency(measureValue, report.query.currency),
    };
  });

  const totalValue = mappedRows.reduce((sum, row) => sum + row.measureValue, 0);
  const timeSeries = buildTimeSeries(rawSets, report.query.measure);

  return {
    groupingLabel: toGroupingLabel(report.query.groupings),
    measureLabel: MEASURE_LABELS[report.query.measure],
    rows: mappedRows,
    totalValue,
    totalDisplayValue: toCurrency(totalValue, report.query.currency),
    timeSeries,
  };
}
