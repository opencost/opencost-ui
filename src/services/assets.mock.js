export const getMockAssets = (type) => {
    const mockNodes = [
        {
            name: "gke-cluster-1-pool-1-node-1",
            type: "Node",
            providerID: "gce://gke-cluster-1-pool-1-node-1",
            properties: {
                provider: "GCP",
                region: "us-central1",
                instanceType: "e2-standard-4",
            },
            cost: {
                total: 15.50,
                cpu: 10.00,
                ram: 5.00,
                gpu: 0.00,
                storage: 0.50,
            },
            usage: {
                cpu: 0.65,
                ram: 0.80,
            }
        },
        {
            name: "gke-cluster-1-pool-1-node-2",
            type: "Node",
            providerID: "gce://gke-cluster-1-pool-1-node-2",
            properties: {
                provider: "GCP",
                region: "us-central1",
                instanceType: "e2-standard-4",
            },
            cost: {
                total: 15.50,
                cpu: 10.00,
                ram: 5.00,
                gpu: 0.00,
                storage: 0.50,
            },
            usage: {
                cpu: 0.45,
                ram: 0.60,
            }
        }
    ];

    const mockDisks = [
        {
            name: "pvc-1234-5678",
            type: "Disk",
            properties: {
                provider: "GCP",
                storageClass: "standard",
                size: "100Gi"
            },
            cost: {
                total: 2.50
            }
        }
    ];

    if (type === "node") return { data: mockNodes };
    if (type === "disk") return { data: mockDisks };

    // Default return both or all
    return { data: [...mockNodes, ...mockDisks] };
};
