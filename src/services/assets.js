import { parseFilters } from "../util";
import client from "./api_client";
import { getMockAssetsData, getMockToplineData } from "./assets.mock";

// Flag to enable mock data for development
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

/**
 * AssetsService handles all API interactions with the /model/assets endpoint.
 * Provides methods for fetching asset data and topline summaries.
 */
class AssetsService {
  /**
   * Fetch asset data from the /model/assets endpoint
   * @param {string} window - Time window (e.g., "7d", "1w", ISO ranges)
   * @param {object} options - Additional query parameters
   * @param {string} options.aggregate - Aggregation field (default: "type")
   * @param {boolean} options.accumulate - Whether to accumulate results
   * @param {number} options.limit - Maximum number of results
   * @param {number} options.offset - Pagination offset
   * @param {array} options.filters - Array of filter objects
   * @returns {Promise<object>} Asset data response
   */
  async fetchAssets(window, options = {}) {
    const {
      aggregate = "type",
      accumulate = true,
      limit,
      offset,
      filters,
    } = options;

    const params = {
      window,
      aggregate,
      accumulate,
    };

    if (typeof limit === "number") {
      params.limit = limit;
    }

    if (typeof offset === "number") {
      params.offset = offset;
    }

    if (filters && filters.length > 0) {
      params.filter = parseFilters(filters);
    }

    try {
      const result = await client.get("/model/assets", { params });
      return result.data;
    } catch (error) {
      // Use mock data if explicitly enabled via REACT_APP_USE_MOCK_DATA=true
      if (USE_MOCK_DATA && (error.code === "ERR_NETWORK" || error.message?.includes("Network Error"))) {
        console.warn("Backend not available, using mock data (REACT_APP_USE_MOCK_DATA is enabled)");
        return getMockAssetsData();
      }
      console.error("Error fetching assets:", error);
      throw error;
    }
  }

  /**
   * Fetch topline summary data for assets
   * @param {string} window - Time window (e.g., "7d", "1w", ISO ranges)
   * @param {object} options - Additional query parameters
   * @param {array} options.filters - Array of filter objects
   * @returns {Promise<object>} Topline summary data
   */
  async fetchTopline(window, options = {}) {
    const { filters } = options;

    const params = {
      window,
    };

    if (filters && filters.length > 0) {
      params.filter = parseFilters(filters);
    }

    try {
      const result = await client.get("/model/assets/topline", { params });
      return result.data;
    } catch (error) {
      // Use mock data if explicitly enabled via REACT_APP_USE_MOCK_DATA=true
      if (USE_MOCK_DATA && (error.code === "ERR_NETWORK" || error.message?.includes("Network Error"))) {
        console.warn("Backend not available, using mock data (REACT_APP_USE_MOCK_DATA is enabled)");
        return getMockToplineData();
      }
      console.error("Error fetching assets topline:", error);
      throw error;
    }
  }
}

export default new AssetsService();
