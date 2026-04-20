import { useEffect, useMemo, useState } from "react";
import { Button } from "@carbon/react";
import { DeleteOutline } from "@mui/icons-material";
import { currencyCodes } from "~/constants/currencyCodes";
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
  ALLOCATION_GROUPING_OPTIONS,
  ALLOCATION_MEASURE_OPTIONS,
  REPORT_CHART_TYPE_OPTIONS,
  type AllocationMeasure,
  type Report,
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

function toFilterOptions() {
  return ALLOCATION_GROUPING_OPTIONS;
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

  const updateQuery = (updates: Partial<Report["query"]>) => {
    onUpdate({
      query: {
        ...report.query,
        ...updates,
      },
    });
  };

  useEffect(() => {
    setPreferCustomRange(false);
  }, [report.id]);

  useEffect(() => {
    const iso = legacyReportWindowToUtcRange(report.query.window);
    if (!iso) return;
    onUpdate({
      query: {
        ...report.query,
        window: iso,
      },
    });
  }, [report.query.window]);

  const presetSelectValue: ReportWindowPresetId = preferCustomRange
    ? "custom"
    : detectReportWindowPresetId(report.query.window);

  const customRangeFields = useMemo(() => {
    const parsed = parseReportWindowRange(report.query.window);
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
  }, [report.query.window]);

  const utcTodayYmd = toUtcDateInputValue(new Date());

  const updateFilter = (index: number, updates: Partial<ReportFilterRule>) => {
    const nextFilters = [...report.query.filters];
    nextFilters[index] = { ...nextFilters[index], ...updates };
    updateQuery({ filters: nextFilters });
  };

  const addFilter = () => {
    const defaultProperty = toFilterOptions()[0]?.value ?? "namespace";
    updateQuery({
      filters: [...report.query.filters, { property: defaultProperty, value: "" }],
    });
  };

  const removeFilter = (index: number) => {
    updateQuery({
      filters: report.query.filters.filter((_, current) => current !== index),
    });
  };

  const measures = report.query.measures?.length
    ? report.query.measures
    : (["totalCost"] as AllocationMeasure[]);
  const groupings = report.query.groupings?.length
    ? report.query.groupings
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
          value="allocation"
          disabled
          className="mt-2 h-10 w-full rounded border border-[#d0d0d0] bg-[#f4f4f4] px-2.5 text-[13px] text-[#6f6f6f]"
        >
          <option value="allocation">OpenCost Allocation</option>
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
        <select
          id="report-step"
          value={report.query.step}
          onChange={(event) => updateQuery({ step: event.target.value })}
          className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
        >
          <option value="1d">Day</option>
          <option value="1w">Week</option>
          <option value="1mo">Month</option>
        </select>
      </div>

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

      <div className="mb-4">
        <label className="mb-1 block text-sm text-[#525252]" htmlFor="report-chart-type">
          Chart Type
        </label>
        <select
          id="report-chart-type"
          value={report.query.chartType}
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

      <div className="mb-4">
        <label className="mb-1 block text-sm text-[#525252]" htmlFor="report-currency">
          Currency
        </label>
        <select
          id="report-currency"
          value={report.query.currency}
          onChange={(event) => updateQuery({ currency: event.target.value })}
          className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
        >
          {currencyCodes.map((currencyCode) => (
            <option key={currencyCode} value={currencyCode}>
              {currencyCode}
            </option>
          ))}
        </select>
      </div>

      <label className="mb-4 flex items-center gap-2 text-sm text-[#393939]">
        <input
          type="checkbox"
          checked={report.query.includeIdle}
          onChange={(event) => updateQuery({ includeIdle: event.target.checked })}
        />
        Include idle costs
      </label>

      <div className="border-t border-[#e0e0e0] pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-base font-semibold text-[#262626]">Filters</h3>
          <Button kind="ghost" size="sm" onClick={addFilter}>
            + Add Filter Group
          </Button>
        </div>
        {report.query.filters.length > 0 ? (
          <div className="space-y-3">
            {report.query.filters.map((filter, index) => (
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
                  {toFilterOptions().map((option) => (
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
