import client from "./api_client";

// API blows up when comma is encoded
export function parseExternalCostFilters(filters) {
  if (typeof filters === "string") {
    return filters;
  }

  return (
    [...new Set(filters.map((f) => `${f.property}:"${f.value}"`))].join("+") ||
    ""
  );
}

class ExternalCostsService {
  async fetchExternalGraphCosts(
    win,
    aggregate,
    filters,
    costType,
    sortBy,
    sortDirection,
  ) {
    const params = {
      window: win,
      aggregate: aggregate,
      costType,
      filter: parseExternalCostFilters(filters),
      sortBy,
      sortDirection,
    };

    const result = await client.get(`/customCost/timeseries`, {
      params,
    });
    return result.data.data;
  }

  async fetchExternalTableCosts(
    win,
    aggregate,
    filters,
    costType,
    sortBy,
    sortDirection,
  ) {
    const params = {
      window: win,
      aggregate: aggregate,
      costType,
      filter: parseExternalCostFilters(filters),
      sortBy,
      sortDirection,
    };

    const result = await client.get(`/customCost/total`, {
      params,
    });
    return result.data.data;
  }

  async fetchExternalCostData(win, aggregate, filters) {
    const params = {
      window: win,
      aggregate: aggregate,
      filter: parseExternalCostFilters(filters),
    };

    const result = await client.get(`/customCost/total`, {
      params,
    });
    return result.data.data;
  }
}

export default new ExternalCostsService();
