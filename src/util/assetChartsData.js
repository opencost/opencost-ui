/**
 * Parses OpenCost assets API response (data object) into chart-ready structures
 * for Cost Distribution, Cost by Asset Type, Cost by Provider, and Utilization vs Wastage.
 * All values are derived from the API; nothing is hardcoded.
 */

/**
 * @param {Record<string, object>} assetsData - Raw data from GET /assets (response.data)
 * @returns {{
 *   costDistribution: Array<{ group: string; value: number; percentage?: number }>;
 *   costByAssetType: Array<{ group: string; value: number; count: number }>;
 *   costByProvider: Array<{ group: string; value: number; percentage: number }>;
 *   utilizationWastage: Array<{ group: string; key: 'Utilized' | 'Wasted'; value: number }>;
 *   totalCost: number;
 * }}
 */
export function parseAssetsDataForCharts(assetsData) {
  if (!assetsData || typeof assetsData !== "object") {
    return getEmptyChartData();
  }

  let totalCost = 0;
  const byCategory = {};
  const byType = {};
  const byProvider = {};
  const byTypeForUtilization = {};

  Object.values(assetsData).forEach((asset) => {
    const category = asset.properties?.category || "Unknown";
    const assetType = asset.type || "Unknown";
    const provider = asset.properties?.provider || "Unknown";
    const cost = Number(asset.totalCost) || 0;
    totalCost += cost;

    byCategory[category] = (byCategory[category] || 0) + cost;
    byType[assetType] = (byType[assetType] || { cost: 0, count: 0 });
    byType[assetType].cost += cost;
    byType[assetType].count += 1;
    byProvider[provider] = (byProvider[provider] || 0) + cost;

    if (!byTypeForUtilization[assetType]) {
      byTypeForUtilization[assetType] = { utilized: 0, wasted: 0 };
    }
    const utilized = Number(asset.totalCost) || 0;
    const wasted = Number(asset.idleCost) || 0;
    byTypeForUtilization[assetType].utilized += utilized - wasted;
    byTypeForUtilization[assetType].wasted += wasted;
  });

  const costDistribution = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .map(([group, value]) => ({
      group,
      value: Math.round(value * 100) / 100,
      percentage: totalCost > 0 ? Math.round((value / totalCost) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const costByAssetType = Object.entries(byType)
    .filter(([, v]) => v.cost > 0)
    .map(([group, v]) => ({
      group,
      value: Math.round(v.cost * 100) / 100,
      count: v.count,
    }))
    .sort((a, b) => b.value - a.value);

  const costByProvider = Object.entries(byProvider)
    .filter(([, v]) => v > 0)
    .map(([group, value]) => ({
      group,
      value: Math.round(value * 100) / 100,
      percentage: totalCost > 0 ? Math.round((value / totalCost) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const topTypes = Object.entries(byTypeForUtilization)
    .map(([group, v]) => ({ group, total: v.utilized + v.wasted }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((t) => t.group);

  const utilizationWastage = [];
  topTypes.forEach((group) => {
    const u = byTypeForUtilization[group];
    if (!u) return;
    const utilized = Math.round(u.utilized * 100) / 100;
    const wasted = Math.round(u.wasted * 100) / 100;
    if (utilized > 0) utilizationWastage.push({ group, key: "Utilized", value: utilized });
    if (wasted > 0) utilizationWastage.push({ group, key: "Wasted", value: wasted });
  });

  return {
    costDistribution,
    costByAssetType,
    costByProvider,
    utilizationWastage,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

function getEmptyChartData() {
  return {
    costDistribution: [],
    costByAssetType: [],
    costByProvider: [],
    utilizationWastage: [],
    totalCost: 0,
  };
}
