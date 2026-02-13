export const mockAssets = [
  {
    id: "asset-1",
    name: "node-us-east-1a",
    type: "Node",
    cluster: "prod-cluster",
    totalCost: 125.40,
    cpuCost: 80.00,
    ramCost: 45.40,
    providerId: "i-0abcd1234efgh5678",
    category: "Compute"
  },
  {
    id: "asset-2",
    name: "pvc-db-storage",
    type: "Storage",
    cluster: "prod-cluster",
    totalCost: 85.00,
    cpuCost: 0,
    ramCost: 0,
    providerId: "vol-099887766",
    category: "Storage"
  },
  {
    id: "asset-3",
    name: "s3-backup-bucket",
    type: "ObjectStorage",
    cluster: "global",
    totalCost: 12.50,
    cpuCost: 0,
    ramCost: 0,
    providerId: "arn:aws:s3:::backup",
    category: "Storage"
  },
  {
    id: "asset-4",
    name: "node-us-west-2b",
    type: "Node",
    cluster: "staging",
    totalCost: 95.20,
    cpuCost: 60.00,
    ramCost: 35.20,
    providerId: "i-09988aabb",
    category: "Compute"
  },
  {
    id: "asset-5",
    name: "load-balancer-front",
    type: "Network",
    cluster: "prod-cluster",
    totalCost: 45.00,
    cpuCost: 0,
    ramCost: 0,
    providerId: "elb-12345",
    category: "Network"
  },
  {
    id: "asset-6",
    name: "redis-cache-node",
    type: "Node",
    cluster: "prod-cluster",
    totalCost: 55.00,
    cpuCost: 30.00,
    ramCost: 25.00,
    providerId: "i-987654321",
    category: "Compute"
  },
  {
    id: "asset-7",
    name: "mongodb-pvc",
    type: "Storage",
    cluster: "prod-cluster",
    totalCost: 200.00,
    cpuCost: 0,
    ramCost: 0,
    providerId: "vol-777888",
    category: "Storage"
  },
  {
    id: "asset-8",
    name: "eks-control-plane",
    type: "Management",
    cluster: "prod-cluster",
    totalCost: 72.00,
    cpuCost: 0,
    ramCost: 0,
    providerId: "eks-cp-id",
    category: "Management"
  },
  {
    id: "asset-9",
    name: "lambda-image-proc",
    type: "Serverless",
    cluster: "n/a",
    totalCost: 5.40,
    cpuCost: 4.00,
    ramCost: 1.40,
    providerId: "arn:aws:lambda:...",
    category: "Compute"
  },
  {
    id: "asset-10",
    name: "cloudwatch-logs",
    type: "Monitoring",
    cluster: "global",
    totalCost: 32.10,
    cpuCost: 0,
    ramCost: 0,
    providerId: "cw-logs",
    category: "Observability"
  },
  {
    id: "asset-11",
    name: "nat-gateway",
    type: "Network",
    cluster: "prod-cluster",
    totalCost: 28.00,
    cpuCost: 0,
    ramCost: 0,
    providerId: "nat-0987",
    category: "Network"
  }
];
