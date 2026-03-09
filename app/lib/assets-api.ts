export interface Asset {
  id: string;
  name: string;
  type: string;
  provider: string;
  cluster: string;
  region: string;
  category: string;
  cpuCores: number;
  ramBytes: number;
  cpuCoreHours: number;
  cpuCost: number;
  ramCost: number;
  totalCost: number;
  cpuUtilization: number;
  ramUtilization: number;
  carbonEmissions: number;
  preemptible: boolean;
  lastModified: string;
  bytes?: number;
  storageClass?: string;
  ip?: string;
}

export function parseAssetsResponse(response: { data: Record<string, any> }): Asset[] {
  return Object.entries(response.data)
    .filter(([, asset]) => asset.totalCost !== undefined && asset.type !== undefined)
    .map(([key, asset]) => {
      const hasComputeMetrics =
        asset.cpuBreakdown !== undefined && asset.ramBreakdown !== undefined;
      const cpuUtilization = hasComputeMetrics
        ? Math.round((1 - asset.cpuBreakdown.idle) * 100)
        : 0;
      const ramUtilization = hasComputeMetrics
        ? Math.round((1 - asset.ramBreakdown.idle) * 100)
        : 0;

      const carbonEmissions = asset.totalCost * 0.5;

      const region = asset.labels
        ? asset.labels.topology_kubernetes_io_region ||
          asset.labels.failure_domain_beta_kubernetes_io_region ||
          "unknown"
        : "unknown";

      return {
        id: key,
        name: asset.properties?.name || asset.type,
        type: asset.type,
        provider: asset.properties?.provider || "Unknown",
        cluster: asset.properties?.cluster || "Unknown",
        region,
        category: asset.properties?.category || "Unknown",
        cpuCores: asset.cpuCores || 0,
        ramBytes: asset.ramBytes || 0,
        cpuCoreHours: asset.cpuCoreHours || 0,
        cpuCost: asset.cpuCost || 0,
        ramCost: asset.ramCost || 0,
        totalCost: asset.totalCost,
        cpuUtilization,
        ramUtilization,
        carbonEmissions,
        preemptible: asset.preemptible === 1,
        lastModified: new Date(asset.end).toISOString().split("T")[0],
        bytes: asset.bytes,
        storageClass: asset.storageClass,
        ip: asset.ip,
      };
    });
}

export async function fetchAssets(endpoint: string): Promise<Asset[]> {
  try {
    const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }
    const data = await response.json();
    return parseAssetsResponse(data);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
}
