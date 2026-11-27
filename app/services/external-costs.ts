import client from "./api-client";
import { parseFilters } from "~/lib/legacy-util";

class ExternalCostsService {
  async fetchExternalGraphCosts(
    win: string,
    aggregate: string,
    filters: { property: string; value: string }[],
    costType: string,
    sortBy: string,
    sortDirection: string,
  ) {
    const params = {
      window: win,
      aggregate,
      costType,
      filter: parseFilters(filters),
      sortBy,
      sortDirection,
    };
    const result = await client.get("/customCost/timeseries", { params });
    return result.data.data;
  }

  async fetchExternalTableCosts(
    win: string,
    aggregate: string,
    filters: { property: string; value: string }[],
    costType: string,
    sortBy: string,
    sortDirection: string,
  ) {
    const params = {
      window: win,
      aggregate,
      costType,
      filter: parseFilters(filters),
      sortBy,
      sortDirection,
    };
    const result = await client.get("/customCost/total", { params });
    return result.data.data;
  }
}

export default new ExternalCostsService();
