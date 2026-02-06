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
   * Fetch assets time-series data (daily breakdown)
   * @param {Object} params - Query parameters
   * @param {string} params.window - Time window (e.g., '7d')
   * @returns {Promise<Array>} Array of daily cost data for charts
   */
  async fetchAssetsTimeSeries({ window = "7d" }) {
    const params = {
      window,
      accumulate: false, // Get daily breakdown
    };

    try {
      const result = await client.get("/model/assets", { params });
      const responseData = result.data;

      // Transform API response to chart-friendly format
      if (responseData && responseData.data) {
        return this.transformToTrendData(responseData.data);
      }
      // No data from API, return mock data
      return this.getMockTrendData(window);
    } catch (error) {
      console.warn("Could not fetch time-series data, using mock data:", error.message);
      // Always return mock trend data when API fails for development
      return this.getMockTrendData(window);
    }
  }

  /**
   * Export assets as CSV
   * @param {Object} params - Query parameters
   * @param {string} params.window - Time window
   * @param {string} params.aggregate - Aggregation type
   */
  async exportAssetsCsv({ window: timeWindow = "7d", aggregate = "type" }) {
    const params = {
      window: timeWindow,
      aggregate,
      accumulate: true,
      format: "csv",
    };

    try {
      const result = await client.get("/model/assets", {
        params,
        responseType: "blob",
      });

      // Create download link
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assets-${timeWindow}-${aggregate}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      globalThis.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
      // Fallback: generate CSV from current data
      throw new Error("CSV export is not available. Please try again later.");
    }
  }

  /**
   * Generate mock trend data for development
   * @param {string} window - Time window
   * @returns {Array} Mock trend data
   */
  getMockTrendData(window) {
    const days = window === "7d" ? 7 : window === "14d" ? 14 : window === "30d" ? 30 : 7;
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Generate realistic-looking cost data with some variance
      const baseTotal = 350 + Math.random() * 50;
      const cpuCost = baseTotal * 0.4 + (Math.random() - 0.5) * 20;
      const ramCost = baseTotal * 0.25 + (Math.random() - 0.5) * 15;
      const gpuCost = baseTotal * 0.35 + (Math.random() - 0.5) * 25;

      data.push(
        { date: dateStr, group: "Total Cost", value: cpuCost + ramCost + gpuCost },
        { date: dateStr, group: "CPU Cost", value: cpuCost },
        { date: dateStr, group: "RAM Cost", value: ramCost },
        { date: dateStr, group: "GPU Cost", value: gpuCost }
      );
    }

    return data;
  }

  /**
   * Transform API time-series response to chart data
   * @param {Array} data - API response array
   * @returns {Array} Chart-friendly data
   */
  transformToTrendData(data) {
    if (!Array.isArray(data)) return [];

    const chartData = [];
    data.forEach((dayData, index) => {
      if (dayData && typeof dayData === "object") {
        // Calculate totals for this day
        let totalCost = 0;
        let cpuCost = 0;
        let ramCost = 0;
        let gpuCost = 0;

        Object.values(dayData).forEach((asset) => {
          if (asset && typeof asset === "object") {
            totalCost += asset.totalCost || 0;
            cpuCost += asset.cpuCost || 0;
            ramCost += asset.ramCost || 0;
            gpuCost += asset.gpuCost || 0;
          }
        });

        // Use start date from first asset or generate date
        const firstAsset = Object.values(dayData)[0];
        const date = firstAsset?.start || new Date(Date.now() - (data.length - index - 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        chartData.push(
          { date, group: "Total Cost", value: totalCost },
          { date, group: "CPU Cost", value: cpuCost },
          { date, group: "RAM Cost", value: ramCost }
        );
        if (gpuCost > 0) {
          chartData.push({ date, group: "GPU Cost", value: gpuCost });
        }
      }
    });

    return chartData;
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
        // Convert RAM bytes to GB
        const ramBytes = asset.ramBytes || asset.properties?.ramBytes || 0;
        const ramGB = ramBytes > 0 ? ramBytes / (1024 * 1024 * 1024) : 0;

        rows.push({
          id: key,
          name: asset.properties?.name || asset.name || key.split("/").pop() || key,
          type: asset.type || "Unknown",
          providerID: asset.properties?.providerID || asset.providerID || "-",
          cpuCores: asset.cpuCores || asset.properties?.cpuCores || 0,
          ramGB: ramGB,
          preemptible: asset.preemptible ?? asset.properties?.preemptible ?? null,
          totalCost: asset.totalCost || 0,
          cpuCost: asset.cpuCost || 0,
          ramCost: asset.ramCost || 0,
          gpuCost: asset.gpuCost || 0,
          // Store full asset for detail panel
          _rawAsset: asset,
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
