import client from "./api_client";

const mockAssets = [
  {
    name: "node-a",
    type: "node",
    cluster: "prod-cluster",
    region: "us-central1",
    totalCost: 420.35,
    idleCost: 140.12,
    category: "compute",
  },
  {
    name: "gpu-node-1",
    type: "gpu",
    cluster: "ml-cluster",
    region: "us-east1",
    totalCost: 680.1,
    idleCost: 90.0,
    category: "accelerator",
  },
  {
    name: "pvc-data",
    type: "disk",
    cluster: "prod-cluster",
    region: "us-central1",
    totalCost: 120.5,
    idleCost: 15.0,
    category: "storage",
  },
];

class AssetsService {
  async fetchAssets(params = {}) {
    const query = {
      window: params.window || "7d",
      aggregate: params.aggregate || "asset",
      ...params.extra,
    };

    try {
      const response = await client.get("/assets", {
        params: query,
      });

      return response.data;
    } catch (error) {
      const isNetworkError =
        error?.message?.includes("Network Error") ||
        error?.message?.includes("ECONNREFUSED");

      if (isNetworkError) {
        console.warn(
          "Assets backend not reachable; returning mock assets so the page can render.",
        );
        return { data: mockAssets };
      }

      throw error;
    }
  }
}

export default new AssetsService();

