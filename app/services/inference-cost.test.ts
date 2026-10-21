import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isAbortError } from "./inference-cost";

const get = vi.hoisted(() => vi.fn());
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

  it("rejects a 200 without the data envelope instead of caching undefined", async () => {
    const svc = await loadService();
    get.mockResolvedValueOnce({ data: "<!doctype html>" }).mockResolvedValueOnce({ data: { data: payload } });
    await expect(svc.fetchTotal(query)).rejects.toThrow("missing data");
    await expect(svc.fetchTotal(query)).resolves.toEqual(payload);
    expect(get).toHaveBeenCalledTimes(2);
  });

  describe("concurrency limit", () => {
    function pending() {
      const calls: { path: string; resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = [];
      get.mockImplementation(
        (path: string) =>
          new Promise((resolve, reject) => calls.push({ path, resolve, reject })),
      );
      return calls;
    }
    const flush = () => vi.advanceTimersByTimeAsync(0);

    it("sends one request at a time across all callers, in order", async () => {
      const svc = await loadService();
      const calls = pending();
      const a = svc.fetchTotal(query);
      const b = svc.fetchTimeseries(query, "day");
      const c = svc.fetchTotal({ ...query, window: "24h" });
      await flush();
      expect(calls.map((x) => x.path)).toEqual(["/inferenceCost/total"]);

      calls[0].resolve({ data: { data: payload } });
      await expect(a).resolves.toEqual(payload);
      await flush();
      expect(calls.map((x) => x.path)).toEqual(["/inferenceCost/total", "/inferenceCost/timeseries"]);

      // A failure still frees the slot.
      calls[1].reject(new Error("boom"));
      await expect(b).rejects.toThrow("boom");
      await flush();
      expect(calls).toHaveLength(3);
      calls[2].resolve({ data: { data: payload } });
      await expect(c).resolves.toEqual(payload);
    });

    it("drops a queued request when its only caller aborts", async () => {
      const svc = await loadService();
      const calls = pending();
      const first = svc.fetchTotal(query);
      const ac = new AbortController();
      const queued = svc.fetchTotal({ ...query, window: "24h" }, ac.signal);
      ac.abort();
      await expect(queued).rejects.toSatisfy(isAbortError);
      calls[0].resolve({ data: { data: payload } });
      await first;
      await flush();
      expect(calls).toHaveLength(1);

      // The key is free again: a new call queues a fresh request.
      const again = svc.fetchTotal({ ...query, window: "24h" });
      await flush();
      expect(calls).toHaveLength(2);
      calls[1].resolve({ data: { data: payload } });
      await expect(again).resolves.toEqual(payload);
    });

    it("keeps a queued request while another caller still wants it", async () => {
      const svc = await loadService();
      const calls = pending();
      const first = svc.fetchTotal(query);
      const ac = new AbortController();
      const q = { ...query, window: "24h" };
      const leaver = svc.fetchTotal(q, ac.signal);
      const stayer = svc.fetchTotal(q, new AbortController().signal);
      ac.abort();
      await expect(leaver).rejects.toSatisfy(isAbortError);
      calls[0].resolve({ data: { data: payload } });
      await first;
      await flush();
      expect(calls).toHaveLength(2);
      calls[1].resolve({ data: { data: payload } });
      await expect(stayer).resolves.toEqual(payload);
    });

    it("lets a started request finish and caches it after its caller aborts", async () => {
      const svc = await loadService();
      const calls = pending();
      const ac = new AbortController();
      const p = svc.fetchTotal(query, ac.signal);
      const next = svc.fetchTotal({ ...query, window: "24h" });
      ac.abort();
      await expect(p).rejects.toSatisfy(isAbortError);
      await flush();
      // Still holding the slot: the server keeps computing either way.
      expect(calls).toHaveLength(1);
      calls[0].resolve({ data: { data: payload } });
      await flush();
      expect(calls).toHaveLength(2);
      await expect(svc.fetchTotal(query)).resolves.toEqual(payload);
      expect(calls).toHaveLength(2);
      calls[1].resolve({ data: { data: payload } });
      await next;
    });

    it("rejects immediately for an already-aborted signal without a request", async () => {
      const svc = await loadService();
      const calls = pending();
      const ac = new AbortController();
      ac.abort();
      await expect(svc.fetchTotal(query, ac.signal)).rejects.toSatisfy(isAbortError);
      await flush();
      expect(calls).toHaveLength(0);
    });

    it("serves a fresh cache hit even with an aborted signal", async () => {
      const svc = await loadService();
      get.mockResolvedValue({ data: { data: payload } });
      await svc.fetchTotal(query);
      const ac = new AbortController();
      ac.abort();
      await expect(svc.fetchTotal(query, ac.signal)).resolves.toEqual(payload);
    });

    it("turns a synchronous client throw into a rejection and frees the slot", async () => {
      const svc = await loadService();
      get.mockImplementationOnce(() => {
        throw new Error("sync");
      });
      get.mockResolvedValueOnce({ data: { data: payload } });
      await expect(svc.fetchTotal(query)).rejects.toThrow("sync");
      await expect(svc.fetchTotal(query)).resolves.toEqual(payload);
    });
  });
});

describe("isAbortError", () => {
  it("matches only AbortError DOMExceptions", () => {
    expect(isAbortError(new DOMException("x", "AbortError"))).toBe(true);
    expect(isAbortError(new DOMException("x", "TimeoutError"))).toBe(false);
    expect(isAbortError(new Error("AbortError"))).toBe(false);
  });
});
