import { parseFilters } from "../util";
import client from "./api_client";
import { getMockData } from "./allocation.mock";

// Flag to enable mock data - must be explicitly set via REACT_APP_USE_MOCK_DATA environment variable
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

class AllocationService {
  async fetchAllocation(win, aggregate, options) {
    const { accumulate, filters, includeIdle = true } = options;
    const params = {
      window: win,
      aggregate: aggregate,
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
      const result = await client.get("/allocation/compute", {
        params,
      });
      return result.data;
    } catch (error) {
      const isNetworkError =
        error?.message?.includes("Network Error") ||
        error?.message?.includes("ECONNREFUSED");

      // Prefer real data, but if the backend is unreachable, fall back to mock data
      if ((USE_MOCK_DATA || isNetworkError) && getMockData) {
        console.warn(
          "Allocation backend not reachable; falling back to mock data so the UI can render.",
        );
        return getMockData(aggregate, filters);
      }
      throw error;
    }
  }
}

export default new AllocationService();
