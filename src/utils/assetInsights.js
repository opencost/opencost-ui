import {
  getWastedCostForAsset,
  calculateUsage,
} from "./assetCalculations";

export const generateInsights = (assets) => {
  if (!assets || assets.length === 0) return [];

  const insights = [];

  // Unused PVCs (100% idle)
  const unusedPvcs = assets.filter(
    (asset) =>
      asset.assetType === "PVC" &&
      !asset.local &&
      (asset.breakdown?.idle || 0) === 1
  );

  if (unusedPvcs.length > 0) {
    const savings = unusedPvcs.reduce((sum, asset) => sum + getWastedCostForAsset(asset), 0);
    insights.push({
      id: "unused-pvcs",
      type: "warning",
      severity: "high",
      title: `Delete ${unusedPvcs.length} Unused PVC${unusedPvcs.length > 1 ? "s" : ""}`,
      subtitle: "These persistent volume claims are 100% idle and have no usage",
      savings,
      confidence: 95,
      action: "Delete",
      affectedAssets: unusedPvcs.length,
      description: `Deleting these ${unusedPvcs.length} unused PVC${unusedPvcs.length > 1 ? "s" : ""} would save approximately $${savings.toFixed(2)} per month.`,
    });
  }

  // High idle node disks (>50% idle)
  const highIdleNodes = assets.filter(
    (asset) => asset.local === 1 && (asset.breakdown?.idle || 0) > 0.5
  );

  if (highIdleNodes.length > 0) {
    const savings = highIdleNodes.reduce((sum, asset) => sum + getWastedCostForAsset(asset), 0);
    insights.push({
      id: "high-idle-nodes",
      type: "info",
      severity: "medium",
      title: `Review ${highIdleNodes.length} Oversized Node Disk${highIdleNodes.length > 1 ? "s" : ""}`,
      subtitle: `Over 50% idle capacity could be resized`,
      savings,
      confidence: 70,
      action: "Review",
      affectedAssets: highIdleNodes.length,
      description: `Resizing these disks to match actual usage could save approximately $${savings.toFixed(2)} per month.`,
    });
  }

  // SSD-class disks (e.g., gp2, premium-rwo, ssd-csi) with low usage (>60% idle)
  const lowUsageSsd = assets.filter((asset) => {
    const sc = asset.storageClass?.toLowerCase();
    if (!sc?.includes("ssd") && !sc?.includes("premium")) return false;
    return (asset.breakdown?.idle || 0) > 0.6;
  });

  if (lowUsageSsd.length > 0) {
    const savings = lowUsageSsd.reduce((sum, asset) => sum + getWastedCostForAsset(asset), 0);
    insights.push({
      id: "fast-ssd-downgrade",
      type: "info",
      severity: "low",
      title: `Downgrade ${lowUsageSsd.length} SSD-Class Disk${lowUsageSsd.length > 1 ? "s" : ""} to Standard Storage`,
      subtitle: "These high-performance disks have low usage and could use cheaper storage",
      savings,
      confidence: 60,
      action: "Downgrade",
      affectedAssets: lowUsageSsd.length,
      description: `Downgrading from SSD-class to standard storage could save approximately $${savings.toFixed(2)} per month while maintaining performance.`,
    });
  }

  // Large disks (>100GB) with <20% usage
  const oversizedDisks = assets.filter((asset) => {
    const usage = calculateUsage(asset);
    return usage.totalGB > 100 && usage.usedGB < usage.totalGB * 0.2;
  });

  if (oversizedDisks.length > 0) {
    const savings = oversizedDisks.reduce((sum, asset) => sum + getWastedCostForAsset(asset), 0);
    insights.push({
      id: "oversized-disks",
      type: "warning",
      severity: "medium",
      title: `Resize ${oversizedDisks.length} Oversized Disk${oversizedDisks.length > 1 ? "s" : ""}`,
      subtitle: "Significant wasted allocated space",
      savings,
      confidence: 75,
      action: "Resize",
      affectedAssets: oversizedDisks.length,
      description: `These disks are significantly oversized. Resizing to match actual usage patterns could save approximately $${savings.toFixed(2)} per month.`,
    });
  }

  insights.sort((a, b) => b.savings - a.savings);
  return insights;
};
