
export interface AssetData {
  name?: string;
  type?: string;
  cpuCost?: number;
  gpuCost?: number;
  ramCost?: number;
  adjustment?: number;
  totalCost?: number;
  properties?: Record<string, string>;
  start?: string;
  end?: string;
  minutes?: number;
  cpuCores?: number;
  ramBytes?: number;
  gpuCount?: number;
}

export interface TotalData {
  cpuCost: number;
  gpuCost: number;
  ramCost: number;
  totalCost: number;
  adjustment: number;
}

export interface HeadCell {
  id: string;
  numeric: boolean;
  label: string;
  width: number | string;
}

export interface ErrorItem {
  primary: string;
  secondary: string;
}

export interface AssetsChartProps {
  assetData?: AssetData[];
  currency?: string;
  height?: number;
  n?: number;
}

export interface AssetsTableProps {
  assetData?: AssetData[];
  totalData?: TotalData;
  currency?: string;
  drilldown?: (row: AssetData) => void;
}

export interface AssetsControlsProps {
  window: string;
  setWindow: (value: string) => void;
  aggregateBy: string;
  setAggregateBy: (value: string) => void;
  accumulate: boolean;
  setAccumulate: (value: boolean) => void;
  currency: string;
  setCurrency: (value: string) => void;
}
