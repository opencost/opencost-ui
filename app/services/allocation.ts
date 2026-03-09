import { parseFilters } from "~/lib/legacy-util";
import client from "./api-client";

class AllocationService {
  async fetchAllocation(
    win: string,
    aggregate: string,
    options: { accumulate?: boolean; filters?: { property: string; value: string }[]; includeIdle?: boolean },
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
    const result = await client.get("/allocation/compute", { params });
    return result.data;
  }
}

export default new AllocationService();
