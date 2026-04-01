import client from "./api-client";
import { parseAssetsResponse, type Asset } from "~/lib/assets-api";
import { parseFilters } from "~/lib/legacy-util";

const CACHE_TTL_MS = 30_000;

export interface AssetFetchOptions {
  accumulate?: boolean;
  includeIdle?: boolean;
  step?: string;
  filters?: { property: string; value: string }[];
}

function buildCacheKey(
  win: string,
  aggregate: string,
  options: AssetFetchOptions,
): string {
  const { accumulate, includeIdle = true, step = "1d", filters } = options;
  const filterKey =
    filters && filters.length > 0
      ? JSON.stringify(
          [...filters].sort(
            (a, b) =>
              a.property.localeCompare(b.property) ||
              a.value.localeCompare(b.value),
          ),
        )
      : "";
  return `${win}|${aggregate}|${accumulate}|${includeIdle}|${step}|${filterKey}`;
}

const cache = new Map<string, { data: Asset[]; timestamp: number }>();
const inFlight = new Map<string, Promise<Asset[]>>();

class AssetsService {
  async fetchAssets(
    win: string,
    aggregate: string,
    options: AssetFetchOptions = {},
  ): Promise<Asset[]> {
    const key = buildCacheKey(win, aggregate, options);

    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    let promise = inFlight.get(key);
    if (promise) return promise;

    promise = this._doFetch(win, aggregate, options);
    inFlight.set(key, promise);

    try {
      const data = await promise;
      cache.set(key, { data, timestamp: Date.now() });
      return data;
    } finally {
      inFlight.delete(key);
    }
  }

  private async _doFetch(
    win: string,
    aggregate: string,
    options: AssetFetchOptions,
  ): Promise<Asset[]> {
    const {
      accumulate = true,
      includeIdle = true,
      step = "1d",
      filters,
    } = options;

    const params: Record<string, any> = {
      window: win,
      aggregate,
      includeIdle,
      accumulate,
      step,
    };

    if (filters && filters.length > 0) {
      params.filter = parseFilters(filters);
    }

    const resp = await client.get("/assets", { params });
    return parseAssetsResponse(resp.data);
  }
}

export default new AssetsService();
