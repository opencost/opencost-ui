import { Button } from "@carbon/react";
import { DeleteOutline } from "@mui/icons-material";
import { currencyCodes } from "~/constants/currencyCodes";
import {
  ALLOCATION_GROUPING_OPTIONS,
  ALLOCATION_MEASURE_OPTIONS,
  REPORT_CHART_TYPE_OPTIONS,
  REPORT_WINDOW_OPTIONS,
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
  const updateQuery = (updates: Partial<Report["query"]>) => {
    onUpdate({
      query: {
        ...report.query,
        ...updates,
      },
    });
  };

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
        <label className="mb-1 block text-sm text-[#525252]" htmlFor="report-window">
          Window
        </label>
        <select
          id="report-window"
          value={report.query.window}
          onChange={(event) => updateQuery({ window: event.target.value })}
          className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
        >
          {REPORT_WINDOW_OPTIONS.map((windowOption) => (
            <option key={windowOption.value} value={windowOption.value}>
              {windowOption.label}
            </option>
          ))}
        </select>
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
          <Button kind="ghost" size="sm" disabled>
            + Add Measure
          </Button>
        </div>
        <label className="mb-1 block text-sm text-[#525252]" htmlFor="report-measure">
          Primary measure
        </label>
        <select
          id="report-measure"
          value={report.query.measure}
          onChange={(event) =>
            updateQuery({
              measure: event.target.value as Report["query"]["measure"],
            })
          }
          className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
        >
          {ALLOCATION_MEASURE_OPTIONS.map((measureOption) => (
            <option key={measureOption.value} value={measureOption.value}>
              {measureOption.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 rounded border border-[#e0e0e0] bg-[#f8f8f8] p-3">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="m-0 text-sm font-semibold text-[#393939]">Groupings</h4>
          <Button kind="ghost" size="sm" disabled>
            + Add Grouping
          </Button>
        </div>
        <label className="mb-1 block text-sm text-[#525252]" htmlFor="report-grouping">
          Primary grouping
        </label>
        <select
          id="report-grouping"
          value={report.query.groupings[0] ?? "namespace"}
          onChange={(event) => updateQuery({ groupings: [event.target.value] })}
          className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
        >
          {ALLOCATION_GROUPING_OPTIONS.map((groupingOption) => (
            <option key={groupingOption.value} value={groupingOption.value}>
              {groupingOption.label}
            </option>
          ))}
        </select>
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
