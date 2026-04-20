import { getYesterdayUtcRange } from "~/lib/report-window-range";

export type ReportLayer = "allocation";

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

export interface Report {
  id: string;
  name: string;
  description: string;
  tags: string[];
  owner: string;
  visibility: ReportVisibility;
  favorite: boolean;
  query: AllocationReportQuery;
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

export function createDefaultReportQuery(): AllocationReportQuery {
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

const VALID_MEASURES = new Set(ALLOCATION_MEASURE_OPTIONS.map((o) => o.value));

export function normalizeReportQuery(
  query: Partial<AllocationReportQuery> & { measure?: AllocationMeasure },
): AllocationReportQuery {
  const defaults = createDefaultReportQuery();
  const { measure: legacyMeasure, ...rest } = query as Partial<AllocationReportQuery> & {
    measure?: AllocationMeasure;
  };
  const rawMeasures = (rest as { measures?: AllocationMeasure[] }).measures;
  let measures: AllocationMeasure[] =
    Array.isArray(rawMeasures) && rawMeasures.length > 0
      ? rawMeasures.filter((m): m is AllocationMeasure => VALID_MEASURES.has(m))
      : legacyMeasure != null && VALID_MEASURES.has(legacyMeasure)
        ? [legacyMeasure]
        : defaults.measures;
  if (measures.length === 0) measures = defaults.measures;

  const groupings =
    Array.isArray(rest.groupings) && rest.groupings.length > 0
      ? [...rest.groupings]
      : defaults.groupings;

  return {
    ...defaults,
    ...rest,
    measures,
    groupings,
  };
}

export const REPORT_CHART_TYPE_OPTIONS: { label: string; value: ReportChartType }[] = [
  { label: "Bar", value: "bar" },
  { label: "Stacked Area", value: "stackedArea" },
  { label: "Line", value: "line" },
  { label: "Stacked Bar", value: "stackedBar" },
  { label: "Pie", value: "pie" },
  { label: "Table", value: "table" },
];
