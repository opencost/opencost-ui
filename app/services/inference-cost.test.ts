import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("./api-client", () => ({ default: { get } }));

// The module keeps a cache across calls, so each test loads a fresh copy.
async function loadService() {
  vi.resetModules();
  return (await import("./inference-cost")).default;
}

const query = { window: "7d", aggregate: "model_name", costBasis: "allocation" as const };
const payload = { inferenceCosts: { a: { totalCost: 1 } }, window: { start: "s", end: "e" } };

beforeEach(() => {
  get.mockReset();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-20T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("InferenceCostService", () => {
  it("calls /total with the query params and unwraps the response envelope", async () => {
    const svc = await loadService();
    get.mockResolvedValueOnce({ data: { code: 200, data: payload } });
    await expect(svc.fetchTotal(query)).resolves.toEqual(payload);
    expect(get).toHaveBeenCalledWith("/inferenceCost/total", {
      params: { window: "7d", aggregate: "model_name", costBasis: "allocation" },
    });
  });

  it("calls /timeseries with accumulate", async () => {
    const svc = await loadService();
    get.mockResolvedValueOnce({ data: { data: { inferenceCostSets: [] } } });
    await svc.fetchTimeseries({ ...query, costBasis: "usage" }, "hour");
    expect(get).toHaveBeenCalledWith("/inferenceCost/timeseries", {
      params: { window: "7d", aggregate: "model_name", costBasis: "usage", accumulate: "hour" },
    });
  });

  it("serves repeat calls from cache for 30s, then refetches", async () => {
    const svc = await loadService();
    get.mockResolvedValue({ data: { data: payload } });
    await svc.fetchTotal(query);
    vi.advanceTimersByTime(29_999);
    await svc.fetchTotal(query);
    expect(get).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2);
    await svc.fetchTotal(query);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("caches per distinct query", async () => {
    const svc = await loadService();
    get.mockResolvedValue({ data: { data: payload } });
    await svc.fetchTotal(query);
    await svc.fetchTotal({ ...query, costBasis: "usage" });
    await svc.fetchTimeseries(query, "day");
    await svc.fetchTimeseries(query, "week");
    expect(get).toHaveBeenCalledTimes(4);
  });

  it("dedupes concurrent identical requests", async () => {
    const svc = await loadService();
    let resolve!: (v: unknown) => void;
    get.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    const a = svc.fetchTotal(query);
    const b = svc.fetchTotal(query);
    resolve({ data: { data: payload } });
    await expect(Promise.all([a, b])).resolves.toEqual([payload, payload]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("does not cache failures, so the next call retries", async () => {
    const svc = await loadService();
    get.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce({ data: { data: payload } });
    await expect(svc.fetchTotal(query)).rejects.toThrow("boom");
    await expect(svc.fetchTotal(query)).resolves.toEqual(payload);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("returns undefined when the envelope has no data", async () => {
    const svc = await loadService();
    get.mockResolvedValueOnce({ data: undefined });
    await expect(svc.fetchTotal(query)).resolves.toBeUndefined();
  });
});
