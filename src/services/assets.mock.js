export const getMockAssetsData = () => {
    return {
        data: [
            {
                "Cluster/Node/oc-demo-node-1": {
                    name: "oc-demo-node-1",
                    type: "Node",
                    totalCost: 125.50,
                    providerID: "i-0abc123456789def0",
                    labels: {
                        "topology.kubernetes.io/region": "us-east-1",
                        "node.kubernetes.io/instance-type": "m5.large"
                    }
                },
                "Cluster/Node/oc-demo-node-2": {
                    name: "oc-demo-node-2",
                    type: "Node",
                    totalCost: 110.20,
                    providerID: "i-0abc123456789def1",
                    labels: {
                        "topology.kubernetes.io/region": "us-east-1",
                        "node.kubernetes.io/instance-type": "m5.large"
                    }
                },
                "Cluster/Disk/vol-0123456789abcdef0": {
                    name: "vol-0123456789abcdef0",
                    type: "Disk",
                    totalCost: 15.00,
                    providerID: "vol-0123456789abcdef0",
                    labels: {
                        "kubernetes.io/cluster/demo": "owned"
                    }
                },
                "Cluster/Network/LoadBalancer": {
                    name: "LoadBalancer/demo-service",
                    type: "Network",
                    totalCost: 45.00,
                    providerID: "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/demo-service/12345",
                    labels: {
                        "service": "frontend"
                    }
                }
            }
        ]
    };
};
