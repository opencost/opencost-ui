import client from "./api-client";

/** Cost basis accepted by the `/inferenceCost/*` endpoints. */
export type InferenceCostBasis = "allocation" | "usage";

/** Accumulate steps accepted by `/inferenceCost/timeseries`. */
export type InferenceCostAccumulate = "hour" | "day" | "week" | "month";

export interface InferenceCostProperties {
  modelName: string;
  modelVersion?: string;
  namespace: string;
  cluster?: string;
  pod?: string;
  controller?: string;
  controllerKind?: string;
  container?: string;
  workloadType: string;
}

export interface InferenceCostWindow {
  start: string;
  end: string;
}

export interface InferenceCost {
  properties: InferenceCostProperties;
  window: InferenceCostWindow;
  costBasis: InferenceCostBasis;
  totalCost: number;
  promptTokens: number;
  generationTokens: number;
  totalTokens: number;
  costPerMillionTokens: number;
  inputCost: number;
  outputCost: number;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  cacheSavingsFraction: number;
  allocationMethod?: string;
}

export interface InferenceCostSet {
  inferenceCosts: Record<string, InferenceCost>;
  window: InferenceCostWindow;
}

export interface InferenceCostSetRange {
  inferenceCostSets: InferenceCostSet[];
  window: InferenceCostWindow;
}

export interface InferenceCostQuery {
  window: string;
  /** One of the API's supported dimensions, e.g. `model_name`. */
  aggregate: string;
  costBasis: InferenceCostBasis;
}

const CACHE_TTL_MS = 30_000;

/**
 * Inference queries sent to the server at once, across ALL widgets. Each one
 * is a full ComputeAllocation pass server-side (~40-80s cold for 7d), and two
 * concurrent cold 7d queries were observed to take the backend down.
 */
export const MAX_CONCURRENT_REQUESTS = 1;

interface Pending {
  key: string;
  promise: Promise<unknown>;
  /** Callers still waiting on this request. */
  waiters: number;
  /** Sent to the server (left the queue). */
  started: boolean;
  /** Drops the request from the queue; only used before it has started. */
  cancel: AbortController;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
const inFlight = new Map<string, Pending>();
let active = 0;
const queue: (() => void)[] = [];

function abortError(): DOMException {
  return new DOMException("The inference cost request was aborted", "AbortError");
}

/** Runs `fn` once a concurrency slot is free; rejects without running if aborted while queued. */
function runLimited<T>(signal: AbortSignal, fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const start = () => {
      signal.removeEventListener("abort", onAbort);
      active++;
      let p: Promise<T>;
      try {
        p = fn();
      } catch (e) {
        p = Promise.reject(e);
      }
      p.then(resolve, reject).finally(() => {
        active--;
        queue.shift()?.();
      });
    };
    const onAbort = () => {
      // Only reachable while queued: start() removes this listener.
      queue.splice(queue.indexOf(start), 1);
      reject(abortError());
    };
    if (active < MAX_CONCURRENT_REQUESTS) {
      start();
    } else {
      queue.push(start);
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

/** Waits on a shared request; aborting `signal` detaches only this caller. */
function subscribe(entry: Pending, signal?: AbortSignal): Promise<unknown> {
  entry.waiters++;
  if (!signal) return entry.promise;
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      entry.waiters--;
      // A request already on the wire is left to finish: the server keeps
      // computing regardless (ComputeAllocation takes no context), so
      // aborting it would only free the slot and let the next query run
      // concurrently with it. Its result still lands in the cache.
      if (entry.waiters === 0 && !entry.started) {
        // Not started means not settled, so it is still the map's entry.
        inFlight.delete(entry.key);
        entry.cancel.abort();
      }
      reject(abortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
    entry.promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener("abort", onAbort));
  });
}

/**
 * Fetch with a 30s cache, in-flight dedupe and a shared concurrency limit.
 * Superseded requests still waiting in the queue are dropped when every
 * caller has aborted.
 */
async function cachedGet<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const key = `${path}?${new URLSearchParams(params).toString()}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  if (signal?.aborted) throw abortError();

  let entry = inFlight.get(key);
  if (!entry) {
    const created: Pending = {
      key,
      promise: Promise.resolve(),
      waiters: 0,
      started: false,
      cancel: new AbortController(),
    };
    created.promise = runLimited(created.cancel.signal, () => {
      created.started = true;
      return client.get(path, { params }).then((r) => {
        const data = r.data?.data;
        // A 200 without the {code, data} envelope (proxy or SPA HTML
        // fallback, older backend) is an error, not an empty result.
        if (data === undefined) throw new Error(`Unexpected response from ${path}: missing data`);
        return data;
      });
    })
      .then((data) => {
        cache.set(key, { data, timestamp: Date.now() });
        return data;
      })
      .finally(() => {
        if (inFlight.get(key) === created) inFlight.delete(key);
      });
    // Every caller may have detached; don't surface that as unhandled.
    created.promise.catch(() => {});
    inFlight.set(key, created);
    entry = created;
  }
  return (await subscribe(entry, signal)) as T;
}

export function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

function toParams(q: InferenceCostQuery): Record<string, string> {
  return { window: q.window, aggregate: q.aggregate, costBasis: q.costBasis };
}

class InferenceCostService {
  /** `/inferenceCost/total`: one set accumulated over the whole window. */
  fetchTotal(q: InferenceCostQuery, signal?: AbortSignal): Promise<InferenceCostSet> {
    return cachedGet<InferenceCostSet>("/inferenceCost/total", toParams(q), signal);
  }

  /** `/inferenceCost/timeseries`: one set per accumulate step. */
  fetchTimeseries(
    q: InferenceCostQuery,
    accumulate: InferenceCostAccumulate,
    signal?: AbortSignal,
  ): Promise<InferenceCostSetRange> {
    return cachedGet<InferenceCostSetRange>(
      "/inferenceCost/timeseries",
      { ...toParams(q), accumulate },
      signal,
    );
  }
}

export default new InferenceCostService();
