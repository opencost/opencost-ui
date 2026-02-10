/**
 * Type definitions for Assets page
 * Strongly typed interfaces for asset data, chart data, and component props
 */

// ============================================
// Core Asset Types
// ============================================

/**
 * Raw asset data from API
 */
export interface RawAsset {
    type?: string;
    properties?: {
        name?: string;
        cluster?: string;
        category?: string;
        provider?: string;
        providerID?: string;
    };
    totalCost?: number;
    cpuCost?: number;
    ramCost?: number;
    gpuCost?: number;
    discount?: number;
    cost?: number;
    adjustment?: number;
    labels?: Record<string, string>;
    carbonKg?: number;
    energyKwh?: number;
}

/**
 * Processed asset data used in the UI
 */
export interface Asset {
    id: string;
    key: string;
    type: string;
    name: string;
    cluster: string;
    category: string;
    provider: string;
    providerID: string;
    totalCost: number;
    cpuCost: number;
    ramCost: number;
    gpuCost: number;
    labels: Record<string, string>;
    adjustment: number;
    carbonKg?: number;
    dailyTrend?: ChartDataPoint[];
}

/**
 * Data for Cost Over Time chart (Stacked Area)
 */
export interface AssetCostOverTime {
    date: string;
    group: string;
    value: number;
}

/**
 * Carbon emission data for an asset
 */
export interface CarbonData {
    id: string;
    type: string;
    name: string;
    category: string;
    provider: string;
    carbonKg: number;
    energyKwh: number;
}

// ============================================
// Chart Data Types
// ============================================

/**
 * Data point for Carbon Charts
 */
export interface ChartDataPoint {
    group: string;
    value: number;
}

/**
 * Provider types for color assignment
 */
export type Provider = 'AWS' | 'GCP' | 'Azure' | 'Oracle' | 'Alibaba' | 'N/A' | string;

/**
 * Asset category types
 */
export type AssetCategory = 'Compute' | 'Management' | 'Storage' | 'Network' | 'N/A' | string;

/**
 * Asset kind/type filter options
 */
export type AssetType = 'Node' | 'Disk' | 'LoadBalancer' | 'ClusterManagement' | 'all';

// ============================================
// Table Data Types
// ============================================

/**
 * Row data for ResourceBreakdownTable
 */
export interface TableRow {
    id: string;
    name: string;
    type: string;
    cluster: string;
    category: string;
    provider: string;
    cost: string;
    carbon: string;
}

/**
 * DataTable header configuration
 */
export interface TableHeader {
    key: string;
    header: string;
}

// ============================================
// Filter & Option Types
// ============================================

/**
 * Dropdown option item
 */
export interface DropdownOption {
    id: string;
    text: string;
}

/**
 * Date range window options
 */
export type DateRangeWindow =
    | 'today'
    | 'yesterday'
    | '24h'
    | '48h'
    | 'week'
    | 'lastweek'
    | '7d'
    | '14d'
    | '30d';

// ============================================
// KPI Types
// ============================================

/**
 * KPI card data structure
 */
export interface KPIData {
    id: string;
    title: string;
    value: string | number;
    subtitle?: string;
    valueColor?: string;
    highlightColor?: string;
    icon?: React.ReactNode;
    isOutlier?: boolean;
    secondaryValue?: string;
    secondaryValueColor?: string;
}

// ============================================
// Component Props Types
// ============================================

/**
 * Props for KPICard component
 */
export interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    valueColor?: string;
    highlightColor?: string;
    icon?: React.ReactNode;
    isOutlier?: boolean;
    secondaryValue?: string;
    secondaryValueColor?: string;
    className?: string;
}

/**
 * Props for KPICardRow component
 */
export interface KPICardRowProps {
    kpis: KPIData[];
    columnsPerCard?: number;
    loading?: boolean;
}

/**
 * Props for chart components
 */
export interface ChartProps {
    data: ChartDataPoint[];
    title?: string;
    loading?: boolean;
    error?: string | null;
}

/**
 * Props for CostByCategoryChart with optional formatter
 */
export interface CostByCategoryChartProps extends ChartProps {
    valueFormatter?: (value: number) => string;
}

/**
 * Props for AssetPageHeader
 */
export interface AssetPageHeaderProps {
    title?: string;
    dateRangeOptions?: DropdownOption[];
    selectedDateRange?: string;
    onDateRangeChange?: (item: DropdownOption) => void;
    onRefresh?: () => void;
}

/**
 * Props for ResourceBreakdownTable
 */
export interface ResourceBreakdownTableProps {
    rows: TableRow[];
    onExport?: () => void;
    typeFilterOptions?: DropdownOption[];
    selectedType?: string;
    onTypeChange?: (item: DropdownOption) => void;
    loading?: boolean;
    error?: string | null;
    onRowClick?: (id: string) => void;
}

// ============================================
// API Response Types
// ============================================

/**
 * Assets API response structure
 */
export interface AssetsApiResponse {
    data?: {
        Assets?: Record<string, RawAsset>;
        assets?: Record<string, RawAsset>;
    } | Record<string, RawAsset>;
    Assets?: Record<string, RawAsset>;
    assets?: Record<string, RawAsset>;
}

/**
 * State types for loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
