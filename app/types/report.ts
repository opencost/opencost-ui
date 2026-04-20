import { getYesterdayUtcRange } from "~/lib/report-window-range";

export type ReportLayer =
  | "allocation"
  | "cloudCost"
  | "infraAssets"
  | "externalCost";

export type ReportVisibility = "public" | "private";
export type ReportChartType =
  | "stackedArea"
  | "line"
  | "bar"
  | "stackedBar"
  | "pie"
  | "table";

export type AllocationMeasure =
  | "totalCost"
  | "cpuCost"
  | "gpuCost"
  | "ramCost"
  | "pvCost"
  | "networkCost"
  | "sharedCost"
  | "externalCost";

export interface ReportFilterRule {
  property: string;
  value: string;
}

export interface AllocationReportQuery {
  layer: "allocation";
  window: string;
  step: string;
  accumulate: boolean;
  includeIdle: boolean;
  measures: AllocationMeasure[];
  groupings: string[];
  filters: ReportFilterRule[];
  currency: string;
  chartType: ReportChartType;
}

export interface CloudCostReportQuery {
  layer: "cloudCost";
  window: string;
  aggregateBy: string;
  costMetric: string;
  filters: ReportFilterRule[];
  currency: string;
  chartType: ReportChartType;
}

export interface InfraAssetsReportQuery {
  layer: "infraAssets";
  window: string;
  aggregateBy: string;
  accumulate: boolean;
  includeIdle: boolean;
  filters: ReportFilterRule[];
  currency: string;
  chartType: ReportChartType;
}

export interface ExternalCostReportQuery {
  layer: "externalCost";
  window: string;
  aggregateBy: string;
  costType: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  filters: ReportFilterRule[];
  currency: string;
  chartType: ReportChartType;
}

export type ReportQuery =
  | AllocationReportQuery
  | CloudCostReportQuery
  | InfraAssetsReportQuery
  | ExternalCostReportQuery;

export interface Report {
  id: string;
  name: string;
  description: string;
  tags: string[];
  owner: string;
  visibility: ReportVisibility;
  favorite: boolean;
  query: ReportQuery;
  createdAt: string;
  updatedAt: string;
}

export const ALLOCATION_MEASURE_OPTIONS: { label: string; value: AllocationMeasure }[] = [
  { label: "Total Cost", value: "totalCost" },
  { label: "CPU Cost", value: "cpuCost" },
  { label: "GPU Cost", value: "gpuCost" },
  { label: "RAM Cost", value: "ramCost" },
  { label: "PV Cost", value: "pvCost" },
  { label: "Network Cost", value: "networkCost" },
  { label: "Shared Cost", value: "sharedCost" },
  { label: "External Cost", value: "externalCost" },
];

export const ALLOCATION_GROUPING_OPTIONS = [
  { label: "Cluster", value: "cluster" },
  { label: "Node", value: "node" },
  { label: "Namespace", value: "namespace" },
  { label: "Controller Kind", value: "controllerKind" },
  { label: "Controller", value: "controller" },
  { label: "Deployment", value: "deployment" },
  { label: "StatefulSet", value: "statefulset" },
  { label: "DaemonSet", value: "daemonset" },
  { label: "Job", value: "job" },
  { label: "Service", value: "service" },
  { label: "Pod", value: "pod" },
  { label: "Container", value: "container" },
];

export const CLOUD_COST_GROUPING_OPTIONS = [
  { label: "Account", value: "accountID" },
  { label: "Invoice Entity", value: "invoiceEntityID" },
  { label: "Provider", value: "provider" },
  { label: "Service", value: "service" },
  { label: "Category", value: "category" },
  { label: "Item", value: "item" },
];

export const CLOUD_COST_METRIC_OPTIONS = [
  { label: "Amortized Net Cost", value: "AmortizedNetCost" },
  { label: "List Cost", value: "ListCost" },
  { label: "Invoiced Cost", value: "InvoicedCost" },
  { label: "Amortized Cost", value: "AmortizedCost" },
];

export const ASSETS_GROUPING_OPTIONS = [
  { label: "Asset Type", value: "assetType" },
  { label: "Category", value: "category" },
  { label: "Cluster", value: "cluster" },
  { label: "Provider", value: "provider" },
  { label: "Account", value: "account" },
  { label: "Service", value: "service" },
  { label: "Project", value: "project" },
  { label: "Provider ID", value: "providerID" },
];

export const EXTERNAL_COST_GROUPING_OPTIONS = [
  { label: "Domain", value: "domain" },
  { label: "Account Name", value: "accountName" },
  { label: "Resource Name", value: "resourceName" },
  { label: "Resource Type", value: "resourceType" },
  { label: "Zone", value: "zone" },
  { label: "Charge Category", value: "chargeCategory" },
  { label: "Provider ID", value: "providerId" },
  { label: "Usage Unit", value: "usageUnit" },
];

export const EXTERNAL_COST_TYPE_OPTIONS = [
  { label: "Blended", value: "blended" },
  { label: "Billed", value: "billed" },
  { label: "List", value: "list" },
];

export const EXTERNAL_COST_SORT_BY_OPTIONS = [
  { label: "Cost", value: "cost" },
  { label: "Name", value: "aggregate" },
  { label: "Cost Type", value: "costType" },
];

export const EXTERNAL_COST_SORT_DIRECTION_OPTIONS = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
];

export const REPORT_DATA_SOURCE_OPTIONS: { label: string; value: ReportLayer }[] = [
  { label: "OpenCost Allocation", value: "allocation" },
  { label: "Cloud Cost", value: "cloudCost" },
  { label: "Infrastructure Assets", value: "infraAssets" },
  { label: "External Cost", value: "externalCost" },
];

export const REPORT_CHART_TYPE_OPTIONS: { label: string; value: ReportChartType }[] = [
  { label: "Bar", value: "bar" },
  { label: "Stacked Area", value: "stackedArea" },
  { label: "Line", value: "line" },
  { label: "Stacked Bar", value: "stackedBar" },
  { label: "Pie", value: "pie" },
  { label: "Table", value: "table" },
];

export function createDefaultAllocationReportQuery(): AllocationReportQuery {
  return {
    layer: "allocation",
    window: getYesterdayUtcRange(),
    step: "1d",
    accumulate: false,
    includeIdle: true,
    measures: ["totalCost"],
    groupings: ["namespace"],
    filters: [],
    currency: "USD",
    chartType: "bar",
  };
}

export function createDefaultCloudCostReportQuery(): CloudCostReportQuery {
  return {
    layer: "cloudCost",
    window: getYesterdayUtcRange(),
    aggregateBy: "provider",
    costMetric: "AmortizedNetCost",
    filters: [],
    currency: "USD",
    chartType: "bar",
  };
}

export function createDefaultInfraAssetsReportQuery(): InfraAssetsReportQuery {
  return {
    layer: "infraAssets",
    window: getYesterdayUtcRange(),
    aggregateBy: "assetType",
    accumulate: true,
    includeIdle: true,
    filters: [],
    currency: "USD",
    chartType: "bar",
  };
}

export function createDefaultExternalCostReportQuery(): ExternalCostReportQuery {
  return {
    layer: "externalCost",
    window: getYesterdayUtcRange(),
    aggregateBy: "domain",
    costType: "blended",
    sortBy: "cost",
    sortDirection: "desc",
    filters: [],
    currency: "USD",
    chartType: "bar",
  };
}

export function createDefaultReportQuery(layer: ReportLayer = "allocation"): ReportQuery {
  switch (layer) {
    case "cloudCost":
      return createDefaultCloudCostReportQuery();
    case "infraAssets":
      return createDefaultInfraAssetsReportQuery();
    case "externalCost":
      return createDefaultExternalCostReportQuery();
    case "allocation":
    default:
      return createDefaultAllocationReportQuery();
  }
}

const VALID_MEASURES = new Set(ALLOCATION_MEASURE_OPTIONS.map((o) => o.value));
const VALID_CHART_TYPES = new Set(REPORT_CHART_TYPE_OPTIONS.map((option) => option.value));
const VALID_CLOUD_GROUPINGS = new Set(CLOUD_COST_GROUPING_OPTIONS.map((option) => option.value));
const VALID_CLOUD_METRICS = new Set(CLOUD_COST_METRIC_OPTIONS.map((option) => option.value));
const VALID_ASSET_GROUPINGS = new Set(ASSETS_GROUPING_OPTIONS.map((option) => option.value));
const VALID_EXTERNAL_GROUPINGS = new Set(
  EXTERNAL_COST_GROUPING_OPTIONS.map((option) => option.value),
);
const VALID_EXTERNAL_TYPES = new Set(
  EXTERNAL_COST_TYPE_OPTIONS.map((option) => option.value),
);
const VALID_EXTERNAL_SORT_BY = new Set(
  EXTERNAL_COST_SORT_BY_OPTIONS.map((option) => option.value),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function normalizeFilters(value: unknown): ReportFilterRule[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => ({
      property: typeof item.property === "string" ? item.property : "",
      value: typeof item.value === "string" ? item.value : "",
    }))
    .filter((item) => item.property.length > 0);
}

function normalizeChartType(value: unknown, fallback: ReportChartType): ReportChartType {
  if (typeof value === "string" && VALID_CHART_TYPES.has(value as ReportChartType)) {
    return value as ReportChartType;
  }
  return fallback;
}

function normalizeWindow(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function normalizeCurrency(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function normalizeAllocationQuery(raw: unknown): AllocationReportQuery {
  const defaults = createDefaultAllocationReportQuery();
  const record = isRecord(raw) ? raw : {};

  const legacyMeasure =
    typeof record.measure === "string" ? (record.measure as AllocationMeasure) : undefined;
  const rawMeasures = record.measures;
  let measures: AllocationMeasure[] =
    Array.isArray(rawMeasures) && rawMeasures.length > 0
      ? rawMeasures.filter(
          (value): value is AllocationMeasure =>
            typeof value === "string" && VALID_MEASURES.has(value as AllocationMeasure),
        )
      : legacyMeasure != null && VALID_MEASURES.has(legacyMeasure)
        ? [legacyMeasure]
        : defaults.measures;
  if (measures.length === 0) measures = defaults.measures;

  const groupings =
    Array.isArray(record.groupings) &&
    record.groupings.some((item) => typeof item === "string" && item.length > 0)
      ? record.groupings.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : defaults.groupings;

  return {
    ...defaults,
    layer: "allocation",
    window: normalizeWindow(record.window, defaults.window),
    step: typeof record.step === "string" && record.step.length > 0 ? record.step : defaults.step,
    accumulate:
      typeof record.accumulate === "boolean" ? record.accumulate : defaults.accumulate,
    includeIdle:
      typeof record.includeIdle === "boolean" ? record.includeIdle : defaults.includeIdle,
    measures,
    groupings,
    filters: normalizeFilters(record.filters),
    currency: normalizeCurrency(record.currency, defaults.currency),
    chartType: normalizeChartType(record.chartType, defaults.chartType),
  };
}

function normalizeCloudCostQuery(raw: unknown): CloudCostReportQuery {
  const defaults = createDefaultCloudCostReportQuery();
  const record = isRecord(raw) ? raw : {};
  const aggregateBy =
    typeof record.aggregateBy === "string" &&
    VALID_CLOUD_GROUPINGS.has(record.aggregateBy)
      ? record.aggregateBy
      : defaults.aggregateBy;
  const costMetric =
    typeof record.costMetric === "string" &&
    VALID_CLOUD_METRICS.has(record.costMetric)
      ? record.costMetric
      : defaults.costMetric;

  return {
    ...defaults,
    layer: "cloudCost",
    window: normalizeWindow(record.window, defaults.window),
    aggregateBy,
    costMetric,
    filters: normalizeFilters(record.filters),
    currency: normalizeCurrency(record.currency, defaults.currency),
    chartType: normalizeChartType(record.chartType, defaults.chartType),
  };
}

function normalizeInfraAssetsQuery(raw: unknown): InfraAssetsReportQuery {
  const defaults = createDefaultInfraAssetsReportQuery();
  const record = isRecord(raw) ? raw : {};
  const aggregateBy =
    typeof record.aggregateBy === "string" &&
    VALID_ASSET_GROUPINGS.has(record.aggregateBy)
      ? record.aggregateBy
      : defaults.aggregateBy;

  return {
    ...defaults,
    layer: "infraAssets",
    window: normalizeWindow(record.window, defaults.window),
    aggregateBy,
    accumulate:
      typeof record.accumulate === "boolean" ? record.accumulate : defaults.accumulate,
    includeIdle:
      typeof record.includeIdle === "boolean" ? record.includeIdle : defaults.includeIdle,
    filters: normalizeFilters(record.filters),
    currency: normalizeCurrency(record.currency, defaults.currency),
    chartType: normalizeChartType(record.chartType, defaults.chartType),
  };
}

function normalizeExternalCostQuery(raw: unknown): ExternalCostReportQuery {
  const defaults = createDefaultExternalCostReportQuery();
  const record = isRecord(raw) ? raw : {};
  const aggregateBy =
    typeof record.aggregateBy === "string" &&
    VALID_EXTERNAL_GROUPINGS.has(record.aggregateBy)
      ? record.aggregateBy
      : defaults.aggregateBy;
  const costType =
    typeof record.costType === "string" && VALID_EXTERNAL_TYPES.has(record.costType)
      ? record.costType
      : defaults.costType;
  const sortBy =
    typeof record.sortBy === "string" && VALID_EXTERNAL_SORT_BY.has(record.sortBy)
      ? record.sortBy
      : defaults.sortBy;
  const sortDirection =
    record.sortDirection === "asc" || record.sortDirection === "desc"
      ? record.sortDirection
      : defaults.sortDirection;

  return {
    ...defaults,
    layer: "externalCost",
    window: normalizeWindow(record.window, defaults.window),
    aggregateBy,
    costType,
    sortBy,
    sortDirection,
    filters: normalizeFilters(record.filters),
    currency: normalizeCurrency(record.currency, defaults.currency),
    chartType: normalizeChartType(record.chartType, defaults.chartType),
  };
}

export function normalizeReportQuery(
  query: (Partial<ReportQuery> & { measure?: AllocationMeasure }) | unknown,
): ReportQuery {
  const record = isRecord(query) ? query : {};
  const layer = typeof record.layer === "string" ? record.layer : "allocation";

  switch (layer) {
    case "cloudCost":
      return normalizeCloudCostQuery(record);
    case "infraAssets":
      return normalizeInfraAssetsQuery(record);
    case "externalCost":
      return normalizeExternalCostQuery(record);
    case "allocation":
    default:
      return normalizeAllocationQuery(record);
  }
}

export function mergeReportQuery(base: ReportQuery, updates: Partial<ReportQuery>): ReportQuery {
  if (updates.layer && updates.layer !== base.layer) {
    return normalizeReportQuery(updates);
  }

  return normalizeReportQuery({
    ...base,
    ...updates,
    layer: base.layer,
  });
}
