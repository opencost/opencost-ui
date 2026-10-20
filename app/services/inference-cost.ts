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
const cache = new Map<string, { data: unknown; timestamp: number }>();
const inFlight = new Map<string, Promise<unknown>>();

/** Fetch with the same 30s cache + in-flight dedupe used by AllocationService. */
async function cachedGet<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const key = `${path}?${new URLSearchParams(params).toString()}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  let promise = inFlight.get(key);
  if (!promise) {
    promise = client.get(path, { params }).then((r) => r.data?.data);
    inFlight.set(key, promise);
  }
  try {
    const data = await promise;
    cache.set(key, { data, timestamp: Date.now() });
    return data as T;
  } finally {
    inFlight.delete(key);
  }
}

function toParams(q: InferenceCostQuery): Record<string, string> {
  return { window: q.window, aggregate: q.aggregate, costBasis: q.costBasis };
}

class InferenceCostService {
  /** `/inferenceCost/total`: one set accumulated over the whole window. */
  fetchTotal(q: InferenceCostQuery): Promise<InferenceCostSet> {
    return cachedGet<InferenceCostSet>("/inferenceCost/total", toParams(q));
  }

  /** `/inferenceCost/timeseries`: one set per accumulate step. */
  fetchTimeseries(
    q: InferenceCostQuery,
    accumulate: InferenceCostAccumulate,
  ): Promise<InferenceCostSetRange> {
    return cachedGet<InferenceCostSetRange>("/inferenceCost/timeseries", {
      ...toParams(q),
      accumulate,
    });
  }
}

export default new InferenceCostService();
