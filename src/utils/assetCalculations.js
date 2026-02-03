/**
 * Asset Calculations - Utility functions for asset data transformations
 *
 * Provides functions for:
 * - Converting bytes to human-readable formats
 * - Calculating costs and waste
 * - Computing efficiency scores
 * - Determining asset status
 */

/**
 * Convert bytes to GB with fixed decimal places
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} - Size in GB
 */
export const bytesToGB = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return 0;
  return parseFloat((bytes / Math.pow(1024, 3)).toFixed(decimals));
};

/**
 * Get idle percentage from asset breakdown
 * @param {object} asset - Asset object with breakdown data
 * @returns {number} - Idle percentage (0-100)
 */
export const getIdlePercentage = (asset) => {
  if (!asset || !asset.breakdown) return 0;
  return parseFloat(((asset.breakdown.idle || 0) * 100).toFixed(1));
};

/**
 * Get used percentage from asset breakdown
 * @param {object} asset - Asset object
 * @returns {number} - Used percentage (0-100)
 */
export const getUsedPercentage = (asset) => {
  if (!asset) return 0;
  const idle = getIdlePercentage(asset) / 100;
  return parseFloat(((1 - idle) * 100).toFixed(1));
};

/**
 * Calculate total cost from array of assets
 * @param {array} assets - Array of asset objects
 * @returns {number} - Total cost in dollars
 */
export const getTotalCost = (assets) => {
  if (!assets || assets.length === 0) return 0;
  return assets.reduce((sum, asset) => sum + (asset.totalCost || 0), 0);
};

/**
 * Calculate wasted cost (idle storage cost)
 * Assumes $0.1 per GB-month for idle storage
 * @param {object} asset - Asset object
 * @param {number} costPerGBMonth - Cost per GB per month (default: 0.1)
 * @returns {number} - Wasted cost in dollars
 */
export const getWastedCostForAsset = (asset, costPerGBMonth = 0.1) => {
  if (!asset) return 0;
  const idlePercent = (asset.breakdown?.idle || 0);
  const idleBytes = (asset.bytes || 0) * idlePercent;
  const idleGB = bytesToGB(idleBytes);
  return parseFloat((idleGB * costPerGBMonth).toFixed(2));
};

/**
 * Calculate total wasted cost for all assets
 * @param {array} assets - Array of asset objects
 * @returns {number} - Total wasted cost
 */
export const getTotalWastedCost = (assets) => {
  if (!assets || assets.length === 0) return 0;
  return assets.reduce((sum, asset) => sum + getWastedCostForAsset(asset), 0);
};

/**
 * Calculate total provisioned storage in GB
 * @param {array} assets - Array of asset objects
 * @returns {number} - Total provisioned storage in GB
 */
export const getTotalProvisioned = (assets) => {
  if (!assets || assets.length === 0) return 0;
  const totalBytes = assets.reduce((sum, asset) => sum + (asset.bytes || 0), 0);
  return bytesToGB(totalBytes);
};

/**
 * Calculate average idle percentage across assets
 * @param {array} assets - Array of asset objects
 * @returns {number} - Average idle percentage (0-100)
 */
export const getAverageIdle = (assets) => {
  if (!assets || assets.length === 0) return 0;
  const totalIdle = assets.reduce((sum, asset) => {
    return sum + (asset.breakdown?.idle || 0);
  }, 0);
  return parseFloat(((totalIdle / assets.length) * 100).toFixed(1));
};

/**
 * Calculate efficiency score (0-100)
 * 100 = all storage is used, 0 = all storage is idle
 * @param {array} assets - Array of asset objects
 * @returns {number} - Efficiency score (0-100)
 */
export const calculateEfficiencyScore = (assets) => {
  if (!assets || assets.length === 0) return 100;
  const avgIdle = getAverageIdle(assets) / 100;
  const score = Math.round((1 - avgIdle) * 100);
  return Math.max(0, Math.min(100, score)); // Clamp between 0-100
};

/**
 * Get asset status based on idle percentage
 * Status determines color coding and warnings
 * @param {object} asset - Asset object
 * @returns {object} - Status object with label and type
 */
export const getAssetStatus = (asset) => {
  if (!asset) return { label: "UNKNOWN", type: "gray" };

  const idlePercent = getIdlePercentage(asset);

  if (idlePercent >= 80) {
    return { label: "WASTE", type: "red", severity: "high" };
  }
  if (idlePercent >= 40) {
    return { label: "REVIEW", type: "orange", severity: "medium" };
  }
  return { label: "OK", type: "green", severity: "low" };
};

/**
 * Categorize assets into node disks and PVCs
 * @param {array} assets - Array of asset objects
 * @returns {object} - Object with nodeDisks and pvcs arrays
 */
export const categorizeAssets = (assets) => {
  const nodeDisks = assets.filter(asset => asset.local === 1);
  const pvcs = assets.filter(asset => asset.local !== 1);
  return { nodeDisks, pvcs };
};

/**
 * Calculate detailed usage breakdown for an asset
 * @param {object} asset - Asset object
 * @returns {object} - Usage breakdown with all calculations
 */
export const calculateUsage = (asset) => {
  if (!asset) {
    return {
      used: 0,
      idle: 0,
      usedGB: 0,
      idleGB: 0,
      totalGB: 0,
      idlePercentage: 0,
      usedPercentage: 0,
    };
  }

  const totalBytes = asset.bytes || 0;
  const breakdown = asset.breakdown || {};
  const idlePercentage = breakdown.idle || 0;
  const idleBytes = totalBytes * idlePercentage;
  const usedBytes = totalBytes * (1 - idlePercentage);

  return {
    used: usedBytes,
    idle: idleBytes,
    usedGB: bytesToGB(usedBytes),
    idleGB: bytesToGB(idleBytes),
    totalGB: bytesToGB(totalBytes),
    idlePercentage: (idlePercentage * 100).toFixed(1),
    usedPercentage: ((1 - idlePercentage) * 100).toFixed(1),
  };
};

/**
 * Format currency for display
 * @param {number} amount - Amount in dollars
 * @param {boolean} showCents - Include cents (default: true)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, showCents = true) => {
  if (amount === undefined || amount === null) return "$0.00";

  const formatted = parseFloat(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });

  return formatted;
};

/**
 * Get trend indicator for cost changes
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {object} - Trend object with direction and percentage
 */
export const getTrendIndicator = (current, previous) => {
  if (previous === 0) return { direction: "→", percentage: 0, change: 0 };

  const change = current - previous;
  const percentage = parseFloat(((change / previous) * 100).toFixed(1));
  const direction = change > 0 ? "↑" : change < 0 ? "↓" : "→";

  return { direction, percentage, change };
};

/**
 * Sort assets by specified column
 * @param {array} assets - Array of assets
 * @param {string} column - Column to sort by
 * @param {string} direction - Sort direction ("ASC" or "DESC")
 * @returns {array} - Sorted assets
 */
export const sortAssets = (assets, column, direction = "ASC") => {
  const sorted = [...assets];

  sorted.sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    // Handle numeric comparisons
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "ASC" ? aVal - bVal : bVal - aVal;
    }

    // Handle string comparisons
    const aStr = String(aVal || "").toLowerCase();
    const bStr = String(bVal || "").toLowerCase();

    if (direction === "ASC") {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  return sorted;
};
