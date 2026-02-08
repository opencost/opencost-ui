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
                "Cluster/Node/oc-demo-node-3": {
                    name: "oc-demo-node-3",
                    type: "Node",
                    totalCost: 155.00,
                    providerID: "i-0abc123456789def2",
                    labels: {
                        "topology.kubernetes.io/region": "us-west-2",
                        "node.kubernetes.io/instance-type": "c5.xlarge"
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
                "Cluster/Disk/vol-0123456789abcdef1": {
                    name: "vol-0123456789abcdef1",
                    type: "Disk",
                    totalCost: 12.50,
                    providerID: "vol-0123456789abcdef1",
                    labels: {
                        "kubernetes.io/cluster/demo": "owned"
                    }
                },
                "Cluster/Network/LoadBalancer-1": {
                    name: "LoadBalancer/frontend-lb",
                    type: "Network",
                    totalCost: 45.00,
                    providerID: "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/frontend/1",
                    labels: {
                        "service": "frontend"
                    }
                },
                "Cluster/Network/LoadBalancer-2": {
                    name: "LoadBalancer/backend-lb",
                    type: "Network",
                    totalCost: 35.00,
                    providerID: "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/backend/2",
                    labels: {
                        "service": "api"
                    }
                }
            }
        ]
    };
};
