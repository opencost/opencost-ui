import { parseFilters } from "../util";
import client from "./api_client";

const MOCK_ASSETS_DATA = {
  code: 200,
  isMock: true,
  data: [
    {
      "cluster-one/Node/node-prod-1": {
        name: "node-prod-1",
        type: "Node",
        properties: { cluster: "cluster-one", node: "node-prod-1" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCores: 16,
        ramBytes: 64000000000,
        cpuCost: 320.50,
        gpuCost: 150.00,
        ramCost: 185.25,
        totalCost: 655.75,
        adjustment: 0,
      },
      "cluster-one/Node/node-prod-2": {
        name: "node-prod-2",
        type: "Node",
        properties: { cluster: "cluster-one", node: "node-prod-2" },
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
      "cluster-one/Node/node-prod-3": {
        name: "node-prod-3",
        type: "Node",
        properties: { cluster: "cluster-one", node: "node-prod-3" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCores: 8,
        ramBytes: 32000000000,
        cpuCost: 225.00,
        gpuCost: 75.00,
        ramCost: 160.00,
        totalCost: 460.00,
        adjustment: 0,
      },
      "cluster-one/Node/node-staging-1": {
        name: "node-staging-1",
        type: "Node",
        properties: { cluster: "cluster-one", node: "node-staging-1" },
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
      "cluster-one/Node/node-staging-2": {
        name: "node-staging-2",
        type: "Node",
        properties: { cluster: "cluster-one", node: "node-staging-2" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCores: 4,
        ramBytes: 16000000000,
        cpuCost: 115.00,
        gpuCost: 0,
        ramCost: 80.00,
        totalCost: 195.00,
        adjustment: 0,
      },
      // GPU Nodes
      "cluster-one/Node/gpu-node-1": {
        name: "gpu-node-1",
        type: "Node",
        properties: { cluster: "cluster-one", node: "gpu-node-1" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCores: 32,
        ramBytes: 128000000000,
        cpuCost: 180.00,
        gpuCost: 850.00,
        ramCost: 220.00,
        totalCost: 1250.00,
        adjustment: 0,
      },
      // Persistent Volumes / Disks
      "cluster-one/Disk/pvc-postgres-data": {
        name: "pvc-postgres-data",
        type: "Disk",
        properties: { cluster: "cluster-one" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 125.00,
        adjustment: 0,
      },
      "cluster-one/Disk/pvc-redis-cache": {
        name: "pvc-redis-cache",
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
      "cluster-one/Disk/pvc-logs-storage": {
        name: "pvc-logs-storage",
        type: "Disk",
        properties: { cluster: "cluster-one" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 78.50,
        adjustment: 0,
      },
      "cluster-one/LoadBalancer/lb-frontend": {
        name: "lb-frontend",
        type: "LoadBalancer",
        properties: { cluster: "cluster-one" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 35.00,
        adjustment: 0,
      },
      "cluster-one/LoadBalancer/lb-api-gateway": {
        name: "lb-api-gateway",
        type: "LoadBalancer",
        properties: { cluster: "cluster-one" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 42.00,
        adjustment: 0,
      },
      "cluster-one/Network/nat-gateway": {
        name: "nat-gateway",
        type: "Network",
        properties: { cluster: "cluster-one" },
        start: "2026-01-22T00:00:00Z",
        end: "2026-01-29T00:00:00Z",
        minutes: 10080,
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 65.00,
        adjustment: 0,
      },
    },
  ],
};

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
