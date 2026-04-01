import client from "./api-client";

function parseExternalCostFilters(
  filters: { property: string; value: string }[] | string,
): string {
  if (typeof filters === "string") return filters;
  return (
    [...new Set(filters.map((f) => `${f.property}:"${f.value}"`))].join("+") ||
    ""
  );
}

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
      filter: parseExternalCostFilters(filters),
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
      filter: parseExternalCostFilters(filters),
      sortBy,
      sortDirection,
    };
    const result = await client.get("/customCost/total", { params });
    return result.data.data;
  }
}

export default new ExternalCostsService();
