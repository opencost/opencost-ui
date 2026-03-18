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
      // Only use mock data if explicitly enabled via REACT_APP_USE_MOCK_DATA=true
      // This prevents confusion for users who misconfigured their backend
      if (USE_MOCK_DATA && error.message && (error.message.includes("Network Error") || error.message.includes("ECONNREFUSED"))) {
        console.warn("Backend not available, using mock data (REACT_APP_USE_MOCK_DATA is enabled)");
        return getMockData(aggregate, filters);
      }
      throw error;
    }
  }
}

export default new AllocationService();
