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
   * Returns mock data for the cost trend chart
   * @param {Object} params - Query parameters
   * @param {string} params.window - Time window (e.g., '7d')
   * @returns {Promise<Array>} Array of daily cost data for charts
   */
  async fetchAssetsTimeSeries({ window = "7d" }) {
    // Generate mock data instead of calling API
    const days = window === "7d" ? 7 : window === "14d" ? 14 : window === "30d" ? 30 : 7;
    const chartData = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Generate realistic-looking cost data with more balanced values
      const baseNode = 15 + Math.random() * 10;  // Node costs: $15-$25
      const baseDisk = 5 + Math.random() * 3;     // Disk costs: $5-$8
      const baseNetwork = 3 + Math.random() * 2;  // Network costs: $3-$5
      const baseLB = 7 + Math.random() * 3;       // LoadBalancer costs: $7-$10

      chartData.push(
        { date: dateStr, group: "Node", value: baseNode },
        { date: dateStr, group: "Disk", value: baseDisk },
        { date: dateStr, group: "Network", value: baseNetwork },
        { date: dateStr, group: "LoadBalancer", value: baseLB }
      );
    }

    return chartData;
  }


  /**
   * Transform allocation API time-series response to chart data
   * The allocation endpoint returns data under an empty string key with cost components
   * We need to map these components to meaningful categories for the chart
   * @param {Array} data - API response array from /model/allocation with step
   * @returns {Array} Chart-friendly data grouped by cost category
   */
  transformAllocationToTrendData(data) {
    if (!Array.isArray(data)) return [];

    const chartData = [];

    data.forEach((dayData, index) => {
      if (dayData && typeof dayData === "object") {
        // The API returns data under an empty string key: { "": { cpuCost, ramCost, ... } }
        const allocation = dayData[""] || dayData[Object.keys(dayData)[0]];

        if (allocation && typeof allocation === "object") {
          // Extract date from the allocation's window
          let date;
          if (allocation.window && allocation.window.start) {
            date = allocation.window.start.split("T")[0];
          } else {
            // Fallback: calculate date based on index
            const daysAgo = data.length - index - 1;
            date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0];
          }

          // Map cost components to categories
          // Node = CPU + RAM + GPU costs
          const nodeCost = (allocation.cpuCost || 0) + (allocation.ramCost || 0) + (allocation.gpuCost || 0);
          if (nodeCost > 0) {
            chartData.push({
              date,
              group: "Node",
              value: nodeCost
            });
          }

          // Disk = PV (Persistent Volume) cost
          const diskCost = allocation.pvCost || 0;
          if (diskCost > 0) {
            chartData.push({
              date,
              group: "Disk",
              value: diskCost
            });
          }

          // Network cost
          const networkCost = allocation.networkCost || 0;
          if (networkCost > 0) {
            chartData.push({
              date,
              group: "Network",
              value: networkCost
            });
          }

          // LoadBalancer cost
          const lbCost = allocation.loadBalancerCost || 0;
          if (lbCost > 0) {
            chartData.push({
              date,
              group: "LoadBalancer",
              value: lbCost
            });
          }

          // Cloud/External cost
          const cloudCost = allocation.externalCost || 0;
          if (cloudCost > 0) {
            chartData.push({
              date,
              group: "Cloud",
              value: cloudCost
            });
          }

          // ClusterManagement = shared cost
          const clusterMgmtCost = allocation.sharedCost || 0;
          if (clusterMgmtCost > 0) {
            chartData.push({
              date,
              group: "ClusterManagement",
              value: clusterMgmtCost
            });
          }
        }
      }
    });

    return chartData;
  }

  /**
   * Transform API time-series response to chart data grouped by asset type
   * @param {Array} data - API response array (array of daily asset objects)
   * @returns {Array} Chart-friendly data grouped by asset type
   */
  transformToTrendData(data) {
    if (!Array.isArray(data)) return [];

    const chartData = [];

    data.forEach((dayData, index) => {
      if (dayData && typeof dayData === "object") {
        // Group costs by asset type for this day
        const typeCosts = {};

        Object.values(dayData).forEach((asset) => {
          if (asset && typeof asset === "object" && asset.type) {
            const assetType = asset.type;
            if (!typeCosts[assetType]) {
              typeCosts[assetType] = 0;
            }
            typeCosts[assetType] += asset.totalCost || 0;
          }
        });

        // Use start date from first asset or generate date
        const firstAsset = Object.values(dayData)[0];
        const date = firstAsset?.start
          ? firstAsset.start.split("T")[0]
          : new Date(Date.now() - (data.length - index - 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        // Add data points for each asset type
        Object.entries(typeCosts).forEach(([type, cost]) => {
          if (cost > 0) {
            chartData.push({
              date,
              group: type,
              value: cost
            });
          }
        });
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
