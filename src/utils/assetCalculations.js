import {
  magenta40, magenta50, magenta70,
  cyan30,    cyan40,    cyan50,    cyan90,
  teal30,    teal40,    teal50,    teal70,
  red40,     red50,     red60,     red90,
  green50,   green60,
  blue40,    blue50,    blue80,
  purple40,  purple70,
  yellow30,  yellow50,
  orange40,  orange70,
} from "@carbon/colors";

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
  if (!asset || !asset.breakdown) return 100;
  return parseFloat(((1 - (asset.breakdown.idle || 0)) * 100).toFixed(1));
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

// Categorical palette for light themes — Carbon Design System colors
export const CHART_PALETTE_LIGHT = [
  magenta50, // #ee5396
  cyan50,    // #1192e8
  teal70,    // #005d5d
  magenta70, // #9f1853
  red50,     // #fa4d56
  red90,     // #520408
  green60,   // #198038
  blue80,    // #002d9c
  purple70,  // #6929c4
  yellow50,  // #b28600
  orange70,  // #8a3800
  blue40,    // #78a9ff
  teal50,    // #009d9a
  cyan90,    // #012749
];

// Categorical palette for dark themes — higher luminosity for dark backgrounds
export const CHART_PALETTE_DARK = [
  magenta40, // #ff7eb6
  cyan40,    // #33b1ff
  teal40,    // #08bdba
  magenta50, // #ee5396
  red40,     // #ff8389
  red50,     // #fa4d56
  green50,   // #24a148
  blue40,    // #78a9ff
  purple40,  // #be95ff
  yellow30,  // #f1c21b
  orange40,  // #ff832b
  cyan30,    // #82cfff
  teal30,    // #3ddbd9
  blue50,    // #4589ff
];

// Status colors for chart/SVG use — hex required by D3, sourced from @carbon/colors
export const STATUS_COLORS = {
  Efficient: green60, // #198038 — Carbon Green 60, support-success
  Healthy: blue50,    // #4589ff — Carbon Blue 50
  Critical: red60,    // #da1e28 — Carbon Red 60, support-error
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
