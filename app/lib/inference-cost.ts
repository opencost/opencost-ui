import type {
  InferenceCost,
  InferenceCostSet,
  InferenceCostSetRange,
} from "~/services/inference-cost";

/** Aggregate dimensions supported by `/inferenceCost/*` (see opencost pkg/inferencecost). */
export const INFERENCE_AGGREGATE_OPTIONS = [
  { name: "Model name", value: "model_name" },
  { name: "Model version", value: "model_version" },
  { name: "Namespace", value: "namespace" },
  { name: "Cluster", value: "cluster" },
  { name: "Pod", value: "pod" },
  { name: "Controller", value: "controller" },
  { name: "Controller kind", value: "controller_kind" },
  { name: "Container", value: "container" },
  { name: "Workload type", value: "workload_type" },
];

/** Accumulate steps accepted by `/inferenceCost/timeseries`. */
export const INFERENCE_ACCUMULATE_OPTIONS = [
  { name: "Hourly", value: "hour" },
  { name: "Daily", value: "day" },
  { name: "Weekly", value: "week" },
  { name: "Monthly", value: "month" },
];

export const INFERENCE_COST_BASIS_OPTIONS = [
  { name: "Allocation (incl. idle + shared)", value: "allocation" },
  { name: "Usage", value: "usage" },
];

export type InferenceMetric = "totalCost" | "costPerMillionTokens" | "totalTokens";

export const INFERENCE_METRIC_OPTIONS: { name: string; value: InferenceMetric }[] = [
  { name: "Total cost", value: "totalCost" },
  { name: "Cost per 1M tokens", value: "costPerMillionTokens" },
  { name: "Total tokens", value: "totalTokens" },
];

/** Rates do not sum across models, so they are drawn unstacked with no "other" bucket. */
export function isAdditiveMetric(metric: InferenceMetric): boolean {
  return metric !== "costPerMillionTokens";
}

export interface ChartPoint {
  group: string;
  key: string;
  value: number;
}

export const OTHER_KEY = "other";

function stepLabel(start: string | undefined, hourly: boolean): string {
  if (!start) return "?";
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return "?";
  const opts: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  };
  if (hourly) {
    opts.hour = "2-digit";
    opts.hourCycle = "h23";
  }
  return d.toLocaleString("en-US", opts);
}

/**
 * Builds stacked/grouped chart points from a timeseries response.
 *
 * The top N keys are ranked by total cost across the WHOLE range (not per
 * step) so a key keeps one colour and one legend entry on every bar. For
 * additive metrics the remainder is folded into "other"; for rates it is
 * dropped, since summing per-model rates would be meaningless.
 */
export function buildInferenceChartData(
  range: InferenceCostSetRange | undefined,
  metric: InferenceMetric,
  topN: number,
  hourly = false,
): ChartPoint[] {
  const sets = range?.inferenceCostSets ?? [];
  const totals = new Map<string, number>();
  for (const set of sets) {
    for (const [key, ic] of Object.entries(set.inferenceCosts ?? {})) {
      const rank = metric === "totalTokens" ? ic.totalTokens : ic.totalCost;
      totals.set(key, (totals.get(key) ?? 0) + (rank ?? 0));
    }
  }
  const top = new Set(
    [...totals.entries()]
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, topN)
      .map(([k]) => k),
  );
  const additive = isAdditiveMetric(metric);

  const points: ChartPoint[] = [];
  for (const set of sets) {
    const group = stepLabel(set.window?.start, hourly);
    let other = 0;
    for (const [key, ic] of Object.entries(set.inferenceCosts ?? {})) {
      const value = ic[metric] ?? 0;
      if (top.has(key)) {
        if (value !== 0) points.push({ group, key, value });
      } else if (additive) {
        other += value;
      }
    }
    if (other > 0) points.push({ group, key: OTHER_KEY, value: other });
  }
  return points;
}

export interface IdleRow {
  key: string;
  allocationCost: number;
  usageCost: number;
  /** allocation − usage: idle AND shared-infra cost, clamped at 0. */
  idleCost: number;
  /** idleCost / allocationCost, in [0, 1]. */
  idleFraction: number;
  totalTokens: number;
  /** No tokens in the window, so the API reports usage as 0 by definition. */
  noTokens: boolean;
}

export type IdleSort = "idleCost" | "idleFraction";

export const IDLE_SORT_OPTIONS: { name: string; value: IdleSort }[] = [
  { name: "Idle + shared $", value: "idleCost" },
  { name: "Idle + shared %", value: "idleFraction" },
];

export type SortDirection = "desc" | "asc";

export const SORT_DIRECTION_OPTIONS: { name: string; value: SortDirection }[] = [
  { name: "Highest first", value: "desc" },
  { name: "Lowest first", value: "asc" },
];

export interface IdleRanking {
  rows: IdleRow[];
  /** Keys with no allocation cost (e.g. tokens observed but no matching pod cost). */
  hiddenNoCost: number;
}

/**
 * Joins the allocation-basis and usage-basis totals on their aggregate key.
 * The API has no idle basis, so idle is derived as allocation − usage, which
 * also contains the shared-infra share; the UI labels it "idle + shared".
 */
export function buildIdleRanking(
  allocation: InferenceCostSet | undefined,
  usage: InferenceCostSet | undefined,
  sortBy: IdleSort,
  direction: SortDirection = "desc",
): IdleRanking {
  const alloc = allocation?.inferenceCosts ?? {};
  const used = usage?.inferenceCosts ?? {};
  const rows: IdleRow[] = [];
  let hiddenNoCost = 0;

  for (const [key, ic] of Object.entries(alloc) as [string, InferenceCost][]) {
    const allocationCost = ic.totalCost ?? 0;
    if (allocationCost <= 0) {
      hiddenNoCost++;
      continue;
    }
    const usageCost = Math.min(used[key]?.totalCost ?? 0, allocationCost);
    const idleCost = Math.max(allocationCost - usageCost, 0);
    rows.push({
      key,
      allocationCost,
      usageCost,
      idleCost,
      idleFraction: idleCost / allocationCost,
      totalTokens: ic.totalTokens ?? 0,
      noTokens: (ic.totalTokens ?? 0) === 0,
    });
  }

  const sign = direction === "desc" ? 1 : -1;
  rows.sort(
    (a, b) =>
      sign * (b[sortBy] - a[sortBy]) ||
      sign * (b.idleCost - a.idleCost) ||
      a.key.localeCompare(b.key),
  );
  return { rows, hiddenNoCost };
}

export type CostPerMillionMetric =
  | "costPerMillionTokens"
  | "inputCostPerMillionTokens"
  | "outputCostPerMillionTokens";

export const COST_PER_MILLION_METRIC_OPTIONS: { name: string; value: CostPerMillionMetric }[] = [
  { name: "Blended (input + output)", value: "costPerMillionTokens" },
  { name: "Input tokens", value: "inputCostPerMillionTokens" },
  { name: "Output tokens", value: "outputCostPerMillionTokens" },
];

export interface CostPerMillionRow {
  key: string;
  value: number;
  totalCost: number;
  totalTokens: number;
  /** value / max(value) across rows, in (0, 1]. Drives bar length and colour. */
  fraction: number;
}

/**
 * Rows for the cost-per-1M-tokens bar gauge, cheapest first. Entries with no
 * tokens or no cost have no meaningful rate and are counted in `hidden`.
 */
export function buildCostPerMillionRows(
  set: InferenceCostSet | undefined,
  metric: CostPerMillionMetric,
): { rows: CostPerMillionRow[]; hidden: number } {
  const rows: CostPerMillionRow[] = [];
  let hidden = 0;
  for (const [key, ic] of Object.entries(set?.inferenceCosts ?? {})) {
    const value = ic[metric] ?? 0;
    if (!(value > 0) || !((ic.totalTokens ?? 0) > 0)) {
      hidden++;
      continue;
    }
    rows.push({ key, value, totalCost: ic.totalCost ?? 0, totalTokens: ic.totalTokens, fraction: 0 });
  }
  // Every row has value > 0, so max > 0 whenever there is a row to scale.
  const max = Math.max(0, ...rows.map((r) => r.value));
  for (const r of rows) r.fraction = r.value / max;
  rows.sort((a, b) => a.value - b.value || a.key.localeCompare(b.key));
  return { rows, hidden };
}

/** Gauge stops, low → high cost. Carbon green 50, yellow 30, orange 40, red 50. */
export const GAUGE_STOPS = ["#24a148", "#f1c21b", "#ff832b", "#fa4d56"];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Colour of the gauge gradient at position t ∈ [0, 1] (clamped). */
export function gaugeColor(t: number, stops: string[] = GAUGE_STOPS): string {
  const x = Math.min(Math.max(Number.isFinite(t) ? t : 0, 0), 1) * (stops.length - 1);
  const i = Math.min(Math.floor(x), stops.length - 2);
  const f = x - i;
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[i + 1]);
  const mix = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `#${mix.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
