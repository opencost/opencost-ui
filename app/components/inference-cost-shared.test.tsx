import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  InferenceEmptyState,
  InferenceLoading,
  InferenceWindowAggregateSelects,
  aggregateName,
  formatTokens,
  inferenceErrorMessage,
  optionName,
  windowName,
} from "./inference-cost-shared";

// Pass through, except a sentinel custom window that toVerboseTimeRange cannot describe.
const UNDESCRIBABLE = "2026-10-01T00:00:00Z,2026-10-07T00:00:00Z#x";
vi.mock("~/lib/legacy-util", async (importOriginal) => {
  const actual = await importOriginal<typeof import("~/lib/legacy-util")>();
  return {
    ...actual,
    toVerboseTimeRange: (w: string) => (w === UNDESCRIBABLE ? null : actual.toVerboseTimeRange(w)),
  };
});

describe("inference-cost-shared", () => {
  it("optionName falls back to the raw value", () => {
    const opts = [{ name: "Daily", value: "day" }];
    expect(optionName(opts, "day")).toBe("Daily");
    expect(optionName(opts, "fortnight")).toBe("fortnight");
  });

  it("windowName handles named, custom and unknown windows", () => {
    expect(windowName("7d")).toBe("Last 7 days");
    expect(windowName("2026-10-01T00:00:00Z,2026-10-07T00:00:00Z")).toBe(
      "1 October 2026 through 7 October 2026",
    );
    expect(windowName(UNDESCRIBABLE)).toBe(UNDESCRIBABLE);
    expect(windowName("3h")).toBe("3h");
  });

  it("aggregateName lowercases known dimensions and passes unknown ones through", () => {
    expect(aggregateName("model_name")).toBe("model name");
    expect(aggregateName("gpu")).toBe("gpu");
  });

  it("inferenceErrorMessage singles out 501 and 504", () => {
    expect(inferenceErrorMessage({ isAxiosError: true, response: { status: 501 } })).toMatch(/not enabled/);
    expect(inferenceErrorMessage({ isAxiosError: true, response: { status: 504 } })).toMatch(
      /^Timed out .* shorter window/,
    );
    expect(inferenceErrorMessage({ isAxiosError: true, response: { status: 502 } })).toBe(
      "Failed to load inference costs.",
    );
    expect(inferenceErrorMessage({ isAxiosError: true })).toBe("Failed to load inference costs.");
    expect(inferenceErrorMessage(new Error("x"))).toBe("Failed to load inference costs.");
    expect(inferenceErrorMessage(undefined)).toBe("Failed to load inference costs.");
  });

  it("formatTokens uses compact notation", () => {
    expect(formatTokens(950)).toBe("950");
    expect(formatTokens(1_500_000)).toBe("1.5M");
    expect(formatTokens(2_340)).toBe("2.3K");
  });

  it("offers only model-level dimensions and reports changes", async () => {
    const user = userEvent.setup();
    const onWindow = vi.fn();
    const onAgg = vi.fn();
    render(
      <InferenceWindowAggregateSelects
        idPrefix="t"
        window="7d"
        aggregateBy="model_name"
        onWindowChange={onWindow}
        onAggregateByChange={onAgg}
      />,
    );
    const agg = screen.getByLabelText("Aggregate by");
    expect(within(agg).getAllByRole("option").map((o) => o.textContent)).toEqual(["Model name", "Model version", "Workload type"]);
    await user.selectOptions(agg, "model_version");
    expect(onAgg).toHaveBeenCalledWith("model_version");
    await user.selectOptions(screen.getByLabelText("Window"), "24h");
    expect(onWindow).toHaveBeenCalledWith("24h");
  });

  it("renders loading and empty states", () => {
    const { container, rerender } = render(<InferenceLoading />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect((container.firstElementChild as HTMLElement).style.height).toBe("400px");
    rerender(<InferenceLoading height={120} />);
    expect((container.firstElementChild as HTMLElement).style.height).toBe("120px");
    rerender(<InferenceEmptyState message="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
