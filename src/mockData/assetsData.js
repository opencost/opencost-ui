// Mock data for OpenCost Assets page
// Realistic Kubernetes/cloud infrastructure data

export const mockAssetsData = {
  code: 200,
  data: [
    // NODES - AWS
    {
      type: "node",
      name: "node-pool-1-abc123",
      cluster: "production-cluster",
      provider: "AWS",
      providerID: "aws:///us-east-1a/i-1234567890abcdef",
      category: "compute",
      efficiency: 78,
      properties: {
        cpu: 4,
        ram: 16,
        gpu: 0,
        instanceType: "m5.xlarge",
        region: "us-east-1"
      },
      labels: {
        "kubernetes.io/role": "worker",
        "node.kubernetes.io/instance-type": "m5.xlarge",
        "topology.kubernetes.io/zone": "us-east-1a"
      },
      cost: {
        totalCost: 245.76,
        cpuCost: 147.46,
        ramCost: 98.30,
        gpuCost: 0
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "node",
      name: "node-pool-2-def456",
      cluster: "production-cluster",
      provider: "AWS",
      providerID: "aws:///us-east-1b/i-0987654321fedcba",
      category: "compute",
      efficiency: 85,
      properties: {
        cpu: 8,
        ram: 32,
        gpu: 1,
        instanceType: "p3.2xlarge",
        region: "us-east-1"
      },
      labels: {
        "kubernetes.io/role": "gpu-worker",
        "node.kubernetes.io/instance-type": "p3.2xlarge",
        "topology.kubernetes.io/zone": "us-east-1b"
      },
      cost: {
        totalCost: 892.40,
        cpuCost: 294.72,
        ramCost: 196.48,
        gpuCost: 401.20
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    // NODES - GCP
    {
      type: "node",
      name: "gke-cluster-pool-1-xyz789",
      cluster: "staging-cluster",
      provider: "GCP",
      providerID: "gce:///us-central1-a/gke-node-abc123",
      category: "compute",
      efficiency: 72,
      properties: {
        cpu: 4,
        ram: 16,
        gpu: 0,
        instanceType: "n2-standard-4",
        region: "us-central1"
      },
      labels: {
        "cloud.google.com/gke-nodepool": "default-pool",
        "topology.kubernetes.io/zone": "us-central1-a"
      },
      cost: {
        totalCost: 198.50,
        cpuCost: 119.10,
        ramCost: 79.40,
        gpuCost: 0
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    // NODES - Azure
    {
      type: "node",
      name: "aks-nodepool1-12345678-vmss000000",
      cluster: "dev-cluster",
      provider: "Azure",
      providerID: "azure:///subscriptions/xxx/resourceGroups/rg/providers/Microsoft.Compute/virtualMachineScaleSets/aks",
      category: "compute",
      efficiency: 65,
      properties: {
        cpu: 2,
        ram: 8,
        gpu: 0,
        instanceType: "Standard_D2s_v3",
        region: "eastus"
      },
      labels: {
        "kubernetes.azure.com/cluster": "dev-cluster",
        "agentpool": "nodepool1"
      },
      cost: {
        totalCost: 125.30,
        cpuCost: 75.18,
        ramCost: 50.12,
        gpuCost: 0
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    // DISKS
    {
      type: "disk",
      name: "pvc-disk-vol-1",
      cluster: "production-cluster",
      provider: "AWS",
      providerID: "aws:///us-east-1a/vol-abc123xyz",
      category: "storage",
      efficiency: 45,
      properties: {
        storageClass: "gp3",
        sizeGB: 100,
        region: "us-east-1",
        iops: 3000
      },
      labels: {
        "kubernetes.io/created-for/pvc/name": "data-pvc",
        "kubernetes.io/created-for/pvc/namespace": "default"
      },
      cost: {
        totalCost: 10.00
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "disk",
      name: "pvc-disk-vol-2",
      cluster: "production-cluster",
      provider: "AWS",
      providerID: "aws:///us-east-1b/vol-def456abc",
      category: "storage",
      efficiency: 62,
      properties: {
        storageClass: "gp3",
        sizeGB: 250,
        region: "us-east-1",
        iops: 6000
      },
      labels: {
        "kubernetes.io/created-for/pvc/name": "logs-pvc",
        "kubernetes.io/created-for/pvc/namespace": "monitoring"
      },
      cost: {
        totalCost: 25.00
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "disk",
      name: "gce-pd-prometheus-data",
      cluster: "staging-cluster",
      provider: "GCP",
      providerID: "gce:///us-central1-a/disk-prometheus",
      category: "storage",
      efficiency: 88,
      properties: {
        storageClass: "pd-ssd",
        sizeGB: 500,
        region: "us-central1"
      },
      labels: {
        "app": "prometheus",
        "team": "platform"
      },
      cost: {
        totalCost: 85.00
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    // PERSISTENT VOLUMES
    {
      type: "persistentVolume",
      name: "pv-data-store-1",
      cluster: "production-cluster",
      provider: "AWS",
      category: "storage",
      efficiency: 70,
      properties: {
        storageClass: "standard",
        sizeGB: 500,
        region: "us-east-1",
        accessMode: "ReadWriteOnce"
      },
      labels: {
        "app": "database",
        "tier": "backend"
      },
      cost: {
        totalCost: 45.00
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "persistentVolume",
      name: "pv-redis-cache",
      cluster: "production-cluster",
      provider: "AWS",
      category: "storage",
      efficiency: 92,
      properties: {
        storageClass: "gp3",
        sizeGB: 50,
        region: "us-east-1",
        accessMode: "ReadWriteOnce"
      },
      labels: {
        "app": "redis",
        "tier": "cache"
      },
      cost: {
        totalCost: 5.00
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "persistentVolume",
      name: "pv-elasticsearch-data",
      cluster: "staging-cluster",
      provider: "GCP",
      category: "storage",
      efficiency: 55,
      properties: {
        storageClass: "pd-ssd",
        sizeGB: 1000,
        region: "us-central1",
        accessMode: "ReadWriteOnce"
      },
      labels: {
        "app": "elasticsearch",
        "env": "staging"
      },
      cost: {
        totalCost: 170.00
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    // LOAD BALANCERS
    {
      type: "loadBalancer",
      name: "lb-frontend-public",
      cluster: "production-cluster",
      provider: "AWS",
      category: "network",
      efficiency: 82,
      properties: {
        region: "us-east-1",
        lbType: "application",
        scheme: "internet-facing"
      },
      labels: {
        "service": "frontend",
        "env": "production"
      },
      cost: {
        totalCost: 22.68
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "loadBalancer",
      name: "lb-api-gateway",
      cluster: "production-cluster",
      provider: "AWS",
      category: "network",
      efficiency: 90,
      properties: {
        region: "us-east-1",
        lbType: "network",
        scheme: "internet-facing"
      },
      labels: {
        "service": "api",
        "env": "production"
      },
      cost: {
        totalCost: 35.50
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "loadBalancer",
      name: "lb-gcp-ingress",
      cluster: "staging-cluster",
      provider: "GCP",
      category: "network",
      efficiency: 75,
      properties: {
        region: "us-central1",
        lbType: "http",
        scheme: "external"
      },
      labels: {
        "service": "ingress",
        "env": "staging"
      },
      cost: {
        totalCost: 18.25
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    // NETWORK
    {
      type: "network",
      name: "vpc-production-main",
      cluster: "production-cluster",
      provider: "AWS",
      category: "network",
      efficiency: 95,
      properties: {
        region: "us-east-1",
        cidr: "10.0.0.0/16",
        subnetCount: 6
      },
      labels: {
        "env": "production",
        "managed-by": "terraform"
      },
      cost: {
        totalCost: 45.00,
        dataCost: 32.00,
        natCost: 13.00
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "network",
      name: "vpc-staging-network",
      cluster: "staging-cluster",
      provider: "GCP",
      category: "network",
      efficiency: 80,
      properties: {
        region: "us-central1",
        cidr: "10.1.0.0/16",
        subnetCount: 3
      },
      labels: {
        "env": "staging",
        "managed-by": "pulumi"
      },
      cost: {
        totalCost: 28.00,
        dataCost: 20.00,
        natCost: 8.00
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    // CLUSTER
    {
      type: "cluster",
      name: "production-cluster",
      cluster: "production-cluster",
      provider: "AWS",
      category: "management",
      efficiency: 88,
      properties: {
        region: "us-east-1",
        k8sVersion: "1.28",
        nodeCount: 12
      },
      labels: {
        "env": "production",
        "team": "platform"
      },
      cost: {
        totalCost: 73.00,
        controlPlaneCost: 73.00
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "cluster",
      name: "staging-cluster",
      cluster: "staging-cluster",
      provider: "GCP",
      category: "management",
      efficiency: 70,
      properties: {
        region: "us-central1",
        k8sVersion: "1.27",
        nodeCount: 5
      },
      labels: {
        "env": "staging",
        "team": "platform"
      },
      cost: {
        totalCost: 0, // GKE autopilot free tier
        controlPlaneCost: 0
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    },
    {
      type: "cluster",
      name: "dev-cluster",
      cluster: "dev-cluster",
      provider: "Azure",
      category: "management",
      efficiency: 60,
      properties: {
        region: "eastus",
        k8sVersion: "1.28",
        nodeCount: 3
      },
      labels: {
        "env": "development",
        "team": "engineering"
      },
      cost: {
        totalCost: 0, // AKS free tier
        controlPlaneCost: 0
      },
      window: {
        start: "2026-01-27T00:00:00Z",
        end: "2026-02-03T00:00:00Z"
      }
    }
  ]
};

// Cost trend data for area/line charts (last 7 days)
export const costTrendData = [
  { date: "Jan 28", Node: 1350, Disk: 95, PersistentVolume: 180, LoadBalancer: 65, Network: 60, Cluster: 65 },
  { date: "Jan 29", Node: 1420, Disk: 100, PersistentVolume: 185, LoadBalancer: 68, Network: 62, Cluster: 68 },
  { date: "Jan 30", Node: 1380, Disk: 98, PersistentVolume: 190, LoadBalancer: 70, Network: 65, Cluster: 70 },
  { date: "Jan 31", Node: 1450, Disk: 105, PersistentVolume: 195, LoadBalancer: 72, Network: 68, Cluster: 72 },
  { date: "Feb 01", Node: 1520, Disk: 112, PersistentVolume: 205, LoadBalancer: 75, Network: 70, Cluster: 73 },
  { date: "Feb 02", Node: 1480, Disk: 115, PersistentVolume: 210, LoadBalancer: 74, Network: 71, Cluster: 73 },
  { date: "Feb 03", Node: 1462, Disk: 120, PersistentVolume: 220, LoadBalancer: 76, Network: 73, Cluster: 73 }
];

// Asset type config for cards
export const assetTypeConfig = [
  { type: 'node', label: 'Compute Nodes', icon: '💻', color: 'blue' },
  { type: 'disk', label: 'Disks', icon: '💿', color: 'purple' },
  { type: 'persistentVolume', label: 'Persistent Volumes', icon: '💾', color: 'magenta' },
  { type: 'loadBalancer', label: 'Load Balancers', icon: '🌐', color: 'teal' },
  { type: 'network', label: 'Networks', icon: '🔗', color: 'cyan' },
  { type: 'cluster', label: 'Clusters', icon: '☸️', color: 'green' }
];