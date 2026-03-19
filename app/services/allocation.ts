import { parseFilters } from "~/lib/legacy-util";
import client from "./api-client";
import { getMockData } from "./allocation-mock";

const USE_MOCK_DATA =
  (import.meta.env.VITE_REACT_APP_USE_MOCK_DATA as string | undefined) === "true" ||
  (import.meta.env.REACT_APP_USE_MOCK_DATA as string | undefined) === "true";

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

    try {
      const result = await client.get("/allocation/compute", { params });
      return result.data;
    } catch (error: any) {
      if (
        USE_MOCK_DATA &&
        typeof error?.message === "string" &&
        (error.message.includes("Network Error") || error.message.includes("ECONNREFUSED"))
      ) {
        console.warn("Backend not available, using mock data (mock data flag is enabled)");
        return getMockData(aggregate, filters);
      }
      throw error;
    }
  }
}

export default new AllocationService();
