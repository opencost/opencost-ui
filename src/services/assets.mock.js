// Mock data for assets when backend is unavailable
// Follows the structure from OpenCost /assets API

export function getMockAssetsData(aggregate = "type") {
    const baseAssets = [
        {
            name: "node-pool-1-worker-1",
            type: "Node",
            properties: { category: "Compute", provider: "AWS", cluster: "production" },
            start: "2024-01-18T00:00:00Z",
            end: "2024-01-25T00:00:00Z",
            minutes: 10080,
            totalCost: 245.67,
            adjustment: 0,
            cpuCost: 156.34,
            cpuCoreHours: 168,
            ramCost: 78.45,
            ramByteHours: 1344000000000,
            gpuCost: 0,
            gpuHours: 0,
        },
        {
            name: "node-pool-1-worker-2",
            type: "Node",
            properties: { category: "Compute", provider: "AWS", cluster: "production" },
            start: "2024-01-18T00:00:00Z",
            end: "2024-01-25T00:00:00Z",
            minutes: 10080,
            totalCost: 312.89,
            adjustment: 0,
            cpuCost: 198.56,
            cpuCoreHours: 336,
            ramCost: 102.33,
            ramByteHours: 2688000000000,
            gpuCost: 12.00,
            gpuHours: 24,
        },
        {
            name: "node-pool-2-gpu-1",
            type: "Node",
            properties: { category: "Compute", provider: "AWS", cluster: "production" },
            start: "2024-01-18T00:00:00Z",
            end: "2024-01-25T00:00:00Z",
            minutes: 10080,
            totalCost: 892.45,
            adjustment: 0,
            cpuCost: 234.12,
            cpuCoreHours: 672,
            ramCost: 156.78,
            ramByteHours: 5376000000000,
            gpuCost: 501.55,
            gpuHours: 168,
        },
        {
            name: "pvc-database-storage",
            type: "Disk",
            properties: { category: "Storage", provider: "AWS", cluster: "production", storageClass: "gp3" },
            start: "2024-01-18T00:00:00Z",
            end: "2024-01-25T00:00:00Z",
            minutes: 10080,
            totalCost: 45.23,
            adjustment: 0,
            cpuCost: 0,
            ramCost: 0,
            gpuCost: 0,
        },
        {
            name: "pvc-logs-storage",
            type: "Disk",
            properties: { category: "Storage", provider: "AWS", cluster: "production", storageClass: "gp2" },
            start: "2024-01-18T00:00:00Z",
            end: "2024-01-25T00:00:00Z",
            minutes: 10080,
            totalCost: 28.56,
            adjustment: 0,
            cpuCost: 0,
            ramCost: 0,
            gpuCost: 0,
        },
        {
            name: "ingress-nlb-prod",
            type: "LoadBalancer",
            properties: { category: "Network", provider: "AWS", cluster: "production" },
            start: "2024-01-18T00:00:00Z",
            end: "2024-01-25T00:00:00Z",
            minutes: 10080,
            totalCost: 67.89,
            adjustment: 0,
            cpuCost: 0,
            ramCost: 0,
            gpuCost: 0,
        },
        {
            name: "cluster-management",
            type: "ClusterManagement",
            properties: { category: "Management", provider: "AWS", cluster: "production" },
            start: "2024-01-18T00:00:00Z",
            end: "2024-01-25T00:00:00Z",
            minutes: 10080,
            totalCost: 73.50,
            adjustment: 0,
            cpuCost: 0,
            ramCost: 0,
            gpuCost: 0,
        },
        {
            name: "nat-gateway-prod",
            type: "Network",
            properties: { category: "Network", provider: "AWS", cluster: "production" },
            start: "2024-01-18T00:00:00Z",
            end: "2024-01-25T00:00:00Z",
            minutes: 10080,
            totalCost: 89.12,
            adjustment: 0,
            cpuCost: 0,
            ramCost: 0,
            gpuCost: 0,
        },
    ];

    // Aggregate data based on the aggregate parameter
    if (aggregate === "type") {
        const aggregated = {};
        baseAssets.forEach((asset) => {
            if (!aggregated[asset.type]) {
                aggregated[asset.type] = {
                    name: asset.type,
                    type: asset.type,
                    totalCost: 0,
                    cpuCost: 0,
                    ramCost: 0,
                    gpuCost: 0,
                    count: 0,
                };
            }
            aggregated[asset.type].totalCost += asset.totalCost;
            aggregated[asset.type].cpuCost += asset.cpuCost;
            aggregated[asset.type].ramCost += asset.ramCost;
            aggregated[asset.type].gpuCost += asset.gpuCost;
            aggregated[asset.type].count += 1;
        });
        return Object.values(aggregated);
    }

    return baseAssets;
}

export function getMockAssetsTotals() {
    const assets = getMockAssetsData("name");
    return {
        totalCost: assets.reduce((sum, a) => sum + a.totalCost, 0),
        cpuCost: assets.reduce((sum, a) => sum + a.cpuCost, 0),
        ramCost: assets.reduce((sum, a) => sum + a.ramCost, 0),
        gpuCost: assets.reduce((sum, a) => sum + a.gpuCost, 0),
        assetCount: assets.length,
    };
}
