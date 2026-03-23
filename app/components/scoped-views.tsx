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
}

export interface CloudFilterValues {
  window: string;
  aggregateBy: string;
  costMetric: string;
  currency: string;
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
}

export function FilterableWidgetHeader({
  title,
  description,
  expanded,
  onToggle,
  filterContent,
}: FilterableWidgetHeaderProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", margin: 0 }}>{title}</h3>
          {description && (
            <p style={{ fontSize: "0.875rem", color: "#525252", margin: "0.25rem 0 0 0" }}>{description}</p>
          )}
        </div>
        <Button
          kind={expanded ? "primary" : "secondary"}
          size="sm"
          renderIcon={Filter}
          iconDescription="Toggle filters"
          onClick={onToggle}
        >
          {expanded ? "Collapse filters" : "Filters"}
        </Button>
      </div>
      {expanded && filterContent && (
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e0e0e0" }}>
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
  onWindowChange: (v: string) => void;
  onAggregateByChange: (v: string) => void;
  onAccumulateChange: (v: boolean) => void;
  onIncludeIdleChange: (v: boolean) => void;
  idPrefix?: string;
  compact?: boolean;
}

export function AllocationFilterControls({
  window,
  aggregateBy,
  accumulate,
  includeIdle,
  onWindowChange,
  onAggregateByChange,
  onAccumulateChange,
  onIncludeIdleChange,
  idPrefix = "alloc",
  compact = true,
}: AllocationFilterControlsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "repeat(auto-fit, minmax(120px, 1fr))" : "repeat(auto-fit, minmax(160px, 1fr))",
        gap: compact ? "0.75rem" : "1rem",
        alignItems: "flex-end",
        marginBottom: compact ? "0.75rem" : "1rem",
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
      <label
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "0.5rem",
          fontSize: "0.875rem",
          cursor: "pointer",
          paddingBottom: "0.5rem",
        }}
      >
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
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "repeat(auto-fit, minmax(120px, 1fr))" : "repeat(auto-fit, minmax(140px, 1fr))",
        gap: compact ? "0.75rem" : "1rem",
        alignItems: "flex-end",
        marginBottom: compact ? "0.75rem" : "1rem",
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
