/**
 * Type definitions for cloud cost data used across the application
 */

export interface CloudCostFilter {
  property: string;
  value: string;
}

export interface GraphDataItem {
  start: string;
  end: string;
  items: Array<{ name: string; value: number }>;
}

export interface TableRowItem {
  name: string;
  cost: number;
  kubernetesCost: number;
  kubernetesPercent: number;
  start: string;
  end: string;
  providerID: string;
  labelName?: string;
}

export interface TableTotal {
  cost: number;
  kubernetesCost: number;
}

export interface CloudCostData {
  graphData?: GraphDataItem[];
  tableRows?: TableRowItem[];
  tableTotal?: TableTotal;
  cloudCostStatus?: string[];
  message?: string;
}

export interface CloudCostResponse {
  tableRows?: TableRowItem[];
  graphData?: GraphDataItem[];
  tableTotal?: TableTotal;
  cloudCostStatus?: string[];
  message?: string;
}

export interface SampleDataResponse {
  graphData: GraphDataItem[];
  tableRows: TableRowItem[];
  tableTotal: TableTotal;
  message?: string;
}

export interface CloudCostErrorItem {
  primary: string;
  secondary: string | React.ReactNode;
}

export interface TitleParams {
  window: string;
  aggregateBy: string;
  costMetric: string;
}
