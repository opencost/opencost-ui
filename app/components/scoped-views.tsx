import { Tile, Select, SelectItem } from "@carbon/react";

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

export interface Filters {
  allocationWindow?: string;
  allocationAggregateBy?: string;
  allocationAccumulate?: boolean;
  allocationIncludeIdle?: boolean;
}

interface ScopedViewsProps {
  filters: Filters;
  onFiltersChanged: (filters: Filters) => void;
}

export default function ScopedViews({ filters, onFiltersChanged }: ScopedViewsProps) {
  const updateFilter = (key: keyof Filters, value: string | boolean) => {
    onFiltersChanged({ ...filters, [key]: value });
  };

  const allocationWindow = filters.allocationWindow ?? DEFAULT_ALLOCATION_FILTERS.allocationWindow;
  const allocationAggregateBy = filters.allocationAggregateBy ?? DEFAULT_ALLOCATION_FILTERS.allocationAggregateBy;
  const allocationAccumulate = filters.allocationAccumulate ?? DEFAULT_ALLOCATION_FILTERS.allocationAccumulate;
  const allocationIncludeIdle = filters.allocationIncludeIdle ?? DEFAULT_ALLOCATION_FILTERS.allocationIncludeIdle;

  return (
    <div style={{ width: "100%" }}>
      <Tile style={{ padding: "1.5rem", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>Filters</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            alignItems: "flex-end",
          }}
        >
          <Select
            id="allocation-window"
            labelText="Window"
            value={allocationWindow}
            size="sm"
            onChange={(e) => updateFilter("allocationWindow", e.target.value)}
          >
            {ALLOCATION_WINDOW_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} text={o.name} />
            ))}
          </Select>
          <Select
            id="allocation-aggregate"
            labelText="Aggregate by"
            value={allocationAggregateBy}
            size="sm"
            onChange={(e) => updateFilter("allocationAggregateBy", e.target.value)}
          >
            {ALLOCATION_AGGREGATE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} text={o.name} />
            ))}
          </Select>
          <Select
            id="allocation-accumulate"
            labelText="Time"
            value={String(allocationAccumulate)}
            size="sm"
            onChange={(e) => updateFilter("allocationAccumulate", e.target.value === "true")}
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
              checked={!!allocationIncludeIdle}
              onChange={(e) => updateFilter("allocationIncludeIdle", e.target.checked)}
            />
            Include idle costs
          </label>
        </div>
      </Tile>
    </div>
  );
}
