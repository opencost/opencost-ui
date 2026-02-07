import { get, round } from "lodash";
import { assetTypeConfig } from "./tokens";

// Convert the API's object map into an array of asset objects with flattened properties
export function transformAssetsData(dataMap) {
  if (!dataMap || typeof dataMap !== "object") return [];
  return Object.entries(dataMap).map(([key, asset]) => ({
    key,
    name: get(asset, "properties.name", key.split("/").pop()),
    type: asset.type || "Unknown",
    category: get(asset, "properties.category", "Other"),
    provider: get(asset, "properties.provider", "Unknown"),
    cluster: get(asset, "properties.cluster", ""),
    project: get(asset, "properties.project", ""),
    providerID: get(asset, "properties.providerID", ""),
    totalCost: asset.totalCost || 0,
    labels: asset.labels || {},
    // Node-specific
    nodeType: asset.nodeType,
    cpuCores: asset.cpuCores,
    ramBytes: asset.ramBytes,
    cpuCost: asset.cpuCost,
    ramCost: asset.ramCost,
    gpuCost: asset.gpuCost,
    cpuBreakdown: asset.cpuBreakdown,
    ramBreakdown: asset.ramBreakdown,
    preemptible: asset.preemptible,
    discount: asset.discount,
    // Disk-specific
    storageClass: asset.storageClass,
    volumeName: asset.volumeName,
    claimName: asset.claimName,
    claimNamespace: asset.claimNamespace,
    bytes: asset.bytes,
    byteHours: asset.byteHours,
    breakdown: asset.breakdown,
    // Time
    start: asset.start,
    end: asset.end,
    minutes: asset.minutes,
    window: asset.window,
  }));
}

// Group assets by type and compute totals + counts
export function computeAssetTypeSummary(assets) {
  const summary = {};
  for (const asset of assets) {
    const t = asset.type;
    if (!summary[t]) {
      summary[t] = { type: t, totalCost: 0, count: 0 };
    }
    summary[t].totalCost += asset.totalCost;
    summary[t].count += 1;
  }
  return summary;
}

// Sum all totalCost across assets
export function computeGrandTotal(assets) {
  return assets.reduce((sum, a) => sum + a.totalCost, 0);
}

// Group by any property and sum totalCost
export function groupAssetsBy(assets, property) {
  const groups = {};
  for (const asset of assets) {
    const val = get(asset, property, "Unknown") || "Unknown";
    if (!groups[val]) {
      groups[val] = { name: val, totalCost: 0, count: 0 };
    }
    groups[val].totalCost += asset.totalCost;
    groups[val].count += 1;
  }
  return Object.values(groups).sort((a, b) => b.totalCost - a.totalCost);
}

// Filter assets by type
export function filterAssetsByType(assets, type) {
  if (!type || type === "all") return assets;
  return assets.filter((a) => a.type === type);
}

// Filter assets by category
export function filterAssetsByCategory(assets, category) {
  if (!category || category === "all") return assets;
  return assets.filter((a) => a.category === category);
}

// Format CPU cores
export function formatCores(cores) {
  if (cores === undefined || cores === null) return "—";
  return `${round(cores, 2)} cores`;
}

// Format bytes to human-readable
export function formatBytes(bytes) {
  if (bytes === undefined || bytes === null) return "—";
  const gi = Math.pow(1024, 3);
  if (bytes >= gi) return `${round(bytes / gi, 1)} GiB`;
  const mi = Math.pow(1024, 2);
  if (bytes >= mi) return `${round(bytes / mi, 1)} MiB`;
  return `${round(bytes / 1024, 1)} KiB`;
}

// Format a breakdown object { idle, system, user, other } as percentages
export function formatBreakdown(breakdown) {
  if (!breakdown) return null;
  return {
    idle: round((breakdown.idle || 0) * 100, 1),
    system: round((breakdown.system || 0) * 100, 1),
    user: round((breakdown.user || 0) * 100, 1),
    other: round((breakdown.other || 0) * 100, 1),
  };
}

// Get the color for an asset type
export function getAssetColor(type) {
  return get(assetTypeConfig, [type, "color"], "#9e9e9e");
}

// Sorting helpers (same pattern as allocationReport.js)
export function descendingComparator(a, b, orderBy) {
  if (get(b, orderBy) < get(a, orderBy)) return -1;
  if (get(b, orderBy) > get(a, orderBy)) return 1;
  return 0;
}

export function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}
