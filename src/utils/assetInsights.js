import {
  getWastedCostForAsset,
  getTotalWastedCost,
  getIdlePercentage,
  calculateUsage,
} from "./assetCalculations";

export const generateInsights = (assets) => {
  if (!assets || assets.length === 0) return [];

  const insights = [];

  // Unused PVCs (100% idle)
  const unusedPvcs = assets.filter(
    (asset) => asset.local !== 1 && (asset.breakdown?.idle || 0) === 1
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

  // Fast-SSD disks with low usage (>60% idle)
  const lowUsageFastSsd = assets.filter((asset) => {
    if (asset.storageClass !== "fast-ssd") return false;
    return (asset.breakdown?.idle || 0) > 0.6;
  });

  if (lowUsageFastSsd.length > 0) {
    const savings = lowUsageFastSsd.reduce((sum, asset) => sum + getWastedCostForAsset(asset), 0);
    insights.push({
      id: "fast-ssd-downgrade",
      type: "info",
      severity: "low",
      title: `Downgrade ${lowUsageFastSsd.length} Fast-SSD to Standard Storage`,
      subtitle: "These fast disks have low usage and could use cheaper storage",
      savings,
      confidence: 60,
      action: "Downgrade",
      affectedAssets: lowUsageFastSsd.length,
      description: `Downgrading from fast-SSD to standard storage could save approximately $${savings.toFixed(2)} per month while maintaining performance.`,
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

export const getInsightColor = (type) => {
  const colors = {
    warning: "#da1e28",
    info: "#0043ce",
    success: "#24a148",
  };
  return colors[type] || "#525252";
};

export const formatSavings = (savings) => {
  if (savings > 1000) return `$${(savings / 1000).toFixed(1)}k`;
  return `$${savings.toFixed(2)}`;
};

export const getInsightsSummary = (insights) => {
  if (!insights || insights.length === 0) {
    return { totalSavings: 0, highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 };
  }

  return {
    totalSavings: insights.reduce((sum, i) => sum + (i.savings || 0), 0),
    highSeverity: insights.filter((i) => i.severity === "high").length,
    mediumSeverity: insights.filter((i) => i.severity === "medium").length,
    lowSeverity: insights.filter((i) => i.severity === "low").length,
  };
};

export const hasAssetIssue = (asset) => {
  if (!asset) return false;
  if (asset.breakdown?.idle === 1) return true;
  if ((asset.breakdown?.idle || 0) > 0.8) return true;

  const usage = calculateUsage(asset);
  return usage.totalGB > 100 && usage.usedGB < usage.totalGB * 0.2;
};

export const getAssetRecommendation = (asset) => {
  if (!asset) return "No recommendation";

  const idle = asset.breakdown?.idle || 0;
  if (idle === 1) return "Delete this unused asset";
  if (idle > 0.8) return `Resize or delete (${(idle * 100).toFixed(0)}% idle)`;
  if (idle > 0.5) return `Review for rightsizing (${(idle * 100).toFixed(0)}% idle)`;
  return "No action needed";
};
