import { useEffect, useMemo, useState } from "react";
import { Select, SelectItem } from "@carbon/react";
import { GroupedBarChart, LineChart } from "@carbon/charts-react";
import { ScaleTypes, type BarChartOptions, type LineChartOptions } from "@carbon/charts";
import { useSettings } from "~/components/settings-context";
import { useAppTheme } from "~/components/theme-context";
import { SwitchableChart } from "./switchable-chart";
import { ChartTypeToggle, type ChartMode } from "./chart-type-toggle";
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
  type InferenceCostAccumulate,
  type InferenceCostBasis,
  type InferenceCostSetRange,
} from "~/services/inference-cost";
import {
  INFERENCE_ACCUMULATE_OPTIONS,
  INFERENCE_COST_BASIS_OPTIONS,
  INFERENCE_METRIC_OPTIONS,
  OTHER_KEY,
  buildInferenceChartData,
  buildStepLabels,
  buildTrendTooltipHTML,
  isAdditiveMetric,
  type ChartPoint,
  type InferenceMetric,
} from "~/lib/inference-cost";
import { toCurrency } from "~/lib/legacy-util";
import { primary, browns } from "~/constants/colors";

function buildColorScale(points: ChartPoint[]): Record<string, string> {
  const scale: Record<string, string> = {};
  let i = 0;
  for (const key of new Set(points.map((p) => p.key))) {
    scale[key] = key === OTHER_KEY ? browns[0] : primary[i++ % primary.length];
  }
  return scale;
}

export interface InferenceCostWidgetProps {
  title?: string;
  description?: string;
  window?: string;
  aggregateBy?: string;
  accumulate?: InferenceCostAccumulate;
  costBasis?: InferenceCostBasis;
  metric?: InferenceMetric;
  currency?: string;
  topN?: number;
}

/** Inference cost over time (bar/line), top N plus "other", like Cost Allocation. */
export default function InferenceCostWidget({
  title = "AI Inference Costs",
  description = "Inference cost by model name, version, or workload type",
  window: windowProp = "7d",
  aggregateBy: aggregateByProp = "model_name",
  accumulate: accumulateProp = "day",
  costBasis: costBasisProp = "allocation",
  metric: metricProp = "totalCost",
  currency: currencyProp,
  topN = 10,
}: InferenceCostWidgetProps) {
  const { defaultCurrency } = useSettings();
  const currency = currencyProp ?? defaultCurrency;
  const { theme } = useAppTheme();

  const [showFilters, setShowFilters] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("bar");
  const [window, setWindow] = useState(windowProp);
  const [aggregateBy, setAggregateBy] = useState(aggregateByProp);
  const [accumulate, setAccumulate] = useState<InferenceCostAccumulate>(accumulateProp);
  const [costBasis, setCostBasis] = useState<InferenceCostBasis>(costBasisProp);
  const [metric, setMetric] = useState<InferenceMetric>(metricProp);

  const [series, setSeries] = useState<InferenceCostSetRange | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const cancelled = () => controller.signal.aborted;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const d = await InferenceCostService.fetchTimeseries(
          { window, aggregate: aggregateBy, costBasis },
          accumulate,
          controller.signal,
        );
        if (!cancelled()) setSeries(d);
      } catch (e: unknown) {
        if (!cancelled()) setError(inferenceErrorMessage(e));
      } finally {
        if (!cancelled()) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [window, aggregateBy, accumulate, costBasis]);

  const chartData = useMemo(
    () => buildInferenceChartData(series, metric, topN, accumulate === "hour"),
    [series, metric, topN, accumulate],
  );
  const stepLabels = useMemo(() => buildStepLabels(series, accumulate === "hour"), [series, accumulate]);

  const chartTitle = `${windowName(window)} by ${aggregateName(aggregateBy)} (${optionName(
    INFERENCE_ACCUMULATE_OPTIONS,
    accumulate,
  ).toLowerCase()}, ${costBasis} basis)`;

  const additive = isAdditiveMetric(metric);
  const chartOptions = useMemo(() => {
    const colorScale = buildColorScale(chartData);
    const fmt = (v: number) => (metric === "totalTokens" ? formatTokens(v) : toCurrency(v, currency));
    return {
      theme,
      title: chartTitle,
      axes: {
        left: {
          mapsTo: "value",
          scaleType: ScaleTypes.LINEAR,
          stacked: additive,
          ticks: { formatter: (v: number | Date) => fmt(typeof v === "number" ? v : v.getTime()) },
        },
        // Explicit domain: steps whose values are all zero have no points,
        // and would otherwise drop off a LABELS axis built from the data.
        bottom: { mapsTo: "group", scaleType: ScaleTypes.LABELS, domain: stepLabels },
      },
      data: { groupMapsTo: "key" },
      height: "400px",
      color: { scale: colorScale },
      bars: { maxWidth: 48, spacingFactor: 0.65 },
      // Show only the hovered bar or point: with the ruler on, Carbon
      // gathers every series at that step into one tooltip.
      ruler: { enabled: false },
      tooltip: {
        // Carbon's default tooltip runs valueFormatter on every row, which
        // blanks the date and model name, and labels them "x-value"/"Group".
        customHTML: (data: unknown, defaultHTML: string) =>
          buildTrendTooltipHTML(data, fmt, colorScale, additive) ?? defaultHTML,
      },
    };
  }, [chartData, stepLabels, metric, currency, theme, chartTitle, additive]);

  let body: React.ReactNode;
  if (loading) body = <InferenceLoading />;
  else if (error) body = <InferenceEmptyState message={error} />;
  else if (chartData.length === 0) body = <InferenceEmptyState message="No inference costs in this window" />;
  else if (additive)
    body = (
      <div className="w-full h-[400px] px-2">
        <SwitchableChart data={chartData} options={chartOptions} mode={chartMode} stacked />
      </div>
    );
  else {
    // Per-model rates are not additive: grouped bars / plain lines, no "other".
    const lineOptions = { ...chartOptions, bars: undefined, curve: "curveMonotoneX" };
    body = (
      <div className="w-full h-[400px] px-2">
        {chartMode === "line" ? (
          <LineChart data={chartData} options={lineOptions as unknown as LineChartOptions} />
        ) : (
          <GroupedBarChart data={chartData} options={chartOptions as unknown as BarChartOptions} />
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <FilterableWidgetHeader
        title={title}
        description={description}
        expanded={showFilters}
        onToggle={() => setShowFilters((s) => !s)}
        headerActions={<ChartTypeToggle mode={chartMode} onChange={setChartMode} />}
        filterContent={
          <InferenceFilterGrid>
            <InferenceWindowAggregateSelects
              idPrefix="inference-trend"
              window={window}
              aggregateBy={aggregateBy}
              onWindowChange={setWindow}
              onAggregateByChange={setAggregateBy}
            />
            <Select
              id="inference-trend-accumulate"
              labelText="Granularity"
              value={accumulate}
              size="sm"
              onChange={(e) => setAccumulate(e.target.value as InferenceCostAccumulate)}
            >
              {INFERENCE_ACCUMULATE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} text={o.name} />
              ))}
            </Select>
            <Select
              id="inference-trend-basis"
              labelText="Cost basis"
              value={costBasis}
              size="sm"
              onChange={(e) => setCostBasis(e.target.value as InferenceCostBasis)}
            >
              {INFERENCE_COST_BASIS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} text={o.name} />
              ))}
            </Select>
            <Select
              id="inference-trend-metric"
              labelText="Metric"
              value={metric}
              size="sm"
              onChange={(e) => setMetric(e.target.value as InferenceMetric)}
            >
              {INFERENCE_METRIC_OPTIONS.map((o) => (
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
