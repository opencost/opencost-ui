export interface Asset {
  id: string;
  name: string;
  type: string;
  provider: string;
  cluster: string;
  region: string;
  category: string;
  nodeType?: string;
  cpuCores: number;
  ramBytes: number;
  cpuCoreHours: number;
  cpuCost: number;
  ramCost: number;
  totalCost: number;
  cpuUtilization: number | null;
  ramUtilization: number | null;
  carbonEmissions: number;
  preemptible: boolean;
  lastModified: string;
  bytes?: number;
  storageClass?: string;
  ip?: string;
}

function isLikelyIPv4(s: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(s.trim());
}

function utilizationFromBreakdown(breakdown: {
  idle?: number;
  user?: number;
  system?: number;
  other?: number;
} | undefined): number | null {
  if (!breakdown || typeof breakdown.idle !== "number") return null;
  const { idle } = breakdown;
  const used = (breakdown.user ?? 0) + (breakdown.system ?? 0) + (breakdown.other ?? 0);
  if (idle >= 1 && used === 0) {
    return null;
  }
  return Math.round(Math.max(0, Math.min(100, (1 - idle) * 100)));
}

function pickDisplayName(labels: Record<string, string> | undefined, propertiesName: string): string {
  const fromLabels =
    labels?.displayName?.trim() ||
    labels?.hostname?.trim() ||
    "";
  if (fromLabels) return fromLabels;
  if (propertiesName && !isLikelyIPv4(propertiesName)) return propertiesName;
  return propertiesName || "";
}

export function parseAssetsResponse(response: { data: Record<string, any> }): Asset[] {
  return Object.entries(response.data)
    .filter(([, asset]) => asset.totalCost !== undefined && asset.type !== undefined)
    .map(([key, asset]) => {
      const labels = asset.labels as Record<string, string> | undefined;
      const propertiesName = String(asset.properties?.name ?? "").trim();
      const name =
        pickDisplayName(labels, propertiesName) || asset.type || key;

      const internalAddr = labels?.internal_addr?.trim();
      const ipFromName = propertiesName && isLikelyIPv4(propertiesName) ? propertiesName : undefined;
      const ip = internalAddr || ipFromName || (typeof asset.ip === "string" ? asset.ip : undefined);

      const cpuUtilization = utilizationFromBreakdown(asset.cpuBreakdown);
      const ramUtilization = utilizationFromBreakdown(asset.ramBreakdown);

      const carbonEmissions = asset.totalCost * 0.5;

      const region = asset.labels
        ? asset.labels.topology_kubernetes_io_region ||
          asset.labels.failure_domain_beta_kubernetes_io_region ||
          "unknown"
        : "unknown";

      return {
        id: key,
        name,
        type: asset.type,
        provider: asset.properties?.provider || "Unknown",
        cluster: asset.properties?.cluster || "Unknown",
        region,
        category: asset.properties?.category || "Unknown",
        nodeType: typeof asset.nodeType === "string" ? asset.nodeType : undefined,
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
        ip,
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
