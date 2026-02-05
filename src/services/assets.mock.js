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

    // Determine how many items to return
    const sliceCount = (window === "today" || window === "yesterday") ? 2 : assets.length;
    const multiplier = window === "30d" ? 30 : (window === "7d" ? 7 : 1);

    const result = {};
    assets.slice(0, sliceCount).forEach(asset => {
        result[asset.name] = {
            ...asset,
            cost: asset.cost * multiplier,
            totalCost: asset.totalCost * multiplier,
        };
    });

    return [result];
};
