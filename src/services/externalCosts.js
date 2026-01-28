import client from "./api_client";
import { Logger } from "./logger";

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

    try {
      const result = await client.get(`/customCost/timeseries`, {
        params,
      });
      return result.data.data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        Logger.warn(
          "ExternalCostsService.fetchExternalGraphCosts: /customCost/timeseries not found (404). Returning empty dataset.",
        );
        return [];
      }
      throw error;
    }
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

    try {
      const result = await client.get(`/customCost/total`, {
        params,
      });
      return result.data.data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        Logger.warn(
          "ExternalCostsService.fetchExternalTableCosts: /customCost/total not found (404). Returning empty dataset.",
        );
        return [];
      }
      throw error;
    }
  }
}

export default new ExternalCostsService();
