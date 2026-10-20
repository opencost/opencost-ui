import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InferenceIdleWidget from "./inference-idle-widget";
import InferenceCostService, { type InferenceCostSet } from "~/services/inference-cost";
import { ic, set } from "~/test/inference-fixtures";

vi.mock("~/components/settings-context", () => ({ useSettings: () => ({ defaultCurrency: "USD" }) }));
vi.mock("~/services/inference-cost", () => ({
  default: { fetchTotal: vi.fn(), fetchTimeseries: vi.fn() },
}));

const fetchTotal = vi.mocked(InferenceCostService.fetchTotal);

// 7d values captured from the live /inferenceCost/total API.
const allocation = set({
  "Qwen3-32B": ic({ totalCost: 350.79 }),
  "gpt-oss-120b": ic({ totalCost: 181.8, totalTokens: 79_579_203 }),
  "gemma-4-31B-it": ic({ totalCost: 371.14, totalTokens: 1_280_718_113 }),
  "Qwen/Qwen3-32B": ic({ totalTokens: 1_871_596 }),
});
const usage = set({
  "Qwen3-32B": ic(),
  "gpt-oss-120b": ic({ totalCost: 125.63, totalTokens: 79_579_203 }),
  "gemma-4-31B-it": ic({ totalCost: 326.72, totalTokens: 1_280_718_113 }),
});

function byBasis(alloc: InferenceCostSet = allocation, use: InferenceCostSet = usage) {
  fetchTotal.mockImplementation(async (q) => (q.costBasis === "allocation" ? alloc : use));
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function rows() {
  return within(screen.getByTestId("inference-idle-ranking")).getAllByRole("listitem");
}

beforeEach(() => {
  fetchTotal.mockReset();
});

describe("InferenceIdleWidget", () => {
  it("requests allocation then usage, one after the other", async () => {
    const alloc = deferred<InferenceCostSet>();
    const use = deferred<InferenceCostSet>();
    fetchTotal.mockReturnValueOnce(alloc.promise).mockReturnValueOnce(use.promise);
    render(<InferenceIdleWidget />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(fetchTotal).toHaveBeenCalledTimes(1);
    expect(fetchTotal).toHaveBeenCalledWith({ window: "7d", aggregate: "model_name", costBasis: "allocation" });

    await act(async () => alloc.resolve(allocation));
    expect(fetchTotal).toHaveBeenCalledTimes(2);
    expect(fetchTotal).toHaveBeenLastCalledWith({ window: "7d", aggregate: "model_name", costBasis: "usage" });
    expect(screen.getByText("Loading…")).toBeInTheDocument();

    await act(async () => use.resolve(usage));
    expect(rows()).toHaveLength(3);
  });

  it("ranks by idle + shared dollars with a usage/idle split bar", async () => {
    byBasis();
    render(<InferenceIdleWidget />);
    await screen.findByTestId("inference-idle-ranking");
    expect(screen.getByText("AI Inference Idle Cost")).toBeInTheDocument();
    expect(screen.getByText("Last 7 days by model name: highest idle + shared cost")).toBeInTheDocument();

    const [first, second, third] = rows();
    expect(first).toHaveTextContent("Qwen3-32B");
    expect(first).toHaveTextContent("100% idle + shared · $350.79 of $350.79");
    expect(second).toHaveTextContent("gpt-oss-120b");
    expect(second).toHaveTextContent("31% idle + shared · $56.17 of $181.80");
    expect(third).toHaveTextContent("gemma-4-31B-it");
    expect(third).toHaveTextContent("12% idle + shared · $44.42 of $371.14");

    const bar = within(second).getByRole("img");
    expect(bar).toHaveAccessibleName("gpt-oss-120b: 31% idle and shared, $56.17 of $181.80");
    const [used, idle] = Array.from(bar.children) as HTMLElement[];
    expect(parseFloat(used.style.width)).toBeCloseTo((125.63 / 181.8) * 100, 6);
    expect(parseFloat(idle.style.width)).toBeCloseTo((56.17 / 181.8) * 100, 6);
  });

  it("badges zero-token rows only", async () => {
    byBasis();
    render(<InferenceIdleWidget />);
    await screen.findByTestId("inference-idle-ranking");
    const [first, second] = rows();
    expect(within(first).getByText("No tokens")).toBeInTheDocument();
    expect(within(second).queryByText("No tokens")).not.toBeInTheDocument();
  });

  it("explains the label and counts hidden rows", async () => {
    byBasis();
    render(<InferenceIdleWidget />);
    await screen.findByTestId("inference-idle-ranking");
    expect(screen.getByText(/includes the shared-infrastructure share/)).toHaveTextContent(
      "1 entry with no allocated cost hidden.",
    );
  });

  it("pluralises hidden rows, notes truncation, and omits both when not needed", async () => {
    byBasis(set({ ...allocation.inferenceCosts, extra: ic({ totalTokens: 1 }) }));
    const { unmount } = render(<InferenceIdleWidget topN={2} />);
    await screen.findByTestId("inference-idle-ranking");
    expect(rows()).toHaveLength(2);
    const note = screen.getByText(/includes the shared-infrastructure share/);
    expect(note).toHaveTextContent("Showing 2 of 3.");
    expect(note).toHaveTextContent("2 entries with no allocated cost hidden.");
    unmount();

    byBasis(set({ a: ic({ totalCost: 1 }) }), set({}));
    render(<InferenceIdleWidget />);
    await screen.findByTestId("inference-idle-ranking");
    const plain = screen.getByText(/includes the shared-infrastructure share/);
    expect(plain).not.toHaveTextContent("Showing");
    expect(plain).not.toHaveTextContent("hidden");
  });

  it("re-sorts by idle share without refetching", async () => {
    const user = userEvent.setup();
    byBasis(
      set({ big: ic({ totalCost: 1000, totalTokens: 1 }), small: ic({ totalCost: 10, totalTokens: 1 }) }),
      set({ big: ic({ totalCost: 800 }), small: ic({ totalCost: 2 }) }),
    );
    render(<InferenceIdleWidget />);
    await screen.findByTestId("inference-idle-ranking");
    expect(rows().map((r) => r.textContent)).toEqual([
      expect.stringContaining("big"),
      expect.stringContaining("small"),
    ]);
    await user.click(screen.getByRole("button", { name: "Toggle filter options" }));
    await user.selectOptions(screen.getByLabelText("Sort by"), "idleFraction");
    expect(rows()[0]).toHaveTextContent("small");
    expect(rows()[0]).toHaveTextContent("80% idle + shared");
    expect(fetchTotal).toHaveBeenCalledTimes(2);
  });

  it("flips to lowest idle first, for either sort key, without refetching", async () => {
    const user = userEvent.setup();
    byBasis();
    render(<InferenceIdleWidget />);
    await screen.findByTestId("inference-idle-ranking");
    const order = () => rows().map((r) => r.querySelector("span.truncate")?.textContent);
    expect(order()).toEqual(["Qwen3-32B", "gpt-oss-120b", "gemma-4-31B-it"]);

    await user.click(screen.getByRole("button", { name: "Toggle filter options" }));
    expect(screen.getByLabelText("Order")).toHaveValue("desc");
    await user.selectOptions(screen.getByLabelText("Order"), "asc");
    // idle $: gemma 44.42 < gpt 56.17 < Qwen3-32B 350.79
    expect(order()).toEqual(["gemma-4-31B-it", "gpt-oss-120b", "Qwen3-32B"]);
    expect(screen.getByText("Last 7 days by model name: lowest idle + shared cost")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Sort by"), "idleFraction");
    // idle %: gemma 12% < gpt 31% < Qwen3-32B 100%
    expect(order()).toEqual(["gemma-4-31B-it", "gpt-oss-120b", "Qwen3-32B"]);

    await user.selectOptions(screen.getByLabelText("Order"), "desc");
    expect(order()).toEqual(["Qwen3-32B", "gpt-oss-120b", "gemma-4-31B-it"]);
    expect(screen.getByText("Last 7 days by model name: highest idle + shared cost")).toBeInTheDocument();
    expect(fetchTotal).toHaveBeenCalledTimes(2);
  });

  it("starts in the order given by the direction prop, and top N takes from that end", async () => {
    byBasis();
    render(<InferenceIdleWidget direction="asc" topN={1} />);
    await screen.findByTestId("inference-idle-ranking");
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toHaveTextContent("gemma-4-31B-it");
    expect(screen.getByText(/lowest idle \+ shared cost/)).toBeInTheDocument();
    expect(screen.getByText(/Showing 1 of 3\./)).toBeInTheDocument();
  });

  it("refetches both bases when window or aggregate change", async () => {
    const user = userEvent.setup();
    byBasis();
    render(<InferenceIdleWidget />);
    await screen.findByTestId("inference-idle-ranking");
    await user.click(screen.getByRole("button", { name: "Toggle filter options" }));
    await user.selectOptions(screen.getByLabelText("Window"), "48h");
    await screen.findByTestId("inference-idle-ranking");
    await user.selectOptions(screen.getByLabelText("Aggregate by"), "model_version");
    await waitFor(() => expect(fetchTotal).toHaveBeenCalledTimes(6));
    expect(fetchTotal.mock.calls.slice(4).map(([q]) => q)).toEqual([
      { window: "48h", aggregate: "model_version", costBasis: "allocation" },
      { window: "48h", aggregate: "model_version", costBasis: "usage" },
    ]);
  });

  it("honours props for the initial query and currency", async () => {
    byBasis();
    render(<InferenceIdleWidget title="Idle" window="today" aggregateBy="model_version" currency="EUR" />);
    await screen.findByTestId("inference-idle-ranking");
    expect(fetchTotal).toHaveBeenCalledWith({ window: "today", aggregate: "model_version", costBasis: "allocation" });
    expect(screen.getByText("Idle")).toBeInTheDocument();
    expect(rows()[0]).toHaveTextContent("€350.79 of €350.79");
  });

  it("shows an empty state when nothing has allocated cost", async () => {
    byBasis(set({ a: ic({ totalTokens: 5 }) }), set({}));
    render(<InferenceIdleWidget />);
    expect(await screen.findByText("No inference costs in this window")).toBeInTheDocument();
  });

  it("shows API errors, including a failure on the second request", async () => {
    fetchTotal.mockRejectedValueOnce({ isAxiosError: true, response: { status: 501 } });
    const { unmount } = render(<InferenceIdleWidget />);
    expect(
      await screen.findByText("Inference cost tracking is not enabled on this OpenCost instance."),
    ).toBeInTheDocument();
    unmount();

    fetchTotal.mockResolvedValueOnce(allocation).mockRejectedValueOnce(new Error("dropped"));
    render(<InferenceIdleWidget />);
    expect(await screen.findByText("Failed to load inference costs.")).toBeInTheDocument();
  });

  it("ignores responses that land after unmount", async () => {
    const ok = deferred<InferenceCostSet>();
    const bad = deferred<InferenceCostSet>();
    fetchTotal.mockReturnValueOnce(ok.promise).mockReturnValueOnce(bad.promise);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<InferenceIdleWidget />).unmount();
    render(<InferenceIdleWidget />).unmount();
    fetchTotal.mockResolvedValue(usage);
    await act(async () => {
      ok.resolve(allocation);
      bad.reject(new Error("late"));
    });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
