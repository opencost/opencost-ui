import { useEffect, useMemo, useState } from "react";
import { Select, SelectItem, Tag } from "@carbon/react";
import { useSettings } from "~/components/settings-context";
import { FilterableWidgetHeader } from "./scoped-views";
import {
  InferenceEmptyState,
  InferenceFilterGrid,
  InferenceLoading,
  InferenceWindowAggregateSelects,
  aggregateName,
  inferenceErrorMessage,
  windowName,
} from "./inference-cost-shared";
import InferenceCostService, { type InferenceCostSet } from "~/services/inference-cost";
import {
  IDLE_SORT_OPTIONS,
  SORT_DIRECTION_OPTIONS,
  buildIdleRanking,
  type IdleRow,
  type IdleSort,
  type SortDirection,
} from "~/lib/inference-cost";
import { toCurrency } from "~/lib/legacy-util";

function IdleRankingList({
  rows,
  hiddenNoCost,
  currency,
  topN,
}: {
  rows: IdleRow[];
  hiddenNoCost: number;
  currency: string;
  topN: number;
}) {
  const shown = rows.slice(0, topN);
  return (
    <div className="px-2" data-testid="inference-idle-ranking">
      <div
        className="flex flex-wrap justify-end gap-4 text-xs mb-3"
        style={{ color: "var(--cds-text-secondary)" }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "var(--cds-support-info)" }} />
          Usage
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "var(--cds-support-warning)" }} />
          Idle + shared
        </span>
      </div>
      <ul className="m-0 p-0 list-none flex flex-col gap-3">
        {shown.map((r) => {
          const pct = Math.round(r.idleFraction * 100);
          const label = `${toCurrency(r.idleCost, currency)} of ${toCurrency(r.allocationCost, currency)}`;
          return (
            <li key={r.key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="truncate" title={r.key}>
                    {r.key}
                  </span>
                  {r.noTokens && (
                    <Tag
                      type="warm-gray"
                      size="sm"
                      title="No tokens served in this window, so usage cost is 0 by definition"
                    >
                      No tokens
                    </Tag>
                  )}
                </span>
                <span className="flex-shrink-0 text-xs" style={{ color: "var(--cds-text-secondary)" }}>
                  <strong style={{ color: "var(--cds-text-primary)" }}>{pct}% idle + shared</strong>
                  {" · "}
                  {label}
                </span>
              </div>
              <div
                className="flex h-3 mt-1 rounded overflow-hidden"
                style={{ background: "var(--cds-layer-accent-01)" }}
                role="img"
                aria-label={`${r.key}: ${pct}% idle and shared, ${label}`}
              >
                <div style={{ width: `${100 - r.idleFraction * 100}%`, background: "var(--cds-support-info)" }} />
                <div style={{ width: `${r.idleFraction * 100}%`, background: "var(--cds-support-warning)" }} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="m-0 mt-4 text-xs" style={{ color: "var(--cds-text-secondary)" }}>
        Idle + shared = allocation cost − usage cost, so it includes the shared-infrastructure share
        (EPP, gateway) as well as idle.
        {rows.length > shown.length && ` Showing ${shown.length} of ${rows.length}.`}
        {hiddenNoCost > 0 &&
          ` ${hiddenNoCost} ${hiddenNoCost === 1 ? "entry" : "entries"} with no allocated cost hidden.`}
      </p>
    </div>
  );
}

export interface InferenceIdleWidgetProps {
  title?: string;
  window?: string;
  aggregateBy?: string;
  currency?: string;
  topN?: number;
  /** Initial order: "desc" (most idle first, the default) or "asc". */
  direction?: SortDirection;
}

/**
 * Right-sizing style ranking of inference workloads by idle + shared cost
 * (allocation basis − usage basis) over the whole window.
 */
export default function InferenceIdleWidget({
  title = "AI Inference Idle Cost",
  window: windowProp = "7d",
  aggregateBy: aggregateByProp = "model_name",
  currency: currencyProp,
  topN = 10,
  direction: directionProp = "desc",
}: InferenceIdleWidgetProps) {
  const { defaultCurrency } = useSettings();
  const currency = currencyProp ?? defaultCurrency;

  const [showFilters, setShowFilters] = useState(false);
  const [window, setWindow] = useState(windowProp);
  const [aggregateBy, setAggregateBy] = useState(aggregateByProp);
  const [sortBy, setSortBy] = useState<IdleSort>("idleCost");
  const [direction, setDirection] = useState<SortDirection>(directionProp);

  const [totals, setTotals] = useState<{ allocation?: InferenceCostSet; usage?: InferenceCostSet }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Sequential on purpose: each basis is a full ComputeAllocation pass
        // server-side (~40-80s for 7d), and two concurrent 7d queries were
        // observed to drop both connections and take the backend down.
        const allocation = await InferenceCostService.fetchTotal({ window, aggregate: aggregateBy, costBasis: "allocation" });
        const usage = await InferenceCostService.fetchTotal({ window, aggregate: aggregateBy, costBasis: "usage" });
        if (!cancelled) setTotals({ allocation, usage });
      } catch (e: unknown) {
        if (!cancelled) setError(inferenceErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [window, aggregateBy]);

  const idle = useMemo(
    () => buildIdleRanking(totals.allocation, totals.usage, sortBy, direction),
    [totals, sortBy, direction],
  );

  let body: React.ReactNode;
  if (loading) body = <InferenceLoading />;
  else if (error) body = <InferenceEmptyState message={error} />;
  else if (idle.rows.length === 0) body = <InferenceEmptyState message="No inference costs in this window" />;
  else body = <IdleRankingList rows={idle.rows} hiddenNoCost={idle.hiddenNoCost} currency={currency} topN={topN} />;

  return (
    <div className="w-full">
      <FilterableWidgetHeader
        title={title}
        description={`${windowName(window)} by ${aggregateName(aggregateBy)}: ${
          direction === "desc" ? "highest" : "lowest"
        } idle + shared cost`}
        expanded={showFilters}
        onToggle={() => setShowFilters((s) => !s)}
        filterContent={
          <InferenceFilterGrid>
            <InferenceWindowAggregateSelects
              idPrefix="inference-idle"
              window={window}
              aggregateBy={aggregateBy}
              onWindowChange={setWindow}
              onAggregateByChange={setAggregateBy}
            />
            <Select
              id="inference-idle-sort"
              labelText="Sort by"
              value={sortBy}
              size="sm"
              onChange={(e) => setSortBy(e.target.value as IdleSort)}
            >
              {IDLE_SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} text={o.name} />
              ))}
            </Select>
            <Select
              id="inference-idle-direction"
              labelText="Order"
              value={direction}
              size="sm"
              onChange={(e) => setDirection(e.target.value as SortDirection)}
            >
              {SORT_DIRECTION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} text={o.name} />
              ))}
            </Select>
          </InferenceFilterGrid>
        }
      />
      {body}
    </div>
  );
}
