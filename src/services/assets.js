import client from "./api_client";
import { getMockAssetsData } from "./assets.mock";

// Flag to enable mock data - must be explicitly set via REACT_APP_USE_MOCK_DATA environment variable
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

class AssetsService {
  /**
   * Fetch assets data from the API
   * @param {Object} params - Query parameters
   * @param {string} params.window - Time window (e.g., '7d', 'today', '24h')
   * @param {string} params.aggregate - Aggregation field (e.g., 'type', 'namespace', 'cluster')
   * @param {boolean} params.accumulate - If true, returns total; if false, returns daily time series
   * @returns {Promise<Object>} The assets data (object with asset keys)
   */
  async fetchAssets({ window = "7d", aggregate = "type", accumulate = true }) {
    const params = {
      window,
      aggregate,
      accumulate,
    };

    try {
      const result = await client.get("/model/assets", { params });
      // API returns {data: {assetKey: assetObj, ...}}
      // Extract the nested data object
      const responseData = result.data;
      if (responseData && responseData.data) {
        return responseData.data;
      }
      return responseData;
    } catch (error) {
      // Only use mock data if explicitly enabled via REACT_APP_USE_MOCK_DATA=true
      // This prevents confusion for users who misconfigured their backend
      if (
        USE_MOCK_DATA &&
        error.message &&
        (error.message.includes("Network Error") ||
          error.message.includes("ECONNREFUSED"))
      ) {
        console.warn(
          "Backend not available, using mock data (REACT_APP_USE_MOCK_DATA is enabled)"
        );
        return getMockAssetsData(window, aggregate, accumulate);
      }
      throw error;
    }
  }

  /**
   * Calculate summary statistics from assets data
   * @param {Object} data - Assets API response (object with asset keys)
   * @returns {Object} Summary with totalCost, cpuCost, ramCost, gpuCost
   */
  calculateSummary(data) {
    const summary = {
      totalCost: 0,
      cpuCost: 0,
      ramCost: 0,
      gpuCost: 0,
    };

    if (!data || typeof data !== "object") {
      return summary;
    }

    // Data is an object where each key is an asset ID
    Object.values(data).forEach((asset) => {
      if (asset && typeof asset === "object") {
        if (typeof asset.totalCost === "number") {
          summary.totalCost += asset.totalCost;
        }
        if (typeof asset.cpuCost === "number") {
          summary.cpuCost += asset.cpuCost;
        }
        if (typeof asset.ramCost === "number") {
          summary.ramCost += asset.ramCost;
        }
        if (typeof asset.gpuCost === "number") {
          summary.gpuCost += asset.gpuCost;
        }
      }
    });

    return summary;
  }

  /**
   * Transform assets data into table rows
   * @param {Object} data - Assets API response (object with asset keys)
   * @returns {Array} Array of asset rows for the table
   */
  transformToTableRows(data) {
    const rows = [];

    if (!data || typeof data !== "object") {
      return rows;
    }

    // Data is an object where each key is an asset ID
    Object.entries(data).forEach(([key, asset]) => {
      if (asset && typeof asset === "object") {
        rows.push({
          id: key,
          name: asset.properties?.name || asset.name || key.split("/").pop() || key,
          type: asset.type || "Unknown",
          providerID: asset.properties?.providerID || asset.providerID || "-",
          totalCost: asset.totalCost || 0,
          cpuCost: asset.cpuCost || 0,
          ramCost: asset.ramCost || 0,
          gpuCost: asset.gpuCost || 0,
        });
      }
    });

    // Sort by totalCost descending
    return rows.sort((a, b) => b.totalCost - a.totalCost);
  }

  /**
   * Transform assets data for donut chart
   * @param {Object} summary - Summary object with cost breakdowns
   * @returns {Array} Array of chart data objects
   */
  transformToChartData(summary) {
    const chartData = [];

    if (summary.cpuCost > 0) {
      chartData.push({ group: "CPU", value: summary.cpuCost });
    }
    if (summary.ramCost > 0) {
      chartData.push({ group: "RAM", value: summary.ramCost });
    }
    if (summary.gpuCost > 0) {
      chartData.push({ group: "GPU", value: summary.gpuCost });
    }

    // Calculate "Other" cost (total - cpu - ram - gpu)
    const categorizedCost = summary.cpuCost + summary.ramCost + summary.gpuCost;
    const otherCost = summary.totalCost - categorizedCost;
    if (otherCost > 0) {
      chartData.push({ group: "Other", value: otherCost });
    }

    return chartData;
  }

  /**
   * Transform assets data for pie chart by asset type
   * @param {Object} data - Assets API response (object with asset keys)
   * @returns {Array} Array of chart data objects grouped by type
   */
  transformToTypeChartData(data) {
    const typeCosts = {};

    if (!data || typeof data !== "object") {
      return [];
    }

    // Sum costs by asset type
    Object.values(data).forEach((asset) => {
      if (asset && typeof asset === "object" && asset.type) {
        const type = asset.type;
        if (!typeCosts[type]) {
          typeCosts[type] = 0;
        }
        if (typeof asset.totalCost === "number" && Number.isFinite(asset.totalCost)) {
          typeCosts[type] += asset.totalCost;
        }
      }
    });

    // Convert to chart data format and sort by value descending
    return Object.entries(typeCosts)
      .map(([group, value]) => ({ group, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }
}

export default new AssetsService();
