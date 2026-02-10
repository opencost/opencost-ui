export function parseAssetsResponse(response) {
  return Object.entries(response.data)
    .filter(([_, asset]) => {
      return asset.totalCost !== undefined && asset.type !== undefined;
    })
    .map(([key, asset]) => {
      const hasComputeMetrics = asset.cpuBreakdown !== undefined && asset.ramBreakdown !== undefined;
      const cpuUtilization = hasComputeMetrics ? Math.round((1 - asset.cpuBreakdown.idle) * 100) : 0;
      const ramUtilization = hasComputeMetrics ? Math.round((1 - asset.ramBreakdown.idle) * 100) : 0;
      
      const carbonEmissions = asset.totalCost * 0.5;

      const region = asset.labels 
        ? (asset.labels.topology_kubernetes_io_region || 
           asset.labels.failure_domain_beta_kubernetes_io_region || 
           'unknown')
        : 'unknown';

      return {
        id: key,
        name: asset.properties?.name || asset.type,
        type: asset.type,
        provider: asset.properties?.provider || 'Unknown',
        cluster: asset.properties?.cluster || 'Unknown',
        region,
        category: asset.properties?.category || 'Unknown',
        cpuCores: asset.cpuCores || 0,
        ramBytes: asset.ramBytes || 0,
        cpuCoreHours: asset.cpuCoreHours || 0,
        cpuCost: asset.cpuCost || 0,
        ramCost: asset.ramCost || 0,
        totalCost: asset.totalCost,
        cpuUtilization,
        ramUtilization,
        carbonEmissions,
        preemptible: asset.preemptible === 1,
        lastModified: new Date(asset.end).toISOString().split('T')[0],
        // Additional fields for storage assets
        bytes: asset.bytes,
        storageClass: asset.storageClass,
        // Additional fields for network assets
        ip: asset.ip,
      };
    });
}

export async function fetchAssets(endpoint) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }
    const data = await response.json();
    return parseAssetsResponse(data);
  } catch (error) {
    console.log('Error fetching assets:', error);
    return [];
  }
}
