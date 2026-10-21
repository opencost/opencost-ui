import { useEffect, useMemo, useState } from "react";
import { Select, SelectItem } from "@carbon/react";
import { useSettings } from "~/components/settings-context";
import { FilterableWidgetHeader } from "./scoped-views";
import {
  InferenceEmptyState,
  InferenceFilterGrid,
  InferenceLoading,
  InferenceWindowAggregateSelects,
  aggregateName,
  formatTokens,
  inferenceErrorMessage,
  optionName,
  windowName,
} from "./inference-cost-shared";
import InferenceCostService, {
  type InferenceCostBasis,
  type InferenceCostSet,
} from "~/services/inference-cost";
import {
  COST_PER_MILLION_METRIC_OPTIONS,
  GAUGE_STOPS,
  INFERENCE_COST_BASIS_OPTIONS,
  buildCostPerMillionRows,
  gaugeColor,
  type CostPerMillionMetric,
} from "~/lib/inference-cost";
import { toCurrency } from "~/lib/legacy-util";

const GRADIENT = `linear-gradient(to right, ${GAUGE_STOPS.join(", ")})`;

export interface InferenceCostPerMillionWidgetProps {
  title?: string;
  window?: string;
  aggregateBy?: string;
  costBasis?: InferenceCostBasis;
  metric?: CostPerMillionMetric;
  currency?: string;
  topN?: number;
}

/**
 * Bar gauge of cost per 1M tokens, cheapest first. Each bar reveals a fixed
 * green→red gradient up to its share of the most expensive row, and the value
 * is coloured to match the bar's end.
 */
export default function InferenceCostPerMillionWidget({
  title = "Cost per 1M Tokens",
  window: windowProp = "7d",
  aggregateBy: aggregateByProp = "model_name",
  costBasis: costBasisProp = "allocation",
  metric: metricProp = "costPerMillionTokens",
  currency: currencyProp,
  topN = 10,
}: InferenceCostPerMillionWidgetProps) {
  const { defaultCurrency } = useSettings();
  const currency = currencyProp ?? defaultCurrency;

  const [showFilters, setShowFilters] = useState(false);
  const [window, setWindow] = useState(windowProp);
  const [aggregateBy, setAggregateBy] = useState(aggregateByProp);
  const [costBasis, setCostBasis] = useState<InferenceCostBasis>(costBasisProp);
  const [metric, setMetric] = useState<CostPerMillionMetric>(metricProp);

  const [data, setData] = useState<InferenceCostSet | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const cancelled = () => controller.signal.aborted;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const d = await InferenceCostService.fetchTotal(
          { window, aggregate: aggregateBy, costBasis },
          controller.signal,
        );
        if (!cancelled()) setData(d);
      } catch (e: unknown) {
        if (!cancelled()) setError(inferenceErrorMessage(e));
      } finally {
        if (!cancelled()) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [window, aggregateBy, costBasis]);

  const { rows, hidden } = useMemo(() => buildCostPerMillionRows(data, metric), [data, metric]);
  const shown = rows.slice(0, topN);

  const description = `${windowName(window)} by ${aggregateName(aggregateBy)} · ${optionName(
    COST_PER_MILLION_METRIC_OPTIONS,
    metric,
  ).toLowerCase()} · ${costBasis} basis`;

  let body: React.ReactNode;
  if (loading) body = <InferenceLoading height={240} />;
  else if (error) body = <InferenceEmptyState message={error} />;
  else if (shown.length === 0) body = <InferenceEmptyState message="No token-serving inference costs in this window" />;
  else
    body = (
      <div className="px-2" data-testid="inference-cost-per-million">
        <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
          {shown.map((r) => {
            const pct = Math.max(r.fraction * 100, 0.75); // keep the cheapest row visible as a sliver
            const color = gaugeColor(r.fraction);
            const value = toCurrency(r.value, currency, 3);
            return (
              <li
                key={r.key}
                className="grid items-center gap-3"
                style={{ gridTemplateColumns: "minmax(8rem, 14rem) 1fr 6.5rem" }}
                title={`${r.key}: ${value} per 1M tokens · ${toCurrency(r.totalCost, currency)} over ${formatTokens(r.totalTokens)} tokens`}
              >
                <span className="truncate text-right text-sm" style={{ color: "var(--cds-text-primary)" }}>
                  {r.key}
                </span>
                <div
                  className="h-7 rounded-sm overflow-hidden"
                  style={{ background: "var(--cds-layer-accent-01)" }}
                  role="img"
                  aria-label={`${r.key}: ${value} per 1M tokens`}
                >
                  {/* Gradient is sized to the full track so a short bar shows only the green end. */}
                  <div
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      backgroundImage: GRADIENT,
                      backgroundSize: `${10000 / pct}% 100%`,
                    }}
                  />
                </div>
                <span
                  className="text-right font-semibold tabular-nums"
                  style={{ color, fontSize: "1.5rem", lineHeight: 1 }}
                >
                  {value}
                </span>
              </li>
            );
          })}
        </ul>
        {(rows.length > shown.length || hidden > 0) && (
          <p className="m-0 mt-3 text-xs" style={{ color: "var(--cds-text-secondary)" }}>
            {rows.length > shown.length && `Showing cheapest ${shown.length} of ${rows.length}. `}
            {hidden > 0 && `${hidden} ${hidden === 1 ? "entry" : "entries"} with no tokens or no cost hidden.`}
          </p>
        )}
      </div>
    );

  return (
    <div className="w-full">
      <FilterableWidgetHeader
        title={title}
        description={description}
        expanded={showFilters}
        onToggle={() => setShowFilters((s) => !s)}
        filterContent={
          <InferenceFilterGrid>
            <InferenceWindowAggregateSelects
              idPrefix="inference-cpm"
              window={window}
              aggregateBy={aggregateBy}
              onWindowChange={setWindow}
              onAggregateByChange={setAggregateBy}
            />
            <Select
              id="inference-cpm-metric"
              labelText="Tokens"
              value={metric}
              size="sm"
              onChange={(e) => setMetric(e.target.value as CostPerMillionMetric)}
            >
              {COST_PER_MILLION_METRIC_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} text={o.name} />
              ))}
            </Select>
            <Select
              id="inference-cpm-basis"
              labelText="Cost basis"
              value={costBasis}
              size="sm"
              onChange={(e) => setCostBasis(e.target.value as InferenceCostBasis)}
            >
              {INFERENCE_COST_BASIS_OPTIONS.map((o) => (
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
