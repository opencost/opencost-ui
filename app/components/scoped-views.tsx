import { Select, SelectItem, Button } from "@carbon/react";
import { Filter } from "@carbon/icons-react";
import { currencyCodes } from "~/constants/currencyCodes";
import {
  CLOUD_WINDOW_OPTIONS,
  CLOUD_AGGREGATION_OPTIONS,
  CLOUD_COST_METRIC_OPTIONS,
} from "~/constants/cloud-cost-options";

export const ALLOCATION_WINDOW_OPTIONS = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
];

export const ALLOCATION_AGGREGATE_OPTIONS = [
  { name: "Cluster", value: "cluster" },
  { name: "Node", value: "node" },
  { name: "Namespace", value: "namespace" },
  { name: "Controller Kind", value: "controllerKind" },
  { name: "Controller", value: "controller" },
  { name: "DaemonSet", value: "daemonset" },
  { name: "Deployment", value: "deployment" },
  { name: "Job", value: "job" },
  { name: "Service", value: "service" },
  { name: "StatefulSet", value: "statefulset" },
  { name: "Pod", value: "pod" },
  { name: "Container", value: "container" },
];

export const DEFAULT_ALLOCATION_FILTERS = {
  allocationWindow: "7d",
  allocationAggregateBy: "namespace",
  allocationAccumulate: false,
  allocationIncludeIdle: true,
  allocationCurrency: "USD",
};

export const DEFAULT_CLOUD_FILTERS = {
  cloudWindow: "7d",
  cloudAggregateBy: "provider",
  cloudCostMetric: "AmortizedNetCost",
  cloudCurrency: "USD",
};

export interface AllocationFilterValues {
  window: string;
  aggregateBy: string;
  accumulate: boolean;
  includeIdle: boolean;
  currency: string;
  drilldownAggregateBy?: string;
  drilldownFilters?: { property: string; value: string }[];
}

export interface CloudFilterValues {
  window: string;
  aggregateBy: string;
  costMetric: string;
  currency: string;
}

export const ASSETS_WINDOW_OPTIONS = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
  { name: "Last 30 days", value: "30d" },
];

export const ASSETS_AGGREGATE_OPTIONS = [
  { name: "Asset Type", value: "assetType" },
  { name: "Category", value: "category" },
  { name: "Cluster", value: "cluster" },
  { name: "Provider", value: "provider" },
  { name: "Account", value: "account" },
  { name: "Service", value: "service" },
  { name: "Project", value: "project" },
  { name: "Provider ID", value: "providerID" },
];

export const DEFAULT_ASSETS_FILTERS = {
  assetsWindow: "7d",
  assetsAggregateBy: "assetType",
  assetsAccumulate: true,
  assetsIncludeIdle: true,
};

export interface AssetsFilterValues {
  window: string;
  aggregateBy: string;
  accumulate: boolean;
  includeIdle: boolean;
}

export interface Filters {
  allocationWindow?: string;
  allocationAggregateBy?: string;
  allocationAccumulate?: boolean;
  allocationIncludeIdle?: boolean;
  cloudWindow?: string;
  cloudAggregateBy?: string;
  cloudCostMetric?: string;
  cloudCurrency?: string;
}

export interface FilterableWidgetHeaderProps {
  title: string;
  description?: string;
  expanded: boolean;
  onToggle: () => void;
  filterContent?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function FilterableWidgetHeader({
  title,
  description,
  expanded,
  onToggle,
  filterContent,
  headerActions,
}: FilterableWidgetHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold m-0">{title}</h3>
          {description && (
            <p className="text-sm text-[var(--cds-text-secondary)] mt-1 mb-0">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          <Button
            kind={expanded ? "primary" : "secondary"}
            size="sm"
            renderIcon={Filter}
            iconDescription="Toggle options"
            onClick={onToggle}
          >
            {expanded ? "Collapse options" : "Options"}
          </Button>
        </div>
      </div>
      {expanded && filterContent && (
        <div className="mt-4 pt-4 border-t border-[var(--cds-border-subtle)]">
          {filterContent}
        </div>
      )}
    </div>
  );
}

interface AllocationFilterControlsProps {
  window: string;
  aggregateBy: string;
  accumulate: boolean;
  includeIdle: boolean;
  currency: string;
  onWindowChange: (v: string) => void;
  onAggregateByChange: (v: string) => void;
  onAccumulateChange: (v: boolean) => void;
  onIncludeIdleChange: (v: boolean) => void;
  onCurrencyChange: (v: string) => void;
  idPrefix?: string;
  compact?: boolean;
}

export function AllocationFilterControls({
  window,
  aggregateBy,
  accumulate,
  includeIdle,
  currency,
  onWindowChange,
  onAggregateByChange,
  onAccumulateChange,
  onIncludeIdleChange,
  onCurrencyChange,
  idPrefix = "alloc",
  compact = true,
}: AllocationFilterControlsProps) {
  return (
    <div
      className={`grid items-end ${compact ? "gap-3 mb-3" : "gap-4 mb-4"}`}
      style={{
        gridTemplateColumns: compact
          ? "repeat(auto-fit, minmax(120px, 1fr))"
          : "repeat(auto-fit, minmax(160px, 1fr))",
      }}
    >
      <Select
        id={`${idPrefix}-window`}
        labelText="Window"
        value={window}
        size="sm"
        onChange={(e) => onWindowChange(e.target.value)}
      >
        {ALLOCATION_WINDOW_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.name} />
        ))}
      </Select>
      <Select
        id={`${idPrefix}-aggregate`}
        labelText="Aggregate by"
        value={aggregateBy}
        size="sm"
        onChange={(e) => onAggregateByChange(e.target.value)}
      >
        {ALLOCATION_AGGREGATE_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.name} />
        ))}
      </Select>
      <Select
        id={`${idPrefix}-accumulate`}
        labelText="Time"
        value={String(accumulate)}
        size="sm"
        onChange={(e) => onAccumulateChange(e.target.value === "true")}
      >
        <SelectItem value="false" text="Daily" />
        <SelectItem value="true" text="Entire window" />
      </Select>
      <Select
        id={`${idPrefix}-currency`}
        labelText="Currency"
        value={currency}
        size="sm"
        onChange={(e) => onCurrencyChange(e.target.value)}
      >
        {currencyCodes.map((c) => (
          <SelectItem key={c} value={c} text={c} />
        ))}
      </Select>
      <label className="flex items-end gap-2 text-sm cursor-pointer pb-2">
        <input
          type="checkbox"
          checked={!!includeIdle}
          onChange={(e) => onIncludeIdleChange(e.target.checked)}
        />
        Include idle costs
      </label>
    </div>
  );
}

interface CloudFilterControlsProps {
  window: string;
  aggregateBy: string;
  costMetric: string;
  currency: string;
  onWindowChange: (v: string) => void;
  onAggregateByChange: (v: string) => void;
  onCostMetricChange: (v: string) => void;
  onCurrencyChange: (v: string) => void;
  idPrefix?: string;
  compact?: boolean;
}

export function CloudFilterControls({
  window,
  aggregateBy,
  costMetric,
  currency,
  onWindowChange,
  onAggregateByChange,
  onCostMetricChange,
  onCurrencyChange,
  idPrefix = "cloud",
  compact = true,
}: CloudFilterControlsProps) {
  return (
    <div
      className={`grid items-end ${compact ? "gap-3 mb-3" : "gap-4 mb-4"}`}
      style={{
        gridTemplateColumns: compact
          ? "repeat(auto-fit, minmax(120px, 1fr))"
          : "repeat(auto-fit, minmax(140px, 1fr))",
      }}
    >
      <Select
        id={`${idPrefix}-window`}
        labelText="Date range"
        value={window}
        size="sm"
        onChange={(e) => onWindowChange(e.target.value)}
      >
        {CLOUD_WINDOW_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.name} />
        ))}
      </Select>
      <Select
        id={`${idPrefix}-breakdown`}
        labelText="Breakdown"
        value={aggregateBy}
        size="sm"
        onChange={(e) => onAggregateByChange(e.target.value)}
      >
        {CLOUD_AGGREGATION_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.name} />
        ))}
      </Select>
      <Select
        id={`${idPrefix}-cost-metric`}
        labelText="Cost metric"
        value={costMetric}
        size="sm"
        onChange={(e) => onCostMetricChange(e.target.value)}
      >
        {CLOUD_COST_METRIC_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.name} />
        ))}
      </Select>
      <Select
        id={`${idPrefix}-currency`}
        labelText="Currency"
        value={currency}
        size="sm"
        onChange={(e) => onCurrencyChange(e.target.value)}
      >
        {currencyCodes.map((c) => (
          <SelectItem key={c} value={c} text={c} />
        ))}
      </Select>
    </div>
  );
}

interface AssetsFilterControlsProps {
  window: string;
  aggregateBy: string;
  accumulate: boolean;
  includeIdle: boolean;
  onWindowChange: (v: string) => void;
  onAggregateByChange: (v: string) => void;
  onAccumulateChange: (v: boolean) => void;
  onIncludeIdleChange: (v: boolean) => void;
  idPrefix?: string;
  compact?: boolean;
}

export function AssetsFilterControls({
  window,
  aggregateBy,
  accumulate,
  includeIdle,
  onWindowChange,
  onAggregateByChange,
  onAccumulateChange,
  onIncludeIdleChange,
  idPrefix = "assets",
  compact = true,
}: AssetsFilterControlsProps) {
  return (
    <div
      className={`grid items-end ${compact ? "gap-3 mb-3" : "gap-4 mb-4"}`}
      style={{
        gridTemplateColumns: compact
          ? "repeat(auto-fit, minmax(120px, 1fr))"
          : "repeat(auto-fit, minmax(160px, 1fr))",
      }}
    >
      <Select
        id={`${idPrefix}-window`}
        labelText="Window"
        value={window}
        size="sm"
        onChange={(e) => onWindowChange(e.target.value)}
      >
        {ASSETS_WINDOW_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.name} />
        ))}
      </Select>
      <Select
        id={`${idPrefix}-aggregate`}
        labelText="Aggregate by"
        value={aggregateBy}
        size="sm"
        onChange={(e) => onAggregateByChange(e.target.value)}
      >
        {ASSETS_AGGREGATE_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.name} />
        ))}
      </Select>
      <Select
        id={`${idPrefix}-accumulate`}
        labelText="Time"
        value={String(accumulate)}
        size="sm"
        onChange={(e) => onAccumulateChange(e.target.value === "true")}
      >
        <SelectItem value="true" text="Entire window" />
        <SelectItem value="false" text="Daily" />
      </Select>
      <label className="flex items-end gap-2 text-sm cursor-pointer pb-2">
        <input
          type="checkbox"
          checked={!!includeIdle}
          onChange={(e) => onIncludeIdleChange(e.target.checked)}
        />
        Include idle
      </label>
    </div>
  );
}
