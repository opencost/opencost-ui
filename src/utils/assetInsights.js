/**
 * Asset Insights - Generate actionable recommendations
 *
 * Analyzes asset data and provides ranked insights to help users
 * identify cost-saving opportunities
 */

import {
  getWastedCostForAsset,
  getTotalWastedCost,
  getIdlePercentage,
  calculateUsage,
} from "./assetCalculations";

/**
 * Generate ranked insights from asset data
 * Insights are sorted by potential monthly savings
 *
 * @param {array} assets - Array of asset objects
 * @returns {array} - Array of insight objects, sorted by savings
 */
export const generateInsights = (assets) => {
  if (!assets || assets.length === 0) return [];

  const insights = [];

  // Insight 1: Unused PVCs (100% idle)
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

  // Insight 2: High idle node disks (>50% idle)
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

  // Insight 3: Fast-SSD disks with low usage
  const lowUsageFastSsd = assets.filter((asset) => {
    if (asset.storageClass !== "fast-ssd") return false;
    const idle = asset.breakdown?.idle || 0;
    return idle > 0.6; // More than 60% idle
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

  // Insight 4: Large disks with minimal usage
  const oversizedDisks = assets.filter((asset) => {
    const usage = calculateUsage(asset);
    const totalGB = usage.totalGB;
    const usedGB = usage.usedGB;
    // Disk larger than 100GB with less than 20% usage
    return totalGB > 100 && usedGB < totalGB * 0.2;
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

  // Sort by potential savings (highest first)
  insights.sort((a, b) => b.savings - a.savings);

  return insights;
};

/**
 * Get insight category color
 * @param {string} type - Insight type ("warning", "info", "success")
 * @returns {string} - Color code
 */
export const getInsightColor = (type) => {
  const colors = {
    warning: "#da1e28", // Red
    info: "#0043ce", // Blue
    success: "#24a148", // Green
  };
  return colors[type] || "#525252"; // Gray default
};

/**
 * Format savings amount for display
 * @param {number} savings - Monthly savings in dollars
 * @returns {string} - Formatted savings string
 */
export const formatSavings = (savings) => {
  if (savings > 1000) {
    return `$${(savings / 1000).toFixed(1)}k`;
  }
  return `$${savings.toFixed(2)}`;
};

/**
 * Get insights summary statistics
 * @param {array} insights - Array of insights
 * @returns {object} - Summary statistics
 */
export const getInsightsSummary = (insights) => {
  if (!insights || insights.length === 0) {
    return {
      totalSavings: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
    };
  }

  const totalSavings = insights.reduce((sum, insight) => sum + (insight.savings || 0), 0);
  const highSeverity = insights.filter((i) => i.severity === "high").length;
  const mediumSeverity = insights.filter((i) => i.severity === "medium").length;
  const lowSeverity = insights.filter((i) => i.severity === "low").length;

  return {
    totalSavings,
    highSeverity,
    mediumSeverity,
    lowSeverity,
  };
};

/**
 * Check if an asset has critical issues
 * @param {object} asset - Asset object
 * @returns {boolean} - True if asset needs attention
 */
export const hasAssetIssue = (asset) => {
  if (!asset) return false;

  // Check if 100% idle
  if (asset.breakdown?.idle === 1) return true;

  // Check if >80% idle
  if ((asset.breakdown?.idle || 0) > 0.8) return true;

  // Check if oversized
  const usage = calculateUsage(asset);
  if (usage.totalGB > 100 && usage.usedGB < usage.totalGB * 0.2) return true;

  return false;
};

/**
 * Get issue recommendation for an asset
 * @param {object} asset - Asset object
 * @returns {string} - Recommendation text
 */
export const getAssetRecommendation = (asset) => {
  if (!asset) return "No recommendation";

  const idle = asset.breakdown?.idle || 0;

  if (idle === 1) {
    return "Delete this unused asset";
  }

  if (idle > 0.8) {
    return `Resize or delete (${(idle * 100).toFixed(0)}% idle)`;
  }

  if (idle > 0.5) {
    return `Review for rightsizing (${(idle * 100).toFixed(0)}% idle)`;
  }

  return "No action needed";
};
