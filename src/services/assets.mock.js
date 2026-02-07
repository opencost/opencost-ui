/**
 * Mock data for Assets API - for development/testing without backend
 * 15 assets across GCP and AWS providers
 */

export function getMockAssetsData() {
  return {
    code: 200,
    data: {
      "node-prod-1": {
        type: "Node",
        name: "node-prod-1",
        properties: {
          provider: "AWS",
          cluster: "production",
          category: "Compute",
          region: "us-east-1",
          instanceType: "m5.xlarge",
        },
        labels: {
          environment: "production",
          team: "platform",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 156.48,
        adjustment: 0,
        cpuCores: 4,
        ramBytes: 16106127360,
        cpuCost: 89.76,
        ramCost: 66.72,
        cpuBreakdown: {
          idle: 35.90,
          used: 44.88,
          system: 8.98,
        },
        ramBreakdown: {
          idle: 26.69,
          used: 33.36,
          system: 6.67,
        },
      },
      "node-prod-2": {
        type: "Node",
        name: "node-prod-2",
        properties: {
          provider: "AWS",
          cluster: "production",
          category: "Compute",
          region: "us-east-1",
          instanceType: "m5.2xlarge",
        },
        labels: {
          environment: "production",
          team: "platform",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 312.96,
        adjustment: 0,
        cpuCores: 8,
        ramBytes: 32212254720,
        cpuCost: 179.52,
        ramCost: 133.44,
        cpuBreakdown: {
          idle: 53.86,
          used: 107.71,
          system: 17.95,
        },
        ramBreakdown: {
          idle: 40.03,
          used: 80.06,
          system: 13.35,
        },
      },
      "node-gcp-1": {
        type: "Node",
        name: "gke-node-1",
        properties: {
          provider: "GCP",
          cluster: "production",
          category: "Compute",
          region: "us-central1",
          instanceType: "n2-standard-4",
        },
        labels: {
          environment: "production",
          team: "data",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 142.24,
        adjustment: 0,
        cpuCores: 4,
        ramBytes: 16106127360,
        cpuCost: 81.52,
        ramCost: 60.72,
      },
      "node-staging-1": {
        type: "Node",
        name: "node-staging-1",
        properties: {
          provider: "AWS",
          cluster: "staging",
          category: "Compute",
          region: "us-west-2",
          instanceType: "t3.large",
        },
        labels: {
          environment: "staging",
          team: "engineering",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 62.72,
        adjustment: 0,
        cpuCores: 2,
        ramBytes: 8053063680,
        cpuCost: 35.84,
        ramCost: 26.88,
      },
      "disk-prod-1": {
        type: "Disk",
        name: "pvc-postgres-prod",
        properties: {
          provider: "AWS",
          cluster: "production",
          category: "Storage",
          region: "us-east-1",
          storageClass: "gp3",
        },
        labels: {
          application: "postgres",
          environment: "production",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 48.6,
        adjustment: 0,
        bytes: 214748364800,
        byteHours: 36127866880000,
      },
      "disk-prod-2": {
        type: "Disk",
        name: "pvc-redis-prod",
        properties: {
          provider: "AWS",
          cluster: "production",
          category: "Storage",
          region: "us-east-1",
          storageClass: "io2",
        },
        labels: {
          application: "redis",
          environment: "production",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 86.4,
        adjustment: 0,
        bytes: 107374182400,
        byteHours: 18063933440000,
      },
      "disk-gcp-1": {
        type: "Disk",
        name: "pd-ssd-data",
        properties: {
          provider: "GCP",
          cluster: "production",
          category: "Storage",
          region: "us-central1",
          storageClass: "pd-ssd",
        },
        labels: {
          application: "analytics",
          environment: "production",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 76.8,
        adjustment: 0,
        bytes: 322122547200,
        byteHours: 54196679270400,
      },
      "disk-staging-1": {
        type: "Disk",
        name: "pvc-volume-staging",
        properties: {
          provider: "GCP",
          cluster: "staging",
          category: "Storage",
          region: "us-west1",
          storageClass: "pd-standard",
        },
        labels: {
          environment: "staging",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 14.4,
        adjustment: 0,
        bytes: 53687091200,
        byteHours: 9031966720000,
      },
      "network-prod-1": {
        type: "Network",
        name: "network-egress-prod",
        properties: {
          provider: "AWS",
          cluster: "production",
          category: "Network",
          region: "us-east-1",
        },
        labels: {
          environment: "production",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 89.7,
        adjustment: 4.2,
        minutes: 10080,
        providerID: "arn:aws:ec2:us-east-1:123456789:network-interface/eni-prod-12345",
      },
      "network-gcp-1": {
        type: "Network",
        name: "vpc-egress",
        properties: {
          provider: "GCP",
          cluster: "production",
          category: "Network",
          region: "us-central1",
        },
        labels: {
          environment: "production",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 62.3,
        adjustment: 0,
        minutes: 10080,
        providerID: "projects/my-project/global/networks/production-vpc",
      },
      "lb-prod-1": {
        type: "LoadBalancer",
        name: "prod-alb-public",
        properties: {
          provider: "AWS",
          cluster: "production",
          category: "Network",
          region: "us-east-1",
          lbType: "application",
        },
        labels: {
          environment: "production",
          team: "platform",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 125.3,
        adjustment: 0,
        minutes: 10080,
        providerID: "arn:aws:elasticloadbalancing:us-east-1:123456789:loadbalancer/app/prod/abc123",
      },
      "lb-gcp-1": {
        type: "LoadBalancer",
        name: "gcp-lb-frontend",
        properties: {
          provider: "GCP",
          cluster: "production",
          category: "Network",
          region: "us-central1",
          lbType: "global",
        },
        labels: {
          environment: "production",
          team: "frontend",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 98.5,
        adjustment: 0,
        minutes: 10080,
        providerID: "projects/my-project/global/forwardingRules/prod-lb",
      },
      "management-aws-1": {
        type: "Management",
        name: "aws-support-fee",
        properties: {
          provider: "AWS",
          cluster: "production",
          category: "Management",
        },
        labels: {
          type: "support",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 52.14,
        adjustment: 0,
      },
      "management-gcp-1": {
        type: "Management",
        name: "gcp-support-fee",
        properties: {
          provider: "GCP",
          cluster: "production",
          category: "Management",
        },
        labels: {
          type: "support",
        },
        window: {
          start: "2026-02-01T00:00:00Z",
          end: "2026-02-08T00:00:00Z",
        },
        totalCost: 38.5,
        adjustment: 0,
      },
    },
  };
}

export function getMockToplineData() {
  return {
    code: 200,
    data: {
      totalCost: 1467.04,
      adjustment: 4.2,
      numResults: 15,
    },
  };
}
