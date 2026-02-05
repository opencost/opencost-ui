export const getMockAssets = (window) => {
    const assets = [
        {
            name: "node-1",
            type: "Node",
            cost: 12.5,
            totalCost: 15.0,
            properties: {
                cluster: "cluster-a",
                providerID: "i-0123456789abcdef0",
            },
        },
        {
            name: "node-2",
            type: "Node",
            cost: 10.0,
            totalCost: 12.0,
            properties: {
                cluster: "cluster-a",
                providerID: "i-0123456789abcdef1",
            },
        },
        {
            name: "volume-1",
            type: "Volume",
            cost: 5.0,
            totalCost: 5.0,
            properties: {
                cluster: "cluster-a",
                providerID: "vol-0123456789abcdef0",
            },
        },
        {
            name: "load-balancer-1",
            type: "LoadBalancer",
            cost: 2.5,
            totalCost: 2.5,
            properties: {
                cluster: "cluster-b",
                providerID: "elb-0123456789abcdef0",
            },
        },
        {
            name: "node-3",
            type: "Node",
            cost: 15.0,
            totalCost: 18.0,
            properties: {
                cluster: "cluster-b",
                providerID: "i-0123456789abcdef2",
            },
        },
    ];

    // If window is today or yesterday, return fewer items
    if (window === "today" || window === "yesterday") {
        return [
            {
                "node-1": assets[0],
                "node-2": assets[1],
            }
        ];
    }

    // Multiply costs for 7d/30d
    const multiplier = window === "30d" ? 30 : (window === "7d" ? 7 : 1);
    const result = {};
    assets.forEach(asset => {
        result[asset.name] = {
            ...asset,
            cost: asset.cost * multiplier,
            totalCost: asset.totalCost * multiplier,
        };
    });

    return [result];
};
