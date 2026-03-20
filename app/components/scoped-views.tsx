import { Tile, Select, SelectItem } from "@carbon/react";
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

interface ScopedViewsProps {
  filters: Filters;
  onFiltersChanged: (filters: Filters) => void;
  hasCloudWidgets?: boolean;
}

export default function ScopedViews({
  filters,
  onFiltersChanged,
  hasCloudWidgets = false,
}: ScopedViewsProps) {
  const updateFilter = (key: keyof Filters, value: string | boolean) => {
    onFiltersChanged({ ...filters, [key]: value });
  };

  const allocationWindow = filters.allocationWindow ?? DEFAULT_ALLOCATION_FILTERS.allocationWindow;
  const allocationAggregateBy = filters.allocationAggregateBy ?? DEFAULT_ALLOCATION_FILTERS.allocationAggregateBy;
  const allocationAccumulate = filters.allocationAccumulate ?? DEFAULT_ALLOCATION_FILTERS.allocationAccumulate;
  const allocationIncludeIdle = filters.allocationIncludeIdle ?? DEFAULT_ALLOCATION_FILTERS.allocationIncludeIdle;

  const cloudWindow = filters.cloudWindow ?? DEFAULT_CLOUD_FILTERS.cloudWindow;
  const cloudAggregateBy = filters.cloudAggregateBy ?? DEFAULT_CLOUD_FILTERS.cloudAggregateBy;
  const cloudCostMetric = filters.cloudCostMetric ?? DEFAULT_CLOUD_FILTERS.cloudCostMetric;
  const cloudCurrency = filters.cloudCurrency ?? DEFAULT_CLOUD_FILTERS.cloudCurrency;

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

        {hasCloudWidgets && (
          <>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid #e0e0e0",
                margin: "1.25rem 0",
              }}
            />
            <h4
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#525252",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Cloud cost
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1rem",
                alignItems: "flex-end",
              }}
            >
              <Select
                id="cloud-window"
                labelText="Date range"
                value={cloudWindow}
                size="sm"
                onChange={(e) => updateFilter("cloudWindow", e.target.value)}
              >
                {CLOUD_WINDOW_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} text={o.name} />
                ))}
              </Select>
              <Select
                id="cloud-breakdown"
                labelText="Breakdown"
                value={cloudAggregateBy}
                size="sm"
                onChange={(e) => updateFilter("cloudAggregateBy", e.target.value)}
              >
                {CLOUD_AGGREGATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} text={o.name} />
                ))}
              </Select>
              <Select
                id="cloud-cost-metric"
                labelText="Cost metric"
                value={cloudCostMetric}
                size="sm"
                onChange={(e) => updateFilter("cloudCostMetric", e.target.value)}
              >
                {CLOUD_COST_METRIC_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} text={o.name} />
                ))}
              </Select>
              <Select
                id="cloud-currency"
                labelText="Currency"
                value={cloudCurrency}
                size="sm"
                onChange={(e) => updateFilter("cloudCurrency", e.target.value)}
              >
                {currencyCodes.map((c) => (
                  <SelectItem key={c} value={c} text={c} />
                ))}
              </Select>
            </div>
          </>
        )}
      </Tile>
    </div>
  );
}
