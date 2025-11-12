import { parseFilters } from "../util";
import client from "./api_client";

class AllocationService {
  async fetchAllocation(win, aggregate, options) {
    const { accumulate, filters } = options;
    const params = {
      window: win,
      aggregate: aggregate,
      includeIdle: true,
      step: "1d",
    };
    if (typeof accumulate === "boolean") {
      params.accumulate = accumulate;
    }
    if (filters && filters.length > 0) {
      params.filter = parseFilters(filters);
    }
    const result = await client.get("/allocation/compute", {
      params,
    });
    return result.data;
  }
}

export default new AllocationService();
