/**
 * Mock data for Assets API
 * Mirrors the /model/assets response structure for development
 */

const mockAssetsData = [
  {
    "cluster1/node1": {
      type: "Node",
      properties: {
        name: "node1",
        cluster: "cluster1",
        providerID: "aws:///us-east-1a/i-0abc123def456789",
        nodeType: "m5.xlarge",
      },
      labels: {
        owner: "platform-team",
        team: "infrastructure",
        env: "production",
        "kubernetes.io/arch": "amd64",
      },
      name: "node1",
      providerID: "aws:///us-east-1a/i-0abc123def456789",
      start: "2026-01-29T00:00:00Z",
      end: "2026-02-05T00:00:00Z",
      minutes: 10080,
      cpuCores: 4,
      ramBytes: 17179869184,
      cpuCost: 24.5,
      ramCost: 12.3,
      gpuCost: 0,
      totalCost: 36.8,
      adjustment: 0,
      preemptible: false,
    },
    "cluster1/node2": {
      type: "Node",
      properties: {
        name: "node2",
        cluster: "cluster1",
        providerID: "aws:///us-east-1b/i-0def456789abc123",
        nodeType: "m5.2xlarge",
      },
      labels: {
        owner: "app-team",
        team: "backend",
        env: "production",
        "kubernetes.io/arch": "amd64",
      },
      name: "node2",
      providerID: "aws:///us-east-1b/i-0def456789abc123",
      start: "2026-01-29T00:00:00Z",
      end: "2026-02-05T00:00:00Z",
      minutes: 10080,
      cpuCores: 8,
      ramBytes: 34359738368,
      cpuCost: 48.2,
      ramCost: 24.6,
      gpuCost: 0,
      totalCost: 72.8,
      adjustment: 0,
      preemptible: true,
    },
    "cluster1/disk1": {
      type: "Disk",
      properties: {
        name: "pvc-abc123",
        cluster: "cluster1",
        providerID: "aws:///us-east-1a/vol-0abc123def",
        storageClass: "gp3",
      },
      labels: {
        owner: "data-team",
        team: "analytics",
        env: "production",
      },
      name: "pvc-abc123",
      providerID: "aws:///us-east-1a/vol-0abc123def",
      start: "2026-01-29T00:00:00Z",
      end: "2026-02-05T00:00:00Z",
      minutes: 10080,
      bytes: 107374182400,
      totalCost: 8.5,
      adjustment: 0,
    },
    "cluster1/network": {
      type: "Network",
      properties: {
        name: "cluster1-network",
        cluster: "cluster1",
        providerID: "aws:///us-east-1/vpc-0abc123",
      },
      labels: {
        owner: "network-team",
        env: "production",
      },
      name: "cluster1-network",
      providerID: "aws:///us-east-1/vpc-0abc123",
      start: "2026-01-29T00:00:00Z",
      end: "2026-02-05T00:00:00Z",
      minutes: 10080,
      totalCost: 15.2,
      adjustment: 0,
    },
    "cluster1/lb1": {
      type: "LoadBalancer",
      properties: {
        name: "api-gateway-lb",
        cluster: "cluster1",
        providerID: "aws:///us-east-1/arn:aws:elasticloadbalancing:...",
      },
      labels: {
        owner: "platform-team",
        service: "api-gateway",
        env: "production",
      },
      name: "api-gateway-lb",
      providerID: "aws:///us-east-1/arn:aws:elasticloadbalancing:...",
      start: "2026-01-29T00:00:00Z",
      end: "2026-02-05T00:00:00Z",
      minutes: 10080,
      totalCost: 25.0,
      adjustment: 0,
    },
    "cluster2/gpu-node1": {
      type: "Node",
      properties: {
        name: "gpu-node1",
        cluster: "cluster2",
        providerID: "aws:///us-west-2a/i-0gpu789abc123",
        nodeType: "p3.2xlarge",
      },
      labels: {
        owner: "ml-team",
        team: "machine-learning",
        env: "production",
        "node.kubernetes.io/instance-type": "p3.2xlarge",
      },
      name: "gpu-node1",
      providerID: "aws:///us-west-2a/i-0gpu789abc123",
      start: "2026-01-29T00:00:00Z",
      end: "2026-02-05T00:00:00Z",
      minutes: 10080,
      cpuCores: 8,
      ramBytes: 68719476736,
      gpuCount: 1,
      cpuCost: 35.0,
      ramCost: 28.5,
      gpuCost: 145.0,
      totalCost: 208.5,
      adjustment: 0,
      preemptible: true,
    },
  },
];

/**
 * Get mock assets data
 * @param {string} window - Time window
 * @param {string} aggregate - Aggregation type
 * @param {boolean} accumulate - Whether to accumulate
 * @returns {Object} Mock data response
 */
export function getMockAssetsData(window = "7d", aggregate = "type", accumulate = true) {
  // For simplicity, return the same mock data regardless of parameters
  // In a real implementation, you would transform the data based on aggregation
  return {
    code: 200,
    status: "success",
    data: mockAssetsData,
  };
}

export { mockAssetsData };
