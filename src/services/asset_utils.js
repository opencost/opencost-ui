export function calculateMetrics(assets) {
  const totalCost = assets.reduce((sum, a) => sum + a.totalCost, 0);
  const totalAdjustment = assets.reduce((sum, a) => sum + (a.adjustment || 0), 0);
  
  let wastedCost = 0;
  let totalUtilizedCost = 0;
  
  assets.forEach(asset => {
    if (asset.cpuBreakdown?.idle) {
      const cpuWaste = asset.cpuCost * asset.cpuBreakdown.idle;
      const ramWaste = asset.ramCost * (asset.ramBreakdown?.idle || 0);
      wastedCost += cpuWaste + ramWaste;
      totalUtilizedCost += asset.cpuCost + asset.ramCost;
    } else if (asset.breakdown?.idle) {
      wastedCost += asset.totalCost * asset.breakdown.idle;
      totalUtilizedCost += asset.totalCost;
    }
  });
  
  const efficiency = totalUtilizedCost > 0 
    ? ((totalUtilizedCost - wastedCost) / totalUtilizedCost) * 100 
    : 100;

  return {
    totalCost,
    totalAdjustment,
    wastedCost,
    efficiency,
    assetCount: assets.length
  };
}

export function categorizeAssets(assets) {
  const categories = {};
  
  assets.forEach(asset => {
    const category = asset.properties?.category || "Other";
    categories[category] = (categories[category] || 0) + asset.totalCost;
  });
  
  return categories;
}

export function calculateIdlePercent(asset) {
  if (asset.cpuBreakdown?.idle) {
    return asset.cpuBreakdown.idle * 100;
  }
  if (asset.ramBreakdown?.idle) {
    return asset.ramBreakdown.idle * 100;
  }
  if (asset.breakdown?.idle) {
    return asset.breakdown.idle * 100;
  }
  return null;
}

export function generateWastageAlerts(assets) {
  const alerts = [];

  assets.forEach(asset => {
    const idlePercent = calculateIdlePercent(asset);
    
    if (idlePercent !== null && idlePercent >= 70) {
      const wastedCost = (asset.totalCost * idlePercent) / 100;
      alerts.push({
        severity: idlePercent >= 85 ? "error" : "warning",
        title: `${asset.type} is ${idlePercent.toFixed(0)}% idle`,
        message: `Consider rightsizing to save ~$${wastedCost.toFixed(2)}/week`,
        savings: wastedCost
      });
    }
  });

  return alerts;
}