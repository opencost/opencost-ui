import { Select, SelectItem, ComboBox, Button } from "@carbon/react";
import { Filter } from "@carbon/icons-react";
import {
  CLOUD_WINDOW_OPTIONS,
  CLOUD_AGGREGATION_OPTIONS,
  CLOUD_COST_METRIC_OPTIONS,
} from "~/constants/cloud-cost-options";
import { REPORT_ACCUMULATE_OPTIONS } from "~/types/report";

type AggregateOption = { name: string; value: string };

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
  {
    name: "label:app.kubernetes.io/name",
    value: "label:app.kubernetes.io/name",
  },
];

export const DEFAULT_ALLOCATION_FILTERS = {
  allocationWindow: "7d",
  allocationAggregateBy: "namespace",
  allocationAccumulate: "day",
  allocationIncludeIdle: true,
  allocationIncludeUnallocated: true,
};

export const DEFAULT_CLOUD_FILTERS = {
  cloudWindow: "7d",
  cloudAggregateBy: "provider",
  cloudCostMetric: "AmortizedNetCost",
};

export interface AllocationFilterValues {
  window: string;
  aggregateBy: string;
  /** `/allocation/compute` `accumulate` param (e.g. `day`, `weeknow`, `all`). */
  accumulate: string;
  includeIdle: boolean;
  includeUnallocated: boolean;
  drilldownAggregateBy?: string;
  drilldownFilters?: { property: string; value: string }[];
}

export interface CloudFilterValues {
  window: string;
  aggregateBy: string;
  costMetric: string;
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
  allocationAccumulate?: string;
  allocationIncludeIdle?: boolean;
  cloudWindow?: string;
  cloudAggregateBy?: string;
  cloudCostMetric?: string;
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
  accumulate: string;
  includeIdle: boolean;
  includeUnallocated?: boolean;
  onWindowChange: (v: string) => void;
  onAggregateByChange: (v: string) => void;
  onAccumulateChange: (v: string) => void;
  onIncludeIdleChange: (v: boolean) => void;
  onIncludeUnallocatedChange?: (v: boolean) => void;
  idPrefix?: string;
  compact?: boolean;
}

function AllocationAggregateByCombo({
  idPrefix,
  aggregateBy,
  onAggregateByChange,
}: {
  idPrefix: string;
  aggregateBy: string;
  onAggregateByChange: (v: string) => void;
}) {
  const presetMatch = ALLOCATION_AGGREGATE_OPTIONS.find(
    (o) => o.value === aggregateBy,
  );
  const selectedItem: AggregateOption =
    presetMatch ?? { name: aggregateBy, value: aggregateBy };
  const items: AggregateOption[] = presetMatch
    ? ALLOCATION_AGGREGATE_OPTIONS
    : [...ALLOCATION_AGGREGATE_OPTIONS, selectedItem];

  return (
    <ComboBox
      id={`${idPrefix}-aggregate`}
      titleText="Aggregate by"
      size="sm"
      items={items}
      itemToString={(item: AggregateOption | null) => item?.name ?? ""}
      selectedItem={selectedItem}
      allowCustomValue
      onChange={({
        selectedItem: picked,
        inputValue,
      }: {
        selectedItem?: AggregateOption | null;
        inputValue?: string | null;
      }) => {
        if (picked) {
          onAggregateByChange(picked.value);
          return;
        }
        const typed = (inputValue ?? "").trim();
        if (!typed || typed === aggregateBy) return;
        onAggregateByChange(typed.includes(":") ? typed : `label:${typed}`);
      }}
    />
  );
}

export function AllocationFilterControls({
  window,
  aggregateBy,
  accumulate,
  includeIdle,
  includeUnallocated,
  onWindowChange,
  onAggregateByChange,
  onAccumulateChange,
  onIncludeIdleChange,
  onIncludeUnallocatedChange,
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
      <AllocationAggregateByCombo
        idPrefix={idPrefix}
        aggregateBy={aggregateBy}
        onAggregateByChange={onAggregateByChange}
      />
      <Select
        id={`${idPrefix}-accumulate`}
        labelText="Granularity"
        value={accumulate}
        size="sm"
        onChange={(e) => onAccumulateChange(e.target.value)}
      >
        {REPORT_ACCUMULATE_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.label} />
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
      {onIncludeUnallocatedChange ? (
        <label className="flex items-end gap-2 text-sm cursor-pointer pb-2">
          <input
            type="checkbox"
            checked={includeUnallocated !== false}
            onChange={(e) => onIncludeUnallocatedChange(e.target.checked)}
          />
          Include unallocated costs
        </label>
      ) : null}
    </div>
  );
}

interface CloudFilterControlsProps {
  window: string;
  aggregateBy: string;
  costMetric: string;
  onWindowChange: (v: string) => void;
  onAggregateByChange: (v: string) => void;
  onCostMetricChange: (v: string) => void;
  idPrefix?: string;
  compact?: boolean;
}

export function CloudFilterControls({
  window,
  aggregateBy,
  costMetric,
  onWindowChange,
  onAggregateByChange,
  onCostMetricChange,
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
