import { parseFilters } from "../util";
import client from "./api_client";

const MOCK_ASSETS_DATA = {
  code: 200,
  isMock: true,
  data: [
    {
      "cluster-one/Node/node-1": {
        name: "node-1",
        type: "Node",
        properties: { cluster: "cluster-one", node: "node-1" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCores: 4,
        ramBytes: 16000000000,
        cpuCost: 120.50,
        gpuCost: 0,
        ramCost: 85.25,
        totalCost: 205.75,
        adjustment: 0,
      },
      "cluster-one/Node/node-2": {
        name: "node-2",
        type: "Node",
        properties: { cluster: "cluster-one", node: "node-2" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCores: 8,
        ramBytes: 32000000000,
        cpuCost: 241.00,
        gpuCost: 0,
        ramCost: 170.50,
        totalCost: 411.50,
        adjustment: 0,
      },
      "cluster-one/Disk/pvc-data": {
        name: "pvc-data",
        type: "Disk",
        properties: { cluster: "cluster-one" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 45.00,
        adjustment: 0,
      },
      "cluster-one/LoadBalancer/lb-main": {
        name: "lb-main",
        type: "LoadBalancer",
        properties: { cluster: "cluster-one" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 25.00,
        adjustment: 0,
      },
    },
  ],
};

// Flag to enable mock data
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

class AssetsService {
  async fetchAssets(win: string, aggregate: string, options: { accumulate?: boolean; filters?: string[] } = {}) {
    const { accumulate = true, filters = [] } = options;
    const params: { window: string; aggregate: string; accumulate: boolean; filter?: string } = {
      window: win,
      aggregate: aggregate,
      accumulate,
    };

    if (filters && filters.length > 0) {
      params.filter = parseFilters(filters);
    }

    try {
      const result = await client.get("/assets", { params });
      return result.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Using mock assets data due to error:", (error as Error).message);
        return MOCK_ASSETS_DATA;
      }
      throw error;
    }
  }
}

export default new AssetsService();
