export const parseDays = (timeWindow) => {
  if (!timeWindow) return 30;

  // Handle named windows
  if (timeWindow === "today" || timeWindow === "yesterday") return 1;

  // Handle hour-based windows (24h, 48h, etc.)
  if (timeWindow.endsWith("h")) {
    const hours = parseInt(timeWindow);
    return Math.ceil(hours / 24);
  }

  // Handle day-based windows (7d, 30d, etc.) - default
  const days = parseInt(timeWindow);
  return !isNaN(days) && days > 0 ? days : 30;
};

export const bytesToGB = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return 0;
  return parseFloat((bytes / Math.pow(1024, 3)).toFixed(decimals));
};

export const getIdlePercentage = (asset) => {
  if (!asset || !asset.breakdown) return 0;
  return parseFloat(((asset.breakdown.idle || 0) * 100).toFixed(1));
};

export const getUsedPercentage = (asset) => {
  if (!asset) return 0;
  const idle = getIdlePercentage(asset) / 100;
  return parseFloat(((1 - idle) * 100).toFixed(1));
};

export const getTotalCost = (assets) => {
  if (!assets || assets.length === 0) return 0;
  return assets.reduce((sum, asset) => sum + (asset.totalCost || 0), 0);
};

export const getWastedCostForAsset = (asset) => {
  if (!asset) return 0;
  const idlePercent = asset.breakdown?.idle || 0;
  return parseFloat(((asset.totalCost || 0) * idlePercent).toFixed(2));
};

export const getTotalWastedCost = (assets) => {
  if (!assets || assets.length === 0) return 0;
  return assets.reduce((sum, asset) => sum + getWastedCostForAsset(asset), 0);
};

// Status classification thresholds (percentage idle)
export const IDLE_THRESHOLD_REVIEW = 40;
export const IDLE_THRESHOLD_WASTE = 80;

export const getAverageIdle = (assets) => {
  if (!assets || assets.length === 0) return 0;
  const totalIdle = assets.reduce((sum, asset) => {
    return sum + (asset.breakdown?.idle || 0);
  }, 0);
  return parseFloat(((totalIdle / assets.length) * 100).toFixed(1));
};

// 100 = fully used, 0 = fully idle
export const calculateEfficiencyScore = (assets) => {
  if (!assets || assets.length === 0) return 100;
  const avgIdle = getAverageIdle(assets) / 100;
  const score = Math.round((1 - avgIdle) * 100);
  return Math.max(0, Math.min(100, score));
};

export const getAssetStatus = (asset) => {
  if (!asset) return { label: "UNKNOWN", type: "gray" };

  const idlePercent = getIdlePercentage(asset);

  if (idlePercent >= IDLE_THRESHOLD_WASTE) {
    return { label: "WASTE", type: "red", severity: "high" };
  }
  if (idlePercent >= IDLE_THRESHOLD_REVIEW) {
    return { label: "REVIEW", type: "magenta", severity: "medium" };
  }
  return { label: "OK", type: "green", severity: "low" };
};

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

export const formatCurrency = (amount, showCents = true) => {
  if (amount === undefined || amount === null) return "$0.00";

  return parseFloat(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });
};

// Light-theme categorical palette (14 colors) 
export const CHART_PALETTE_LIGHT = [
  "#ee538b", // Magenta 50
  "#1192e8", // Cyan 50
  "#005d5d", // Teal 70
  "#9f1853", // Magenta 70
  "#fa4d56", // Red 50
  "#570408", // Red 90
  "#198038", // Green 60
  "#002d9c", // Blue 80
  "#6929c4", // Purple 70
  "#b28600", // Yellow 50
  "#8a3800", // Orange 70
  "#78a9ff", // Blue 40
  "#009d9a", // Teal 50
  "#012749", // Cyan 90
];

// Dark-theme categorical palette
export const CHART_PALETTE_DARK = [
  "#d12771", // Magenta 60
  "#1192e8", // Cyan 50
  "#005d5d", // Teal 70
  "#9f1853", // Magenta 70
  "#fa4d56", // Red 50
  "#570408", // Red 90
  "#198038", // Green 60
  "#002d9c", // Blue 80
  "#6929c4", // Purple 70
  "#b28600", // Yellow 50
  "#8a3800", // Orange 70
  "#78a9ff", // Blue 40
  "#009d9a", // Teal 50
  "#012749", // Cyan 90
];

// Backward-compatible alias
export const CHART_PALETTE = CHART_PALETTE_LIGHT;

// Semantic status colors (green = good, yellow/blue = review, red = bad)
export const STATUS_COLORS = {
  Efficient: "#24a148", // Green 50 — high contrast
  Healthy: "#4589ff",   // Blue 40  — high contrast
  Critical: "#da1e28",  // Red 60   — high contrast
};

export const buildColorScale = (groups, isDark = false) => {
  const palette = isDark ? CHART_PALETTE_DARK : CHART_PALETTE_LIGHT;
  const scale = {};
  const unique = [...new Set(groups)];
  unique.forEach((name, i) => {
    scale[name] = palette[i % palette.length];
  });
  return scale;
};

export const getGroupValue = (asset, aggregateBy) => {
  switch (aggregateBy) {
    case "type":
      return asset.assetType || "Unknown";
    case "storageclass":
      return asset.storageClass || "Unspecified";
    case "providerID":
      return asset.providerID || asset.name || "Unknown";
    case "cluster":
    default:
      return asset.cluster || "Unknown";
  }
};
