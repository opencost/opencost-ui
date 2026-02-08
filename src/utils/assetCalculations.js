export const parseDays = (timeWindow) => parseInt(timeWindow) || 30;

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

export const getTotalProvisioned = (assets) => {
  if (!assets || assets.length === 0) return 0;
  const totalBytes = assets.reduce((sum, asset) => sum + (asset.bytes || 0), 0);
  return bytesToGB(totalBytes);
};

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

  if (idlePercent >= 80) {
    return { label: "WASTE", type: "red", severity: "high" };
  }
  if (idlePercent >= 40) {
    return { label: "REVIEW", type: "magenta", severity: "medium" };
  }
  return { label: "OK", type: "green", severity: "low" };
};

export const categorizeAssets = (assets) => {
  const nodeDisks = assets.filter(asset => asset.local === 1);
  const pvcs = assets.filter(asset => asset.local !== 1);
  return { nodeDisks, pvcs };
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

export const getTrendIndicator = (current, previous) => {
  if (previous === 0) return { direction: "→", percentage: 0, change: 0 };

  const change = current - previous;
  const percentage = parseFloat(((change / previous) * 100).toFixed(1));
  const direction = change > 0 ? "↑" : change < 0 ? "↓" : "→";

  return { direction, percentage, change };
};

export const sortAssets = (assets, column, direction = "ASC") => {
  const sorted = [...assets];

  sorted.sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "ASC" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal || "").toLowerCase();
    const bStr = String(bVal || "").toLowerCase();
    return direction === "ASC" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  return sorted;
};

// Light-theme categorical palette (14 colors) — leads with Magenta 50
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

// Dark-theme categorical palette — leads with Magenta 60 for dark contrast
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
  Healthy: "#4589ff",   // Blue 50  — high contrast
  Critical: "#da1e28",  // Red 60   — high contrast
};

// Build a dynamic color scale from group names using the theme-aware palette
export const buildColorScale = (groups, isDark = false) => {
  const palette = isDark ? CHART_PALETTE_DARK : CHART_PALETTE_LIGHT;
  const scale = {};
  const unique = [...new Set(groups)];
  unique.forEach((name, i) => {
    scale[name] = palette[i % palette.length];
  });
  return scale;
};
