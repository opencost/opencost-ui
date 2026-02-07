
const generateMockAssets = (window, aggregate) => {
    const assets = {
        // Node Assets
        "node/gke-cluster-1-default-pool-a123": {
            type: "node",
            properties: {
                category: "Compute",
                service: "Kubernetes Node",
                name: "gke-cluster-1-default-pool-a123",
                providerID: "gke-cluster-1-default-pool-a123",
                cluster: "cluster-1",
            },
            start: "2023-10-01T00:00:00Z",
            end: "2023-10-02T00:00:00Z",
            minutes: 1440.0,
            cpuCores: 4.0,
            ramBytes: 16 * 1024 * 1024 * 1024,
            cpuCost: 12.50,
            ramCost: 6.20,
            gpuCost: 0.0,
            pvCost: 0.0,
            networkCost: 0.0,
            adjustment: 0.0,
            totalCost: 18.70,
        },
        "node/gke-cluster-1-default-pool-b456": {
            type: "node",
            properties: {
                category: "Compute",
                service: "Kubernetes Node",
                name: "gke-cluster-1-default-pool-b456",
                providerID: "gke-cluster-1-default-pool-b456",
                cluster: "cluster-1",
            },
            start: "2023-10-01T00:00:00Z",
            end: "2023-10-02T00:00:00Z",
            minutes: 1440.0,
            cpuCores: 8.0,
            ramBytes: 32 * 1024 * 1024 * 1024,
            cpuCost: 24.00,
            ramCost: 12.00,
            gpuCost: 0.0,
            pvCost: 0.0,
            networkCost: 0.0,
            adjustment: 0.0,
            totalCost: 36.00,
        },

        // Disk Assets
        "disk/pvc-7890-abcd-efgh": {
            type: "disk",
            properties: {
                category: "Storage",
                service: "Persistent Disk",
                name: "pvc-7890-abcd-efgh",
                providerID: "vol-0a1b2c3d4e5f",
                cluster: "cluster-1",
            },
            start: "2023-10-01T00:00:00Z",
            end: "2023-10-02T00:00:00Z",
            minutes: 1440.0,
            cpuCores: 0.0,
            ramBytes: 0.0,
            cpuCost: 0.0,
            ramCost: 0.0,
            gpuCost: 0.0,
            pvCost: 5.50,
            networkCost: 0.0,
            adjustment: 0.0,
            totalCost: 5.50,
        },
        "disk/pvc-1234-ijkl-mnop": {
            type: "disk",
            properties: {
                category: "Storage",
                service: "Persistent Disk",
                name: "pvc-1234-ijkl-mnop",
                providerID: "vol-9z8y7x6w5v4u",
                cluster: "cluster-1",
            },
            start: "2023-10-01T00:00:00Z",
            end: "2023-10-02T00:00:00Z",
            minutes: 1440.0,
            cpuCores: 0.0,
            ramBytes: 0.0,
            cpuCost: 0.0,
            ramCost: 0.0,
            gpuCost: 0.0,
            pvCost: 2.75,
            networkCost: 0.0,
            adjustment: 0.0,
            totalCost: 2.75,
        },

        // Network Assets
        "network/nat-gateway-1": {
            type: "network",
            properties: {
                category: "Network",
                service: "NAT Gateway",
                name: "nat-gateway-1",
                providerID: "nat-0a1b2c3d",
                cluster: "cluster-1",
            },
            start: "2023-10-01T00:00:00Z",
            end: "2023-10-02T00:00:00Z",
            minutes: 1440.0,
            cpuCores: 0.0,
            ramBytes: 0.0,
            cpuCost: 0.0,
            ramCost: 0.0,
            gpuCost: 0.0,
            pvCost: 0.0,
            networkCost: 15.00,
            adjustment: 0.0,
            totalCost: 15.00,
        },

        // Load Balancer Assets
        "loadbalancer/lb-service-web": {
            type: "loadbalancer",
            properties: {
                category: "Network",
                service: "Load Balancer",
                name: "lb-service-web",
                providerID: "lb-2e3d4f5g",
                cluster: "cluster-1",
            },
            start: "2023-10-01T00:00:00Z",
            end: "2023-10-02T00:00:00Z",
            minutes: 1440.0,
            cpuCores: 0.0,
            ramBytes: 0.0,
            cpuCost: 0.0,
            ramCost: 0.0,
            gpuCost: 0.0,
            pvCost: 0.0,
            networkCost: 18.25,
            adjustment: 0.0,
            totalCost: 18.25,
        },

        // Bucket Assets
        "bucket/backup-bucket-logs": {
            type: "bucket",
            properties: {
                category: "Storage",
                service: "S3 Bucket",
                name: "backup-bucket-logs",
                providerID: "s3://backup-bucket-logs",
                cluster: "cluster-1",
            },
            start: "2023-10-01T00:00:00Z",
            end: "2023-10-02T00:00:00Z",
            minutes: 1440.0,
            cpuCores: 0.0,
            ramBytes: 0.0,
            cpuCost: 0.0,
            ramCost: 0.0,
            gpuCost: 0.0,
            pvCost: 1.20,
            networkCost: 0.0,
            adjustment: 0.0,
            totalCost: 1.20,
        },

        // Cluster Management
        "cluster-management/eks-control-plane": {
            type: "cluster-management",
            properties: {
                category: "Management",
                service: "EKS Control Plane",
                name: "eks-control-plane",
                providerID: "eks-cluster-1",
                cluster: "cluster-1",
            },
            start: "2023-10-01T00:00:00Z",
            end: "2023-10-02T00:00:00Z",
            minutes: 1440.0,
            cpuCores: 0.0,
            ramBytes: 0.0,
            cpuCost: 0.0,
            ramCost: 0.0,
            gpuCost: 0.0,
            pvCost: 0.0,
            networkCost: 0.0,
            adjustment: 0.0,
            totalCost: 2.40,
        }
    };

    return {
        code: 200,
        data: assets,
    };
};

export const getMockAssets = (window, aggregate) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(generateMockAssets(window, aggregate));
        }, 500); // Simulate network delay
    });
};
