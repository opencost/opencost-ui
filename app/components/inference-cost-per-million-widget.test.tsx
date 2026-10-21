import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InferenceCostPerMillionWidget from "./inference-cost-per-million-widget";
import InferenceCostService from "~/services/inference-cost";
import { gaugeColor } from "~/lib/inference-cost";
import { ic, set } from "~/test/inference-fixtures";

vi.mock("~/components/settings-context", () => ({ useSettings: () => ({ defaultCurrency: "USD" }) }));
vi.mock("~/services/inference-cost", () => ({
  default: { fetchTotal: vi.fn(), fetchTimeseries: vi.fn() },
}));

const fetchTotal = vi.mocked(InferenceCostService.fetchTotal);

// 7d allocation-basis values from the live API, plus two rateless rows.
const data = set({
  "gpt-oss-120b": ic({
    totalCost: 181.8,
    totalTokens: 79_579_203,
    costPerMillionTokens: 2.2845,
    inputCostPerMillionTokens: 0.9,
    outputCostPerMillionTokens: 9.4,
  }),
  "gemma-4-31B-it": ic({
    totalCost: 371.14,
    totalTokens: 1_280_718_113,
    costPerMillionTokens: 0.2898,
    inputCostPerMillionTokens: 0.1,
    outputCostPerMillionTokens: 2.1,
  }),
  "Qwen3-32B": ic({ totalCost: 350.79 }),
  "Qwen/Qwen3-32B": ic({ totalTokens: 1_871_596 }),
});

function rows() {
  return within(screen.getByTestId("inference-cost-per-million")).getAllByRole("listitem");
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

beforeEach(() => {
  fetchTotal.mockReset();
});

describe("InferenceCostPerMillionWidget", () => {
  it("loads the default query and lists models cheapest first", async () => {
    const d = deferred<typeof data>();
    fetchTotal.mockReturnValueOnce(d.promise);
    render(<InferenceCostPerMillionWidget />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(fetchTotal).toHaveBeenCalledWith(
      { window: "7d", aggregate: "model_name", costBasis: "allocation" },
      expect.any(AbortSignal),
    );
    await act(async () => d.resolve(data));

    expect(screen.getByText("Cost per 1M Tokens")).toBeInTheDocument();
    expect(
      screen.getByText("Last 7 days by model name · blended (input + output) · allocation basis"),
    ).toBeInTheDocument();
    const [cheap, dear] = rows();
    expect(cheap).toHaveTextContent("gemma-4-31B-it");
    expect(cheap).toHaveTextContent("$0.290");
    expect(dear).toHaveTextContent("gpt-oss-120b");
    expect(dear).toHaveTextContent("$2.285");
    expect(cheap).toHaveAttribute("title", "gemma-4-31B-it: $0.290 per 1M tokens · $371.14 over 1.3B tokens");
    expect(within(cheap).getByRole("img")).toHaveAccessibleName("gemma-4-31B-it: $0.290 per 1M tokens");
  });

  it("sizes each bar against the most expensive row and colours its value to match", async () => {
    fetchTotal.mockResolvedValueOnce(data);
    render(<InferenceCostPerMillionWidget />);
    await screen.findByTestId("inference-cost-per-million");
    const [cheap, dear] = rows();
    const frac = 0.2898 / 2.2845;

    const cheapFill = within(cheap).getByRole("img").firstElementChild as HTMLElement;
    expect(parseFloat(cheapFill.style.width)).toBeCloseTo(frac * 100, 6);
    // The gradient spans the whole track, so a short bar shows only its green end.
    expect(parseFloat(cheapFill.style.backgroundSize)).toBeCloseTo(10000 / (frac * 100), 6);
    expect(cheapFill.style.backgroundImage).toContain("linear-gradient");

    const dearFill = within(dear).getByRole("img").firstElementChild as HTMLElement;
    expect(dearFill.style.width).toBe("100%");
    expect(dearFill.style.backgroundSize).toBe("100% 100%");

    const colorOf = (li: HTMLElement) => (li.lastElementChild as HTMLElement).style.color;
    const toRgb = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    };
    expect(colorOf(cheap)).toBe(toRgb(gaugeColor(frac)));
    expect(colorOf(dear)).toBe(toRgb(gaugeColor(1)));
  });

  it("keeps a near-zero bar visible as a sliver", async () => {
    fetchTotal.mockResolvedValueOnce(
      set({
        tiny: ic({ totalCost: 1, totalTokens: 1, costPerMillionTokens: 0.0001 }),
        big: ic({ totalCost: 1, totalTokens: 1, costPerMillionTokens: 100 }),
      }),
    );
    render(<InferenceCostPerMillionWidget />);
    await screen.findByTestId("inference-cost-per-million");
    const fill = within(rows()[0]).getByRole("img").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("0.75%");
  });

  it("notes hidden rows and truncation to top N", async () => {
    fetchTotal.mockResolvedValueOnce(data);
    render(<InferenceCostPerMillionWidget topN={1} />);
    await screen.findByTestId("inference-cost-per-million");
    expect(rows()).toHaveLength(1);
    expect(screen.getByText(/Showing cheapest 1 of 2\./)).toBeInTheDocument();
    expect(screen.getByText(/2 entries with no tokens or no cost hidden\./)).toBeInTheDocument();
  });

  it("uses the singular for one hidden row and omits the note when nothing is hidden", async () => {
    fetchTotal.mockResolvedValueOnce(
      set({
        a: ic({ totalCost: 1, totalTokens: 1, costPerMillionTokens: 1 }),
        b: ic({ totalCost: 1 }),
      }),
    );
    const { unmount } = render(<InferenceCostPerMillionWidget />);
    expect(await screen.findByText("1 entry with no tokens or no cost hidden.")).toBeInTheDocument();
    unmount();

    fetchTotal.mockResolvedValueOnce(set({ a: ic({ totalCost: 1, totalTokens: 1, costPerMillionTokens: 1 }) }));
    render(<InferenceCostPerMillionWidget />);
    await screen.findByTestId("inference-cost-per-million");
    expect(screen.queryByText(/hidden/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Showing cheapest/)).not.toBeInTheDocument();
  });

  it("switches between blended, input and output rates without refetching", async () => {
    const user = userEvent.setup();
    fetchTotal.mockResolvedValue(data);
    render(<InferenceCostPerMillionWidget />);
    await screen.findByTestId("inference-cost-per-million");
    await user.click(screen.getByRole("button", { name: "Toggle filter options" }));

    await user.selectOptions(screen.getByLabelText("Tokens"), "outputCostPerMillionTokens");
    expect(rows().map((r) => r.lastElementChild?.textContent)).toEqual(["$2.100", "$9.400"]);
    expect(screen.getByText(/· output tokens ·/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Tokens"), "inputCostPerMillionTokens");
    expect(rows().map((r) => r.lastElementChild?.textContent)).toEqual(["$0.100", "$0.900"]);
    expect(fetchTotal).toHaveBeenCalledTimes(1);
  });

  it("refetches when window, aggregate or cost basis change", async () => {
    const user = userEvent.setup();
    fetchTotal.mockResolvedValue(data);
    render(<InferenceCostPerMillionWidget />);
    await screen.findByTestId("inference-cost-per-million");
    await user.click(screen.getByRole("button", { name: "Toggle filter options" }));
    await user.selectOptions(screen.getByLabelText("Window"), "yesterday");
    await user.selectOptions(screen.getByLabelText("Aggregate by"), "model_version");
    await user.selectOptions(screen.getByLabelText("Cost basis"), "usage");
    expect(fetchTotal).toHaveBeenLastCalledWith(
      { window: "yesterday", aggregate: "model_version", costBasis: "usage" },
      expect.any(AbortSignal),
    );
    expect(fetchTotal).toHaveBeenCalledTimes(4);
    const signals = fetchTotal.mock.calls.map((c) => c[1] as AbortSignal);
    expect(signals.map((s) => s.aborted)).toEqual([true, true, true, false]);
  });

  it("honours props for the initial query and currency", async () => {
    fetchTotal.mockResolvedValueOnce(data);
    render(
      <InferenceCostPerMillionWidget
        title="Build vs Buy"
        window="14d"
        aggregateBy="model_version"
        costBasis="usage"
        metric="outputCostPerMillionTokens"
        currency="EUR"
      />,
    );
    expect(fetchTotal).toHaveBeenCalledWith(
      { window: "14d", aggregate: "model_version", costBasis: "usage" },
      expect.any(AbortSignal),
    );
    await screen.findByTestId("inference-cost-per-million");
    expect(screen.getByText("Build vs Buy")).toBeInTheDocument();
    expect(rows()[0]).toHaveTextContent("€2.100");
  });

  it("shows an empty state when no row has a rate", async () => {
    fetchTotal.mockResolvedValueOnce(set({ idle: ic({ totalCost: 5 }) }));
    render(<InferenceCostPerMillionWidget />);
    expect(await screen.findByText("No token-serving inference costs in this window")).toBeInTheDocument();
  });

  it("shows API errors", async () => {
    fetchTotal.mockRejectedValueOnce({ isAxiosError: true, response: { status: 501 } });
    const { unmount } = render(<InferenceCostPerMillionWidget />);
    expect(
      await screen.findByText("Inference cost tracking is not enabled on this OpenCost instance."),
    ).toBeInTheDocument();
    unmount();
    fetchTotal.mockRejectedValueOnce({ isAxiosError: true, response: { status: 500 } });
    render(<InferenceCostPerMillionWidget />);
    expect(await screen.findByText("Failed to load inference costs.")).toBeInTheDocument();
  });

  it("ignores responses that land after unmount", async () => {
    const ok = deferred<typeof data>();
    const bad = deferred<typeof data>();
    fetchTotal.mockReturnValueOnce(ok.promise).mockReturnValueOnce(bad.promise);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<InferenceCostPerMillionWidget />).unmount();
    render(<InferenceCostPerMillionWidget />).unmount();
    await act(async () => {
      ok.resolve(data);
      bad.reject(new Error("late"));
    });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
