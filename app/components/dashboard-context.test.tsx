import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardProvider, useDashboard } from "./dashboard-context";

describe("default AI Inference Costs dashboard", () => {
  beforeEach(() => {
    // Node's experimental localStorage shadows jsdom's when run without
    // --localstorage-file, so stub an empty store.
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("has a full-width cost chart above two half-width widgets", () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });
    const dashboard = result.current.dashboards.find(
      (d) => d.name === "AI Inference Costs",
    );

    expect(dashboard).toBeDefined();
    expect(
      dashboard!.widgets.map(({ type, gridSize }) => ({ type, gridSize })),
    ).toEqual([
      { type: "inference-cost-chart", gridSize: "4" },
      { type: "inference-cost-per-million", gridSize: "2" },
      { type: "inference-idle-ranking", gridSize: "2" },
    ]);
  });
});
