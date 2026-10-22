import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InferenceCostWidget from "./inference-cost-widget";
import InferenceCostService from "~/services/inference-cost";
import { lastProps } from "~/test/carbon-charts-stub";
import { ic, set } from "~/test/inference-fixtures";

vi.mock("@carbon/charts-react", () => import("~/test/carbon-charts-stub"));
vi.mock("@carbon/charts", () => ({ ScaleTypes: { LINEAR: "linear", LABELS: "labels" } }));
vi.mock("~/components/settings-context", () => ({ useSettings: () => ({ defaultCurrency: "USD" }) }));
vi.mock("~/components/theme-context", () => ({ useAppTheme: () => ({ theme: "g100" }) }));
vi.mock("~/services/inference-cost", () => ({
  default: { fetchTotal: vi.fn(), fetchTimeseries: vi.fn() },
}));

const fetchTimeseries = vi.mocked(InferenceCostService.fetchTimeseries);

const series = {
  window: { start: "2026-10-19T00:00:00Z", end: "2026-10-21T00:00:00Z" },
  inferenceCostSets: [
    set(
      {
        gemma: ic({ totalCost: 82.14, totalTokens: 1_500_000, costPerMillionTokens: 0.29 }),
        gpt: ic({ totalCost: 44.34, totalTokens: 900_000, costPerMillionTokens: 2.28 }),
        idle: ic({ totalCost: 13.52 }),
      },
      "2026-10-19T00:00:00Z",
    ),
  ],
};

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function openFilters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Toggle filter options" }));
}

beforeEach(() => {
  fetchTimeseries.mockReset();
  for (const k of Object.keys(lastProps)) delete lastProps[k];
});

describe("InferenceCostWidget", () => {
  it("shows loading, then a stacked bar chart from the default query", async () => {
    const d = deferred<typeof series>();
    fetchTimeseries.mockReturnValueOnce(d.promise);
    render(<InferenceCostWidget />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.getByText("AI Inference Costs")).toBeInTheDocument();
    expect(fetchTimeseries).toHaveBeenCalledWith(
      { window: "7d", aggregate: "model_name", costBasis: "allocation" },
      "day",
      expect.any(AbortSignal),
    );
    await act(async () => d.resolve(series));
    expect(screen.getByTestId("StackedBarChart")).toHaveAttribute("data-points", "3");
    const { options } = lastProps.StackedBarChart;
    expect(options.title).toBe("Last 7 days by model name (daily, allocation basis)");
    expect(options.axes.bottom.domain).toEqual(["10/19"]);
    expect(options.theme).toBe("g100");
    expect(options.axes.left.stacked).toBe(true);
    expect(options.ruler).toEqual({ enabled: false });
    expect(options.tooltip.alwaysShowRulerTooltip).toBeUndefined();
    const tip = options.tooltip.customHTML([{ group: "10/19", key: "llama-3", value: 1 }], "DEFAULT");
    expect(tip).toContain("10/19");
    expect(tip).toContain("llama-3: $1.00");
    expect(tip).not.toContain("Total");
    expect(options.tooltip.customHTML([], "DEFAULT")).toBe("DEFAULT");
    expect(options.axes.left.ticks.formatter(12.5)).toBe("$12.50");
    expect(options.axes.left.ticks.formatter(new Date(3))).toBe("$3.00");
    // Each key gets its own colour.
    expect(new Set(Object.values(options.color.scale)).size).toBe(3);
  });

  it("keeps a slot on the time axis for a step with no cost", async () => {
    fetchTimeseries.mockResolvedValueOnce({
      ...series,
      inferenceCostSets: [...series.inferenceCostSets, set({}, "2026-10-20T00:00:00Z")],
    });
    render(<InferenceCostWidget />);
    await screen.findByTestId("StackedBarChart");
    const groups = (lastProps.StackedBarChart.data as { group: string }[]).map((p) => p.group);
    expect(new Set(groups)).toEqual(new Set(["10/19"]));
    expect(lastProps.StackedBarChart.options.axes.bottom.domain).toEqual(["10/19", "10/20"]);
  });

  it("uses props as the initial query", async () => {
    fetchTimeseries.mockResolvedValueOnce(series);
    render(
      <InferenceCostWidget
        title="Custom"
        description="desc"
        window="24h"
        aggregateBy="model_version"
        accumulate="hour"
        costBasis="usage"
        currency="EUR"
      />,
    );
    expect(fetchTimeseries).toHaveBeenCalledWith(
      { window: "24h", aggregate: "model_version", costBasis: "usage" },
      "hour",
      expect.any(AbortSignal),
    );
    await screen.findByTestId("StackedBarChart");
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByText("desc")).toBeInTheDocument();
    expect(lastProps.StackedBarChart.options.title).toBe("Last 24h by model version (hourly, usage basis)");
    expect(lastProps.StackedBarChart.options.tooltip.customHTML([{ group: "x", key: "k", value: 1 }], "")).toContain(
      "k: €1.00",
    );
  });

  it("switches to a stacked area chart in line mode", async () => {
    const user = userEvent.setup();
    fetchTimeseries.mockResolvedValueOnce(series);
    render(<InferenceCostWidget />);
    await screen.findByTestId("StackedBarChart");
    await user.click(screen.getByRole("button", { name: "Line chart" }));
    expect(screen.getByTestId("StackedAreaChart")).toBeInTheDocument();
    expect(fetchTimeseries).toHaveBeenCalledTimes(1);
  });

  it("refetches when window, aggregate, granularity or cost basis change", async () => {
    const user = userEvent.setup();
    fetchTimeseries.mockResolvedValue(series);
    render(<InferenceCostWidget />);
    await screen.findByTestId("StackedBarChart");
    await openFilters(user);
    await user.selectOptions(screen.getByLabelText("Window"), "14d");
    await user.selectOptions(screen.getByLabelText("Aggregate by"), "model_version");
    await user.selectOptions(screen.getByLabelText("Granularity"), "week");
    await user.selectOptions(screen.getByLabelText("Cost basis"), "usage");
    await waitFor(() =>
      expect(fetchTimeseries).toHaveBeenLastCalledWith(
        { window: "14d", aggregate: "model_version", costBasis: "usage" },
        "week",
        expect.any(AbortSignal),
      ),
    );
    expect(fetchTimeseries).toHaveBeenCalledTimes(5);
    // Each filter change aborts the superseded request.
    const signals = fetchTimeseries.mock.calls.map((c) => c[2] as AbortSignal);
    expect(signals.slice(0, 4).every((s) => s.aborted)).toBe(true);
    expect(signals[4].aborted).toBe(false);
  });

  it("formats tokens compactly without refetching", async () => {
    const user = userEvent.setup();
    fetchTimeseries.mockResolvedValue(series);
    render(<InferenceCostWidget />);
    await screen.findByTestId("StackedBarChart");
    await openFilters(user);
    await user.selectOptions(screen.getByLabelText("Metric"), "totalTokens");
    const { options, data } = lastProps.StackedBarChart;
    expect(options.axes.left.ticks.formatter(1_500_000)).toBe("1.5M");
    expect(options.tooltip.customHTML([{ group: "x", key: "k", value: 2500 }], "")).toContain("k: 2.5K");
    expect(data).toHaveLength(2); // the zero-token key is dropped
    expect(fetchTimeseries).toHaveBeenCalledTimes(1);
  });

  it("draws rates unstacked: grouped bars, or plain lines", async () => {
    const user = userEvent.setup();
    fetchTimeseries.mockResolvedValue(series);
    render(<InferenceCostWidget />);
    await screen.findByTestId("StackedBarChart");
    await openFilters(user);
    await user.selectOptions(screen.getByLabelText("Metric"), "costPerMillionTokens");
    const grouped = lastProps.GroupedBarChart;
    expect(screen.getByTestId("GroupedBarChart")).toHaveAttribute("data-points", "2");
    expect(grouped.options.axes.left.stacked).toBe(false);
    expect(grouped.options.tooltip.customHTML([{ group: "x", key: "k", value: 1 }], "")).not.toContain("Total");
    await user.click(screen.getByRole("button", { name: "Line chart" }));
    const line = lastProps.LineChart;
    expect(screen.getByTestId("LineChart")).toBeInTheDocument();
    expect(line.options.curve).toBe("curveMonotoneX");
    expect(line.options.bars).toBeUndefined();
  });

  it("assigns the other bucket its own colour", async () => {
    fetchTimeseries.mockResolvedValueOnce(series);
    render(<InferenceCostWidget topN={1} />);
    await screen.findByTestId("StackedBarChart");
    const { scale } = lastProps.StackedBarChart.options.color;
    expect(Object.keys(scale)).toEqual(["gemma", "other"]);
    expect(scale.other).not.toBe(scale.gemma);
  });

  it("shows an empty state when nothing has cost", async () => {
    fetchTimeseries.mockResolvedValueOnce({ ...series, inferenceCostSets: [] });
    render(<InferenceCostWidget />);
    expect(await screen.findByText("No inference costs in this window")).toBeInTheDocument();
  });

  it("explains a 501 as inference costs being disabled", async () => {
    fetchTimeseries.mockRejectedValueOnce({ isAxiosError: true, response: { status: 501 } });
    render(<InferenceCostWidget />);
    expect(
      await screen.findByText("Inference cost tracking is not enabled on this OpenCost instance."),
    ).toBeInTheDocument();
  });

  it("shows a generic message for other failures", async () => {
    fetchTimeseries.mockRejectedValueOnce(new Error("network"));
    render(<InferenceCostWidget />);
    expect(await screen.findByText("Failed to load inference costs.")).toBeInTheDocument();
  });

  it("ignores a response that lands after unmount", async () => {
    const ok = deferred<typeof series>();
    const bad = deferred<typeof series>();
    fetchTimeseries.mockReturnValueOnce(ok.promise).mockReturnValueOnce(bad.promise);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const first = render(<InferenceCostWidget />);
    first.unmount();
    const second = render(<InferenceCostWidget />);
    second.unmount();
    await act(async () => {
      ok.resolve(series);
      bad.reject(new Error("late"));
    });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
