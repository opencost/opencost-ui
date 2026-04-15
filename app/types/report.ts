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
  measure: AllocationMeasure;
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

export const REPORT_WINDOW_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 24h", value: "24h" },
  { label: "Last 48h", value: "48h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 14 days", value: "14d" },
  { label: "Last week", value: "lastweek" },
];

export const REPORT_DEFAULT_QUERY: AllocationReportQuery = {
  layer: "allocation",
  window: "7d",
  step: "1d",
  accumulate: false,
  includeIdle: true,
  measure: "totalCost",
  groupings: ["namespace"],
  filters: [],
  currency: "USD",
  chartType: "stackedArea",
};

export const REPORT_CHART_TYPE_OPTIONS: { label: string; value: ReportChartType }[] = [
  { label: "Stacked Area", value: "stackedArea" },
  { label: "Line", value: "line" },
  { label: "Bar", value: "bar" },
  { label: "Stacked Bar", value: "stackedBar" },
  { label: "Pie", value: "pie" },
  { label: "Table", value: "table" },
];
