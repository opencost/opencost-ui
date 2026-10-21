import { Select, SelectItem } from "@carbon/react";
import { isAxiosError } from "axios";
import { ALLOCATION_WINDOW_OPTIONS } from "./scoped-views";
import { INFERENCE_AGGREGATE_OPTIONS } from "~/lib/inference-cost";
import { checkCustomWindow, toVerboseTimeRange } from "~/lib/legacy-util";

/** Shared pieces for the inference cost widgets (trend, cost per 1M tokens, idle ranking). */

export function optionName(opts: { name: string; value: string }[], value: string) {
  return opts.find((o) => o.value === value)?.name ?? value;
}

export function windowName(window: string): string {
  const named = ALLOCATION_WINDOW_OPTIONS.find((o) => o.value === window)?.name;
  if (named) return named;
  if (checkCustomWindow(window)) return toVerboseTimeRange(window) ?? window;
  return window;
}

export function aggregateName(aggregateBy: string): string {
  return optionName(INFERENCE_AGGREGATE_OPTIONS, aggregateBy).toLowerCase();
}

export function formatTokens(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function inferenceErrorMessage(e: unknown): string {
  const status = isAxiosError(e) ? e.response?.status : undefined;
  if (status === 501) return "Inference cost tracking is not enabled on this OpenCost instance.";
  if (status === 504)
    return "Timed out waiting for inference costs. Try a shorter window, or raise the UI proxy's INFERENCE_PROXY_READ_TIMEOUT.";
  return "Failed to load inference costs.";
}

/** Window + aggregate selects, rendered inside each widget's filter grid. */
export function InferenceWindowAggregateSelects({
  idPrefix,
  window,
  aggregateBy,
  onWindowChange,
  onAggregateByChange,
}: {
  idPrefix: string;
  window: string;
  aggregateBy: string;
  onWindowChange: (v: string) => void;
  onAggregateByChange: (v: string) => void;
}) {
  return (
    <>
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
        {INFERENCE_AGGREGATE_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} text={o.name} />
        ))}
      </Select>
    </>
  );
}

export function InferenceFilterGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid items-end gap-3 mb-3"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}
    >
      {children}
    </div>
  );
}

export function InferenceEmptyState({ message }: { message: string }) {
  return (
    <div className="v2-empty-state" style={{ minHeight: "10rem" }}>
      <p className="v2-empty-state__description">{message}</p>
    </div>
  );
}

export function InferenceLoading({ height = 400 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center text-[var(--cds-text-placeholder)]"
      style={{ height }}
    >
      Loading…
    </div>
  );
}
