import axios from "axios";

// API blows up when comma is encoded
export function parseExternalCostFilters(filters) {
    if (typeof filters === "string") {
      return filters;
    }

    return (
      [...new Set(filters.map((f) => `${f.property}:"${f.value}"`))].join(
        '+'
      ) || ""
    );
  }

class ExternalCostsService {
  BASE_URL = process.env.BASE_URL || "{PLACEHOLDER_BASE_URL}";

  async fetchExternalGraphCosts(win, aggregate, filters, costType, sortBy, sortDirection) {
    if (this.BASE_URL.includes("PLACEHOLDER_BASE_URL")) {
      this.BASE_URL = `http://localhost:9090/model`;
    }

    const params = {
      window: win,
      aggregate: aggregate,
      costType,
      filter: parseExternalCostFilters(filters),
      sortBy,
      sortDirection
    };
    
    const result = await axios.get(`${this.BASE_URL}/customCost/timeseries`, {
      params,
    });
    return result.data.data;
  }

  async fetchExternalTableCosts(win, aggregate, filters, costType, sortBy, sortDirection) {
    if (this.BASE_URL.includes("PLACEHOLDER_BASE_URL")) {
      this.BASE_URL = `http://localhost:9090/model`;
    }

    const params = {
      window: win,
      aggregate: aggregate,
      costType,
      filter: parseExternalCostFilters(filters),
      sortBy,
      sortDirection
    };
    
    const result = await axios.get(`${this.BASE_URL}/customCost/total`, {
      params,
    });
    return result.data.data;
  }
}

export default new ExternalCostsService();
