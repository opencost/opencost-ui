import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  InferenceEmptyState,
  InferenceLoading,
  aggregateName,
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
    expect(aggregateName("controller_kind")).toBe("controller kind");
    expect(aggregateName("gpu")).toBe("gpu");
  });

  it("inferenceErrorMessage singles out 501", () => {
    expect(inferenceErrorMessage({ isAxiosError: true, response: { status: 501 } })).toMatch(/not enabled/);
    expect(inferenceErrorMessage({ isAxiosError: true, response: { status: 502 } })).toBe(
      "Failed to load inference costs.",
    );
    expect(inferenceErrorMessage({ isAxiosError: true })).toBe("Failed to load inference costs.");
    expect(inferenceErrorMessage(new Error("x"))).toBe("Failed to load inference costs.");
    expect(inferenceErrorMessage(undefined)).toBe("Failed to load inference costs.");
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
