import { useEffect, useMemo, useState } from "react";
import { Button } from "@carbon/react";
import { DeleteOutline } from "@mui/icons-material";
import {
  REPORT_WINDOW_PRESETS,
  buildUtcRangeFromDateInputs,
  detectReportWindowPresetId,
  getYesterdayUtcRange,
  legacyReportWindowToUtcRange,
  parseReportWindowRange,
  toUtcDateInputValue,
  type ReportWindowPresetId,
} from "~/lib/report-window-range";
import {
  ASSETS_GROUPING_OPTIONS,
  ALLOCATION_GROUPING_OPTIONS,
  ALLOCATION_MEASURE_OPTIONS,
  CLOUD_COST_GROUPING_OPTIONS,
  CLOUD_COST_METRIC_OPTIONS,
  createDefaultReportQuery,
  EXTERNAL_COST_GROUPING_OPTIONS,
  EXTERNAL_COST_SORT_BY_OPTIONS,
  EXTERNAL_COST_SORT_DIRECTION_OPTIONS,
  EXTERNAL_COST_TYPE_OPTIONS,
  mergeReportQuery,
  REPORT_DATA_SOURCE_OPTIONS,
  REPORT_CHART_TYPE_OPTIONS,
  type AllocationReportQuery,
  type AllocationMeasure,
  type CloudCostReportQuery,
  type ExternalCostReportQuery,
  type InfraAssetsReportQuery,
  type ReportLayer,
  type Report,
  type ReportQuery,
  type ReportFilterRule,
} from "~/types/report";

interface ReportBuilderSidePanelProps {
  report: Report;
  onUpdate: (updates: Partial<Report>) => void;
  onRun: () => void;
  isRunning: boolean;
  autoRun: boolean;
  onAutoRunChange: (value: boolean) => void;
}

function isAllocationQuery(query: Report["query"]): query is AllocationReportQuery {
  return query.layer === "allocation";
}

function isCloudCostQuery(query: Report["query"]): query is CloudCostReportQuery {
  return query.layer === "cloudCost";
}

function isInfraAssetsQuery(query: Report["query"]): query is InfraAssetsReportQuery {
  return query.layer === "infraAssets";
}

function isExternalCostQuery(query: Report["query"]): query is ExternalCostReportQuery {
  return query.layer === "externalCost";
}

function toFilterOptionsByLayer(layer: ReportLayer) {
  switch (layer) {
    case "cloudCost":
      return CLOUD_COST_GROUPING_OPTIONS;
    case "infraAssets":
      return ASSETS_GROUPING_OPTIONS;
    case "externalCost":
      return EXTERNAL_COST_GROUPING_OPTIONS;
    case "allocation":
    default:
      return ALLOCATION_GROUPING_OPTIONS;
  }
}

export default function ReportBuilderSidePanel({
  report,
  onUpdate,
  onRun,
  isRunning,
  autoRun,
  onAutoRunChange,
}: ReportBuilderSidePanelProps) {
  const [preferCustomRange, setPreferCustomRange] = useState(false);
  const query = report.query;

  const updateQuery = (updates: Partial<ReportQuery>) => {
    onUpdate({
      query: mergeReportQuery(query, updates),
    });
  };

  const replaceQuery = (nextQuery: ReportQuery) => {
    onUpdate({ query: nextQuery });
  };

  useEffect(() => {
    setPreferCustomRange(false);
  }, [report.id]);

  useEffect(() => {
    const iso = legacyReportWindowToUtcRange(query.window);
    if (!iso) return;
    updateQuery({ window: iso });
  }, [query.window]);

  const presetSelectValue: ReportWindowPresetId = preferCustomRange
    ? "custom"
    : detectReportWindowPresetId(query.window);

  const customRangeFields = useMemo(() => {
    const parsed = parseReportWindowRange(query.window);
    if (parsed) {
      return {
        start: toUtcDateInputValue(parsed.start),
        end: toUtcDateInputValue(parsed.end),
      };
    }
    const fb = parseReportWindowRange(getYesterdayUtcRange());
    return fb
      ? {
          start: toUtcDateInputValue(fb.start),
          end: toUtcDateInputValue(fb.end),
        }
      : { start: "", end: "" };
  }, [query.window]);

  const utcTodayYmd = toUtcDateInputValue(new Date());

  const updateFilter = (index: number, updates: Partial<ReportFilterRule>) => {
    const nextFilters = [...query.filters];
    nextFilters[index] = { ...nextFilters[index], ...updates };
    updateQuery({ filters: nextFilters });
  };

  const addFilter = () => {
    const defaultProperty = toFilterOptionsByLayer(query.layer)[0]?.value ?? "namespace";
    updateQuery({
      filters: [...query.filters, { property: defaultProperty, value: "" }],
    });
  };

  const removeFilter = (index: number) => {
    updateQuery({
      filters: query.filters.filter((_, current) => current !== index),
    });
  };

  const allocationQuery = isAllocationQuery(query) ? query : null;
  const cloudCostQuery = isCloudCostQuery(query) ? query : null;
  const infraAssetsQuery = isInfraAssetsQuery(query) ? query : null;
  const externalCostQuery = isExternalCostQuery(query) ? query : null;

  const measures = allocationQuery?.measures?.length
    ? allocationQuery.measures
    : (["totalCost"] as AllocationMeasure[]);
  const groupings = allocationQuery?.groupings?.length
    ? allocationQuery.groupings
    : ["namespace"];

  const addMeasure = () => {
    const used = new Set(measures);
    const next =
      ALLOCATION_MEASURE_OPTIONS.find((o) => !used.has(o.value))?.value ?? "totalCost";
    updateQuery({ measures: [...measures, next] });
  };

  const removeMeasure = (index: number) => {
    if (measures.length <= 1) return;
    updateQuery({ measures: measures.filter((_, i) => i !== index) });
  };

  const setMeasureAt = (index: number, value: AllocationMeasure) => {
    const next = [...measures];
    next[index] = value;
    updateQuery({ measures: next });
  };

  const addGrouping = () => {
    const used = new Set(groupings);
    const next =
      ALLOCATION_GROUPING_OPTIONS.find((o) => !used.has(o.value))?.value ?? "namespace";
    updateQuery({ groupings: [...groupings, next] });
  };

  const removeGrouping = (index: number) => {
    if (groupings.length <= 1) return;
    updateQuery({ groupings: groupings.filter((_, i) => i !== index) });
  };

  const setGroupingAt = (index: number, value: string) => {
    const next = [...groupings];
    next[index] = value;
    updateQuery({ groupings: next });
  };

  return (
    <aside className="w-[360px] border-l border-[#e0e0e0] bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0 text-lg font-semibold text-[#262626]">Report Config</h2>
        <Button size="sm" onClick={onRun} disabled={isRunning}>
          {isRunning ? "Running..." : "Run Report"}
        </Button>
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm text-[#393939]">
        <input
          type="checkbox"
          checked={autoRun}
          onChange={(event) => onAutoRunChange(event.target.checked)}
        />
        Auto Run
      </label>

      <div className="mb-4">
        <h3 className="m-0 text-lg font-semibold text-[#262626]">Data Source</h3>
        <select
          value={query.layer}
          onChange={(event) =>
            replaceQuery(createDefaultReportQuery(event.target.value as ReportLayer))
          }
          className="mt-2 h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
        >
          {REPORT_DATA_SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          className="mb-1 block text-sm text-[#525252]"
          htmlFor="report-window-preset"
        >
          Date range
        </label>
        <select
          id="report-window-preset"
          value={presetSelectValue}
          onChange={(event) => {
            const v = event.target.value as ReportWindowPresetId;
            if (v === "custom") {
              setPreferCustomRange(true);
              return;
            }
            setPreferCustomRange(false);
            const preset = REPORT_WINDOW_PRESETS.find((p) => p.id === v);
            if (preset) updateQuery({ window: preset.build() });
          }}
          className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
        >
          {REPORT_WINDOW_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          <option value="custom">Custom range (UTC calendar days)</option>
        </select>
        {presetSelectValue === "custom" ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label
                className="mb-1 block text-xs text-[#525252]"
                htmlFor="report-window-start"
              >
                Start (UTC date)
              </label>
              <input
                id="report-window-start"
                type="date"
                value={customRangeFields.start}
                max={utcTodayYmd}
                onChange={(event) => {
                  const next = buildUtcRangeFromDateInputs(
                    event.target.value,
                    customRangeFields.end,
                  );
                  if (next) {
                    setPreferCustomRange(true);
                    updateQuery({ window: next });
                  }
                }}
                className="h-9 w-full rounded border border-[#d0d0d0] px-2 text-[13px] text-[#262626]"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs text-[#525252]"
                htmlFor="report-window-end"
              >
                End (UTC date)
              </label>
              <input
                id="report-window-end"
                type="date"
                value={customRangeFields.end}
                max={utcTodayYmd}
                onChange={(event) => {
                  const next = buildUtcRangeFromDateInputs(
                    customRangeFields.start,
                    event.target.value,
                  );
                  if (next) {
                    setPreferCustomRange(true);
                    updateQuery({ window: next });
                  }
                }}
                className="h-9 w-full rounded border border-[#d0d0d0] px-2 text-[13px] text-[#262626]"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-[#525252]" htmlFor="report-step">
          Granularity
        </label>
        {allocationQuery ? (
          <select
            id="report-step"
            value={allocationQuery.step}
            onChange={(event) => updateQuery({ step: event.target.value })}
            className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
          >
            <option value="1d">Day</option>
            <option value="1w">Week</option>
            <option value="1mo">Month</option>
          </select>
        ) : (
          <p className="m-0 rounded border border-[#e0e0e0] bg-[#f8f8f8] px-3 py-2 text-[13px] text-[#6f6f6f]">
            Granularity is automatic for this data source.
          </p>
        )}
      </div>

      {allocationQuery ? (
        <>
          <div className="mb-4 rounded border border-[#e0e0e0] bg-[#f8f8f8] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="m-0 text-sm font-semibold text-[#393939]">Measures</h4>
              <Button kind="ghost" size="sm" onClick={addMeasure}>
                + Add Measure
              </Button>
            </div>
            <div className="space-y-2">
              {measures.map((measure, index) => (
                <div key={`measure-${index}-${measure}`} className="flex items-center gap-2">
                  <select
                    id={index === 0 ? "report-measure-0" : undefined}
                    aria-label={`Measure ${index + 1}`}
                    value={measure}
                    onChange={(event) =>
                      setMeasureAt(index, event.target.value as AllocationMeasure)
                    }
                    className="h-10 min-w-0 flex-1 rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
                  >
                    {ALLOCATION_MEASURE_OPTIONS.map((measureOption) => (
                      <option key={measureOption.value} value={measureOption.value}>
                        {measureOption.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={measures.length <= 1}
                    onClick={() => removeMeasure(index)}
                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-[#8d8d8d] hover:bg-[#f4f4f4] hover:text-[#da1e28] disabled:opacity-30"
                    aria-label={`Remove measure ${index + 1}`}
                  >
                    <DeleteOutline fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 rounded border border-[#e0e0e0] bg-[#f8f8f8] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="m-0 text-sm font-semibold text-[#393939]">Groupings</h4>
              <Button kind="ghost" size="sm" onClick={addGrouping}>
                + Add Grouping
              </Button>
            </div>
            <div className="space-y-2">
              {groupings.map((grouping, index) => (
                <div key={`grouping-${index}-${grouping}`} className="flex items-center gap-2">
                  <select
                    id={index === 0 ? "report-grouping-0" : undefined}
                    aria-label={`Grouping ${index + 1}`}
                    value={grouping}
                    onChange={(event) => setGroupingAt(index, event.target.value)}
                    className="h-10 min-w-0 flex-1 rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
                  >
                    {ALLOCATION_GROUPING_OPTIONS.map((groupingOption) => (
                      <option key={groupingOption.value} value={groupingOption.value}>
                        {groupingOption.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={groupings.length <= 1}
                    onClick={() => removeGrouping(index)}
                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-[#8d8d8d] hover:bg-[#f4f4f4] hover:text-[#da1e28] disabled:opacity-30"
                    aria-label={`Remove grouping ${index + 1}`}
                  >
                    <DeleteOutline fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {cloudCostQuery ? (
        <div className="mb-4 rounded border border-[#e0e0e0] bg-[#f8f8f8] p-3">
          <h4 className="mb-2 mt-0 text-sm font-semibold text-[#393939]">Cloud Settings</h4>
          <label className="mb-1 block text-xs text-[#525252]" htmlFor="report-cloud-grouping">
            Breakdown
          </label>
          <select
            id="report-cloud-grouping"
            value={cloudCostQuery.aggregateBy}
            onChange={(event) => updateQuery({ aggregateBy: event.target.value })}
            className="mb-3 h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
          >
            {CLOUD_COST_GROUPING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="mb-1 block text-xs text-[#525252]" htmlFor="report-cloud-metric">
            Cost Metric
          </label>
          <select
            id="report-cloud-metric"
            value={cloudCostQuery.costMetric}
            onChange={(event) => updateQuery({ costMetric: event.target.value })}
            className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
          >
            {CLOUD_COST_METRIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {infraAssetsQuery ? (
        <div className="mb-4 rounded border border-[#e0e0e0] bg-[#f8f8f8] p-3">
          <h4 className="mb-2 mt-0 text-sm font-semibold text-[#393939]">Assets Settings</h4>
          <label className="mb-1 block text-xs text-[#525252]" htmlFor="report-assets-grouping">
            Group By
          </label>
          <select
            id="report-assets-grouping"
            value={infraAssetsQuery.aggregateBy}
            onChange={(event) => updateQuery({ aggregateBy: event.target.value })}
            className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
          >
            {ASSETS_GROUPING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {externalCostQuery ? (
        <div className="mb-4 rounded border border-[#e0e0e0] bg-[#f8f8f8] p-3">
          <h4 className="mb-2 mt-0 text-sm font-semibold text-[#393939]">External Cost Settings</h4>
          <label className="mb-1 block text-xs text-[#525252]" htmlFor="report-external-grouping">
            Group By
          </label>
          <select
            id="report-external-grouping"
            value={externalCostQuery.aggregateBy}
            onChange={(event) => updateQuery({ aggregateBy: event.target.value })}
            className="mb-3 h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
          >
            {EXTERNAL_COST_GROUPING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="mb-1 block text-xs text-[#525252]" htmlFor="report-external-cost-type">
            Cost Type
          </label>
          <select
            id="report-external-cost-type"
            value={externalCostQuery.costType}
            onChange={(event) => updateQuery({ costType: event.target.value })}
            className="mb-3 h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
          >
            {EXTERNAL_COST_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-[#525252]" htmlFor="report-external-sort-by">
                Sort By
              </label>
              <select
                id="report-external-sort-by"
                value={externalCostQuery.sortBy}
                onChange={(event) => updateQuery({ sortBy: event.target.value })}
                className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
              >
                {EXTERNAL_COST_SORT_BY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="mb-1 block text-xs text-[#525252]"
                htmlFor="report-external-sort-direction"
              >
                Sort Direction
              </label>
              <select
                id="report-external-sort-direction"
                value={externalCostQuery.sortDirection}
                onChange={(event) =>
                  updateQuery({ sortDirection: event.target.value as "asc" | "desc" })
                }
                className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
              >
                {EXTERNAL_COST_SORT_DIRECTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-4">
        <label className="mb-1 block text-sm text-[#525252]" htmlFor="report-chart-type">
          Chart Type
        </label>
        <select
          id="report-chart-type"
          value={query.chartType}
          onChange={(event) =>
            updateQuery({
              chartType: event.target.value as Report["query"]["chartType"],
            })
          }
          className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
        >
          {REPORT_CHART_TYPE_OPTIONS.map((chartOption) => (
            <option key={chartOption.value} value={chartOption.value}>
              {chartOption.label}
            </option>
          ))}
        </select>
      </div>


      {allocationQuery || infraAssetsQuery ? (
        <label className="mb-4 flex items-center gap-2 text-sm text-[#393939]">
          <input
            type="checkbox"
            checked={
              allocationQuery
                ? allocationQuery.includeIdle
                : (infraAssetsQuery?.includeIdle ?? false)
            }
            onChange={(event) => updateQuery({ includeIdle: event.target.checked })}
          />
          Include idle costs
        </label>
      ) : null}

      <div className="border-t border-[#e0e0e0] pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-base font-semibold text-[#262626]">Filters</h3>
          <Button kind="ghost" size="sm" onClick={addFilter}>
            + Add Filter Group
          </Button>
        </div>
        {query.filters.length > 0 ? (
          <div className="space-y-3">
            {query.filters.map((filter, index) => (
              <div
                key={`${filter.property}-${index}`}
                className="rounded border border-[#e0e0e0] bg-[#fafafa] p-2"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-[#6f6f6f]">
                    Rule {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFilter(index)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-[#8d8d8d] hover:bg-[#f4f4f4] hover:text-[#da1e28]"
                    aria-label={`Remove filter ${index + 1}`}
                  >
                    <DeleteOutline fontSize="small" />
                  </button>
                </div>
                <select
                  value={filter.property}
                  onChange={(event) =>
                    updateFilter(index, { property: event.target.value })
                  }
                  className="mb-2 h-9 w-full rounded border border-[#d0d0d0] bg-white px-2 text-[13px] text-[#262626]"
                >
                  {toFilterOptionsByLayer(query.layer).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  value={filter.value}
                  onChange={(event) => updateFilter(index, { value: event.target.value })}
                  placeholder="Value"
                  className="h-9 w-full rounded border border-[#d0d0d0] px-2 text-[13px] text-[#262626]"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 text-sm text-[#8d8d8d]">No filters applied.</p>
        )}
      </div>
    </aside>
  );
}
