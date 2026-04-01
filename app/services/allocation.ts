import { parseFilters } from "~/lib/legacy-util";
import client from "./api-client";
import { getMockData } from "./allocation-mock";

const USE_MOCK_DATA =
  (import.meta.env.VITE_REACT_APP_USE_MOCK_DATA as string | undefined) ===
    "true" ||
  (import.meta.env.REACT_APP_USE_MOCK_DATA as string | undefined) === "true";

const CACHE_TTL_MS = 30_000;

function buildCacheKey(
  win: string,
  aggregate: string,
  options: {
    accumulate?: boolean;
    filters?: { property: string; value: string }[];
    includeIdle?: boolean;
  },
): string {
  const { accumulate, filters, includeIdle = true } = options;
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
  return `${win}|${aggregate}|${accumulate}|${includeIdle}|${filterKey}`;
}

const cache = new Map<string, { data: any; timestamp: number }>();
const inFlight = new Map<string, Promise<any>>();

class AllocationService {
  async fetchAllocation(
    win: string,
    aggregate: string,
    options: {
      accumulate?: boolean;
      filters?: { property: string; value: string }[];
      includeIdle?: boolean;
    },
  ): Promise<any> {
    const key = buildCacheKey(win, aggregate, options);

    // Return cached result if still fresh
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // Deduplicate in-flight requests
    let promise = inFlight.get(key);
    if (promise) {
      return promise;
    }

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
    options: {
      accumulate?: boolean;
      filters?: { property: string; value: string }[];
      includeIdle?: boolean;
    },
  ) {
    const { accumulate, filters, includeIdle = true } = options;
    const params: Record<string, any> = {
      window: win,
      aggregate,
      includeIdle,
      step: "1d",
    };
    if (typeof accumulate === "boolean") {
      params.accumulate = accumulate;
    }
    if (filters && filters.length > 0) {
      params.filter = parseFilters(filters);
    }

    try {
      const result = await client.get("/allocation/compute", { params });
      return result.data;
    } catch (error: any) {
      if (
        USE_MOCK_DATA &&
        typeof error?.message === "string" &&
        (error.message.includes("Network Error") ||
          error.message.includes("ECONNREFUSED"))
      ) {
        console.warn(
          "Backend not available, using mock data (mock data flag is enabled)",
        );
        return getMockData(aggregate, filters);
      }
      throw error;
    }
  }
}

export default new AllocationService();
