import client from "./api_client";

class AllocationService {
  async fetchAllocation(win, aggregate, options) {
    const { accumulate } = options;
    const params = {
      window: win,
      aggregate: aggregate,
      includeIdle: true,
      step: "1d",
    };
    if (typeof accumulate === "boolean") {
      params.accumulate = accumulate;
    }
    const result = await client.get("/allocation/compute", {
      params,
    });
    return result.data;
  }
}

export default new AllocationService();
