import { formatSampleItemsForGraph, parseFilters } from "~/lib/legacy-util";
import client from "./api-client";

const CACHE_TTL_MS = 30_000;

function buildCacheKey(
  window: string,
  aggregate: string,
  costMetric: string,
  filters: { property: string; value: string }[],
): string {
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
  return `${window}|${aggregate}|${costMetric}|${filterKey}`;
}

const cache = new Map<string, { data: any; timestamp: number }>();
const inFlight = new Map<string, Promise<any>>();

class CloudCostService {
  async fetchCloudCostData(
    window: string,
    aggregate: string,
    costMetric: string,
    filters: { property: string; value: string }[],
  ): Promise<any> {
    const key = buildCacheKey(window, aggregate, costMetric, filters ?? []);

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

    promise = this._doFetch(window, aggregate, costMetric, filters ?? []);
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
    window: string,
    aggregate: string,
    costMetric: string,
    filters: { property: string; value: string }[],
  ) {
    const params: Record<string, any> = {
      window,
      aggregate,
      costMetric,
      filter: parseFilters(filters),
      limit: 1000,
    };

    if (aggregate.includes("item")) {
      const resp = await client.get("/cloudCost", {
        params: { window, costMetric, filter: parseFilters(filters) },
      });
      return formatSampleItemsForGraph({ data: resp.data.data, costMetric });
    }

    const [tableView, totalsView, graphView, status] = await Promise.all([
      client.get("/cloudCost/view/table", { params }),
      client.get("/cloudCost/view/totals", { params }),
      client.get("/cloudCost/view/graph", { params }),
      client.get("/cloudCost/status"),
    ]);

    return {
      tableRows: tableView.data.data,
      graphData: graphView.data.data,
      tableTotal: totalsView.data.data.combined,
      cloudCostStatus: status.data.data,
    };
  }
}

export default new CloudCostService();
