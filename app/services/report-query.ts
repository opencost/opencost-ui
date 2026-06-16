import { get, toArray } from "lodash";
import AllocationService from "~/services/allocation";
import AssetsService from "~/services/assets";
import CloudCostService from "~/services/cloud-cost";
import ExternalCostsService from "~/services/external-costs";
import { parseReportWindowRange } from "~/lib/report-window-range";
import { parseFilters, rangeToCumulative, toCurrency } from "~/lib/legacy-util";
import type { Asset } from "~/lib/assets-api";
import type {
  AllocationMeasure,
  AllocationReportQuery,
  CloudCostReportQuery,
  ExternalCostReportQuery,
  InfraAssetsReportQuery,
  Report,
  ReportLayer,
} from "~/types/report";

export interface AllocationReportRow {
  id: string;
  name: string;
  measureValue: number;
  measureDisplayValue: string;
}

export interface AllocationReportResult {
  layer: "allocation";
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

export interface CloudCostReportRow {
  id: string;
  name: string;
  cost: number;
  costDisplay: string;
  kubernetesPercent: number;
}

export interface CloudCostReportResult {
  layer: "cloudCost";
  groupingLabel: string;
  metricLabel: string;
  rows: CloudCostReportRow[];
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

export interface InfraAssetsReportResult {
  layer: "infraAssets";
  groupingLabel: string;
  assets: Asset[];
  totalValue: number;
  totalDisplayValue: string;
  totalCarbon: number;
  typeTotals: Array<{
    type: string;
    count: number;
    totalCost: number;
    totalCostDisplay: string;
  }>;
}

export interface ExternalCostReportRow {
  id: string;
  name: string;
  costType: string;
  cost: number;
  costDisplay: string;
}

export interface ExternalCostReportResult {
  layer: "externalCost";
  groupingLabel: string;
  costType: string;
  rows: ExternalCostReportRow[];
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

export type ReportRunResult =
  | AllocationReportResult
  | CloudCostReportResult
  | InfraAssetsReportResult
  | ExternalCostReportResult;

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

function toSingleGroupingLabel(grouping: string): string {
  return formatGroupingToken(grouping || "name");
}

function isGarbageEpoch(parsed: Date): boolean {
  if (Number.isNaN(parsed.getTime())) return true;
  return parsed.getUTCFullYear() < 1971;
}

function safeTimeBucketLabel(raw: unknown, bracketIndex: number): string {
  if (raw !== null && raw !== undefined && String(raw).trim().length === 0) {
    return `Period ${bracketIndex + 1}`;
  }
  const asString =
    typeof raw === "number" ? String(raw) : typeof raw === "string" ? raw.trim() : String(raw);
  const parsed = new Date(asString);
  if (isGarbageEpoch(parsed))
    return asString.startsWith("Point ") || asString.startsWith("Period ")
      ? asString
      : `Period ${bracketIndex + 1}`;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
}

function utcBracketApproxDate(windowIso: string, accumulate: string, index: number): Date | null {
  const rng = parseReportWindowRange(windowIso);
  if (!rng) return null;

  switch (accumulate) {
    case "hour":
      return new Date(rng.start.getTime() + index * 60 * 60 * 1000);
    case "day":
      return new Date(rng.start.getTime() + index * 24 * 60 * 60 * 1000);
    case "week":
    case "weeknow":
      return new Date(rng.start.getTime() + index * 7 * 24 * 60 * 60 * 1000);
    case "month": {
      const d = new Date(rng.start);
      d.setUTCMonth(d.getUTCMonth() + index);
      return d;
    }
    case "quarter": {
      const d = new Date(rng.start);
      d.setUTCMonth(d.getUTCMonth() + index * 3);
      return d;
    }
    case "all":
      return index === 0 ? rng.start : null;
    default:
      return null;
  }
}

function deriveEmptyAllocationBracketLabel(
  windowIso: string,
  accumulate: string,
  bracketIndex: number,
): string {
  const derived = utcBracketApproxDate(windowIso, accumulate, bracketIndex);
  if (!derived) return `Period ${bracketIndex + 1}`;
  return safeTimeBucketLabel(derived.toISOString(), bracketIndex);
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
  windowIso: string,
  accumulate: string,
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

    let label: string;
    const trimmedStart =
      typeof get(items[0], "window.start", "") === "string"
        ? ((get(items[0], "window.start", "") as string) || "").trim()
        : "";
    const trimmedLegacy =
      typeof get(items[0], "start", "") === "string"
        ? ((get(items[0], "start", "") as string) || "").trim()
        : "";
    let rawLabel = trimmedStart || trimmedLegacy;
    if (rawLabel.length === 0 || isGarbageEpoch(new Date(rawLabel))) {
      label = deriveEmptyAllocationBracketLabel(windowIso, accumulate, index);
    } else {
      label = safeTimeBucketLabel(rawLabel, index);
    }
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
      label,
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

function buildCloudCostTimeSeries(
  rawGraphData: any[],
): CloudCostReportResult["timeSeries"] {
  const aggregateTotals = new Map<string, number>();

  rawGraphData.forEach((entry) => {
    const items = Array.isArray(entry?.items) ? entry.items : [];
    items.forEach((item: any) => {
      const name = String(item?.name ?? "Unknown");
      const value = Number(item?.value ?? item?.cost ?? 0);
      aggregateTotals.set(name, (aggregateTotals.get(name) ?? 0) + value);
    });
  });

  const topKeys = [...aggregateTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  const points = rawGraphData.map((entry, index) => {
    const values: Record<string, number> = {};
    for (const key of topKeys) values[key] = 0;
    values.Other = 0;
    const items = Array.isArray(entry?.items) ? entry.items : [];

    items.forEach((item: any) => {
      const name = String(item?.name ?? "Unknown");
      const value = Number(item?.value ?? item?.cost ?? 0);
      if (topKeys.includes(name)) values[name] += value;
      else values.Other += value;
    });

    const labelSource =
      (typeof entry?.start === "string" && entry.start) ||
      (typeof entry?.end === "string" && entry.end) ||
      `Period ${index + 1}`;

    return { label: safeTimeBucketLabel(labelSource, index), values };
  });

  return {
    seriesKeys: topKeys.length > 0 ? [...topKeys, "Other"] : [],
    points,
  };
}

const EXTERNAL_COST_AGG_TO_KEY: Record<string, string> = {
  zone: "zone",
  accountName: "account_name",
  chargeCategory: "charge_category",
  resourceName: "resource_name",
  resourceType: "resource_type",
  providerId: "provider_id",
  usageUnit: "usage_unit",
  domain: "domain",
};

function buildExternalCostTimeSeries(
  rawTimeseries: any[],
  aggregateBy: string,
): ExternalCostReportResult["timeSeries"] {
  const keyField = EXTERNAL_COST_AGG_TO_KEY[aggregateBy] ?? aggregateBy;
  const aggregateTotals = new Map<string, number>();

  rawTimeseries.forEach((entry) => {
    const rows = Array.isArray(entry?.customCosts) ? entry.customCosts : [];
    rows.forEach((row: any) => {
      const name = String(row?.[keyField] ?? "Unallocated");
      const value = Number(row?.cost ?? 0);
      aggregateTotals.set(name, (aggregateTotals.get(name) ?? 0) + value);
    });
  });

  const topKeys = [...aggregateTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  const points = rawTimeseries.map((entry, index) => {
    const rows = Array.isArray(entry?.customCosts) ? entry.customCosts : [];
    const values: Record<string, number> = {};
    for (const key of topKeys) values[key] = 0;
    values.Other = 0;

    rows.forEach((row: any) => {
      const name = String(row?.[keyField] ?? "Unallocated");
      const value = Number(row?.cost ?? 0);
      if (topKeys.includes(name)) values[name] += value;
      else values.Other += value;
    });

    const labelSource =
      (typeof entry?.window?.start === "string" && entry.window.start) ||
      (typeof entry?.window?.end === "string" && entry.window.end) ||
      `Period ${index + 1}`;

    return { label: safeTimeBucketLabel(labelSource, index), values };
  });

  return {
    seriesKeys: topKeys.length > 0 ? [...topKeys, "Other"] : [],
    points,
  };
}

export async function runAllocationReport(
  report: Report & { query: AllocationReportQuery },
): Promise<AllocationReportResult> {
  const { query } = report;
  const measures: AllocationMeasure[] = query.measures.length > 0 ? query.measures : ["totalCost"];
  const groupings = query.groupings.length > 0 ? query.groupings : ["namespace"];
  const aggregate = groupings.join(",");
  const metrics = measures.join(",");

  const response = await AllocationService.fetchAllocation(query.window, aggregate, {
    accumulate: query.accumulate,
    includeIdle: query.includeIdle,
    metrics,
    filters: query.filters.length > 0 ? parseFilters(query.filters) : undefined,
  });

  const rawSetsAll = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  const rawSets = query.includeUnallocated
    ? rawSetsAll
    : rawSetsAll.map((set: any) => {
        if (Array.isArray(set)) {
          return set.filter(
            (a: any) => !String(a?.name ?? "").includes("__unallocated__"),
          );
        }
        const next: Record<string, any> = {};
        for (const [name, alloc] of Object.entries(set ?? {})) {
          if (!name.includes("__unallocated__")) next[name] = alloc;
        }
        return next;
      });

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
      measureDisplayValue: toCurrency(measureValue, query.currency),
    };
  });

  const totalValue = mappedRows.reduce((sum, row) => sum + row.measureValue, 0);
  const timeSeries = buildTimeSeries(
    rawSets,
    measures,
    query.window,
    query.accumulate,
  );

  return {
    layer: "allocation",
    groupingLabel: toGroupingLabel(groupings),
    measureLabel: measureListLabel(measures),
    rows: mappedRows,
    totalValue,
    totalDisplayValue: toCurrency(totalValue, query.currency),
    timeSeries,
  };
}

export async function runCloudCostReport(
  report: Report & { query: CloudCostReportQuery },
): Promise<CloudCostReportResult> {
  const { query } = report;
  const response = await CloudCostService.fetchCloudCostData(
    query.window,
    query.aggregateBy,
    query.costMetric,
    query.filters,
    query.accumulate,
  );
  const tableRows = Array.isArray(response?.tableRows) ? response.tableRows : [];
  const graphData = Array.isArray(response?.graphData) ? response.graphData : [];

  const rows: CloudCostReportRow[] = tableRows.map((row: any, index: number) => {
    const cost = Number(row?.cost ?? 0);
    return {
      id: String(row?.name ?? row?.labelName ?? `cloud-row-${index}`),
      name: String(row?.labelName ?? row?.name ?? "Unknown"),
      cost,
      costDisplay: toCurrency(cost, query.currency),
      kubernetesPercent: Number(row?.kubernetesPercent ?? 0) * 100,
    };
  });

  const computedTotal = rows.reduce((sum, row) => sum + row.cost, 0);
  const totalValue = Number(response?.tableTotal?.cost ?? computedTotal);

  return {
    layer: "cloudCost",
    groupingLabel: toSingleGroupingLabel(query.aggregateBy),
    metricLabel: query.costMetric,
    rows,
    totalValue,
    totalDisplayValue: toCurrency(totalValue, query.currency),
    timeSeries: buildCloudCostTimeSeries(graphData),
  };
}

export async function runInfraAssetsReport(
  report: Report & { query: InfraAssetsReportQuery },
): Promise<InfraAssetsReportResult> {
  const { query } = report;
  const assets = await AssetsService.fetchAssets(query.window, query.aggregateBy, {
    accumulate: query.accumulate,
    includeIdle: query.includeIdle,
    filters: query.filters,
  });

  const totalValue = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
  const totalCarbon = assets.reduce((sum, asset) => sum + asset.carbonEmissions, 0);

  const typeMap = new Map<string, { count: number; totalCost: number }>();
  assets.forEach((asset) => {
    const current = typeMap.get(asset.type) ?? { count: 0, totalCost: 0 };
    current.count += 1;
    current.totalCost += asset.totalCost;
    typeMap.set(asset.type, current);
  });

  const typeTotals = [...typeMap.entries()]
    .map(([type, value]) => ({
      type,
      count: value.count,
      totalCost: value.totalCost,
      totalCostDisplay: toCurrency(value.totalCost, query.currency),
    }))
    .sort((a, b) => b.totalCost - a.totalCost);

  return {
    layer: "infraAssets",
    groupingLabel: toSingleGroupingLabel(query.aggregateBy),
    assets,
    totalValue,
    totalDisplayValue: toCurrency(totalValue, query.currency),
    totalCarbon,
    typeTotals,
  };
}

export async function runExternalCostReport(
  report: Report & { query: ExternalCostReportQuery },
): Promise<ExternalCostReportResult> {
  const { query } = report;
  const [graphData, tableData] = await Promise.all([
    ExternalCostsService.fetchExternalGraphCosts(
      query.window,
      query.aggregateBy,
      query.filters,
      query.costType,
      query.sortBy,
      query.sortDirection,
    ),
    ExternalCostsService.fetchExternalTableCosts(
      query.window,
      query.aggregateBy,
      query.filters,
      query.costType,
      query.sortBy,
      query.sortDirection,
    ),
  ]);

  const keyField = EXTERNAL_COST_AGG_TO_KEY[query.aggregateBy] ?? query.aggregateBy;
  const tableRows = Array.isArray(tableData?.customCosts) ? tableData.customCosts : [];
  const rows: ExternalCostReportRow[] = tableRows.map((row: any, index: number) => {
    const cost = Number(row?.cost ?? 0);
    return {
      id: String(row?.[keyField] ?? `external-row-${index}`),
      name: String(row?.[keyField] ?? "Unallocated"),
      costType: String(row?.cost_type ?? query.costType),
      cost,
      costDisplay: toCurrency(cost, query.currency),
    };
  });

  const computedTotal = rows.reduce((sum, row) => sum + row.cost, 0);
  const totalValue = Number(tableData?.totalCost ?? computedTotal);
  const rawTimeseries = Array.isArray(graphData?.timeseries) ? graphData.timeseries : [];

  return {
    layer: "externalCost",
    groupingLabel: toSingleGroupingLabel(query.aggregateBy),
    costType: query.costType,
    rows,
    totalValue,
    totalDisplayValue: toCurrency(totalValue, query.currency),
    timeSeries: buildExternalCostTimeSeries(rawTimeseries, query.aggregateBy),
  };
}

export async function runReport(report: Report): Promise<ReportRunResult> {
  const layer: ReportLayer = report.query.layer;
  switch (layer) {
    case "cloudCost":
      return runCloudCostReport(report as Report & { query: CloudCostReportQuery });
    case "infraAssets":
      return runInfraAssetsReport(report as Report & { query: InfraAssetsReportQuery });
    case "externalCost":
      return runExternalCostReport(report as Report & { query: ExternalCostReportQuery });
    case "allocation":
    default:
      return runAllocationReport(report as Report & { query: AllocationReportQuery });
  }
}
