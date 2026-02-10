export const getMockData = (timeWindow = "7d", aggregate = "type", accumulate = true) => {
  const days = parseInt(timeWindow) || 7;
  const scale = days / 7;
  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const windowDates = { start: start.toISOString(), end: now.toISOString() };

  const scaleAsset = (asset) => ({
    ...asset,
    window: windowDates,
    minutes: Math.round(asset.minutes * scale),
    byteHours: Math.round(asset.byteHours * scale),
    byteHoursUsed: Math.round(asset.byteHoursUsed * scale),
    totalCost: parseFloat((asset.totalCost * scale).toFixed(2)),
  });

  const scaleGroup = (group) => {
    const scaled = {};
    for (const [key, asset] of Object.entries(group)) {
      scaled[key] = scaleAsset(asset);
    }
    return scaled;
  };

  const baseData = {
    "default-cluster": {
      nodes: {
        "control-plane": {
          type: "Disk",
          category: "Storage",
          providerID: "control-plane",
          storageClass: "__local__",
          local: 1,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 536870912000,
          byteHours: 91268055040000,
          byteHoursUsed: 36507222016000,
          byteUsageMax: 214748364800,
          breakdown: { idle: 0.55, system: 0.45, user: 0, other: 0 },
          totalCost: 12.75,
        },
        "worker-node-1": {
          type: "Disk",
          category: "Storage",
          providerID: "worker-node-1",
          storageClass: "__local__",
          local: 1,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 429496729600,
          byteHours: 72155450572800,
          byteHoursUsed: 32469952757760,
          byteUsageMax: 171798691840,
          breakdown: { idle: 0.58, system: 0.42, user: 0, other: 0 },
          totalCost: 10.25,
        },
        "worker-node-2": {
          type: "Disk",
          category: "Storage",
          providerID: "worker-node-2",
          storageClass: "__local__",
          local: 1,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 322122547200,
          byteHours: 54120672614400,
          byteHoursUsed: 48708605352960,
          byteUsageMax: 289850163200,
          breakdown: { idle: 0.1, system: 0.3, user: 0.6, other: 0 },
          totalCost: 8.50,
        },
        "worker-node-3": {
          type: "Disk",
          category: "Storage",
          providerID: "worker-node-3",
          storageClass: "__local__",
          local: 1,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 483183820800,
          byteHours: 81182010777600,
          byteHoursUsed: 73063809699840,
          byteUsageMax: 434681528320,
          breakdown: { idle: 0.1, system: 0.25, user: 0.65, other: 0 },
          totalCost: 11.80,
        },
      },
      pvc: {
        "pvc-mysql-data": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-mysql-data",
          storageClass: "fast-ssd",
          volumeName: "pvc-mysql-data",
          claimName: "mysql-data",
          claimNamespace: "database",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 107374182400,
          byteHours: 10737418240000,
          byteHoursUsed: 7516192768000,
          byteUsageMax: 75161927680,
          breakdown: { idle: 0.3, system: 0, user: 0.7, other: 0 },
          totalCost: 24.55,
        },
        "pvc-redis-cache": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-redis-cache",
          storageClass: "fast-ssd",
          volumeName: "pvc-redis-cache",
          claimName: "redis-data",
          claimNamespace: "cache",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 53687091200,
          byteHours: 5368709120000,
          byteHoursUsed: 4295767296000,
          byteUsageMax: 42957672960,
          breakdown: { idle: 0.2, system: 0, user: 0.8, other: 0 },
          totalCost: 15.50,
        },
        "pvc-elasticsearch": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-elasticsearch",
          storageClass: "standard",
          volumeName: "pvc-elasticsearch",
          claimName: "elasticsearch-data",
          claimNamespace: "logging",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 536870912000,
          byteHours: 53687091200000,
          byteHoursUsed: 26843545600000,
          byteUsageMax: 268435456000,
          breakdown: { idle: 0.5, system: 0, user: 0.5, other: 0 },
          totalCost: 18.75,
        },
        "pvc-prometheus": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-prometheus",
          storageClass: "standard",
          volumeName: "pvc-prometheus",
          claimName: "prometheus-data",
          claimNamespace: "monitoring",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 268435456000,
          byteHours: 26843545600000,
          byteHoursUsed: 18390482176000,
          byteUsageMax: 187904821760,
          breakdown: { idle: 0.85, system: 0, user: 0.15, other: 0 },
          totalCost: 6.25,
        },
      },
    },
    "prod-cluster": {
      nodes: {
        "prod-master": {
          type: "Disk",
          category: "Storage",
          providerID: "prod-master",
          storageClass: "__local__",
          local: 1,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 644245094400,
          byteHours: 109392867206400,
          byteHoursUsed: 43757146882560,
          byteUsageMax: 257698037760,
          breakdown: { idle: 0.6, system: 0.4, user: 0, other: 0 },
          totalCost: 28.50,
        },
        "prod-worker-1": {
          type: "Disk",
          category: "Storage",
          providerID: "prod-worker-1",
          storageClass: "__local__",
          local: 1,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 537346129920,
          byteHours: 91397042503680,
          byteHoursUsed: 36558817001472,
          byteUsageMax: 215198607360,
          breakdown: { idle: 0.6, system: 0.4, user: 0, other: 0 },
          totalCost: 26.75,
        },
      },
      pvc: {
        "pvc-postgres-prod": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-postgres-prod",
          storageClass: "fast-ssd",
          volumeName: "pvc-postgres-prod",
          claimName: "postgres-data",
          claimNamespace: "database",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 214748364800,
          byteHours: 21474836480000,
          byteHoursUsed: 16106127360000,
          byteUsageMax: 161061273600,
          breakdown: { idle: 0.25, system: 0, user: 0.75, other: 0 },
          totalCost: 45.80,
        },
        "pvc-backup-storage": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-backup-storage",
          storageClass: "standard",
          volumeName: "pvc-backup-storage",
          claimName: "backup-storage",
          claimNamespace: "backup",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 1099511627776,
          byteHours: 109951162777600,
          byteHoursUsed: 54975581388800,
          byteUsageMax: 549755813888,
          breakdown: { idle: 0.5, system: 0, user: 0.5, other: 0 },
          totalCost: 32.25,
        },
        "pvc-kafka-logs": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-kafka-logs",
          storageClass: "premium-ssd",
          volumeName: "pvc-kafka-logs",
          claimName: "kafka-logs",
          claimNamespace: "messaging",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 322122547200,
          byteHours: 32212254720000,
          byteHoursUsed: 25769803776000,
          byteUsageMax: 257698037760,
          breakdown: { idle: 0.2, system: 0, user: 0.8, other: 0 },
          totalCost: 52.40,
        },
        "pvc-grafana": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-grafana",
          storageClass: "standard",
          volumeName: "pvc-grafana",
          claimName: "grafana-data",
          claimNamespace: "monitoring",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 107374182400,
          byteHours: 10737418240000,
          byteHoursUsed: 9126805504000,
          byteUsageMax: 96636764160,
          breakdown: { idle: 0.88, system: 0, user: 0.12, other: 0 },
          totalCost: 4.15,
        },
      },
    },
    "staging-cluster": {
      nodes: {
        "staging-master": {
          type: "Disk",
          category: "Storage",
          providerID: "staging-master",
          storageClass: "__local__",
          local: 1,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 376610217984,
          byteHours: 63285956546560,
          byteHoursUsed: 56957360891904,
          byteUsageMax: 338880159744,
          breakdown: { idle: 0.1, system: 0.35, user: 0.55, other: 0 },
          totalCost: 9.45,
        },
        "staging-worker-1": {
          type: "Disk",
          category: "Storage",
          providerID: "staging-worker-1",
          storageClass: "__local__",
          local: 1,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 268435456000,
          byteHours: 45141835161600,
          byteHoursUsed: 27989507346816,
          byteUsageMax: 161061273600,
          breakdown: { idle: 0.38, system: 0.32, user: 0.3, other: 0 },
          totalCost: 7.20,
        },
        "staging-worker-2": {
          type: "Disk",
          category: "Storage",
          providerID: "staging-worker-2",
          storageClass: "__local__",
          local: 1,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 322122547200,
          byteHours: 54120672614400,
          byteHoursUsed: 37884470830080,
          byteUsageMax: 225485783040,
          breakdown: { idle: 0.3, system: 0.28, user: 0.42, other: 0 },
          totalCost: 8.10,
        },
      },
      pvc: {
        "pvc-mongo-staging": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-mongo-staging",
          storageClass: "fast-ssd",
          volumeName: "pvc-mongo-staging",
          claimName: "mongo-data",
          claimNamespace: "database",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 161061273600,
          byteHours: 16106127360000,
          byteHoursUsed: 13690408448000,
          byteUsageMax: 137438953472,
          breakdown: { idle: 0.15, system: 0, user: 0.85, other: 0 },
          totalCost: 35.60,
        },
        "pvc-nginx-cache": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-nginx-cache",
          storageClass: "fast-ssd",
          volumeName: "pvc-nginx-cache",
          claimName: "nginx-cache",
          claimNamespace: "ingress",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 85899345920,
          byteHours: 8589934592000,
          byteHoursUsed: 7730941132800,
          byteUsageMax: 77309411328,
          breakdown: { idle: 0.1, system: 0, user: 0.9, other: 0 },
          totalCost: 19.75,
        },
        "pvc-api-logs": {
          type: "Disk",
          category: "Storage",
          providerID: "pvc-api-logs",
          storageClass: "cold-storage",
          volumeName: "pvc-api-logs",
          claimName: "api-logs",
          claimNamespace: "api",
          local: 0,
          window: { start: "2026-01-27T00:00:00Z", end: "2026-02-03T00:00:00Z" },
          minutes: 10080,
          bytes: 644245094400,
          byteHours: 64424509440000,
          byteHoursUsed: 51539607552000,
          byteUsageMax: 515396075520,
          breakdown: { idle: 0.92, system: 0, user: 0.08, other: 0 },
          totalCost: 3.85,
        },
      },
    },
  };

  const scaledData = {};
  for (const [clusterKey, cluster] of Object.entries(baseData)) {
    scaledData[clusterKey] = {};
    if (cluster.nodes) scaledData[clusterKey].nodes = scaleGroup(cluster.nodes);
    if (cluster.pvc) scaledData[clusterKey].pvc = scaleGroup(cluster.pvc);
  }

  // Reorganize data based on aggregate parameter
  const reorganizeByAggregate = (data, aggregateBy) => {
    if (aggregateBy === "cluster") {
      // Already grouped by cluster, return as-is
      return data;
    }

    const reorganized = {};

    // Flatten all assets from all clusters
    const allAssets = [];
    for (const [clusterKey, cluster] of Object.entries(data)) {
      if (cluster.nodes) {
        for (const [nodeKey, nodeData] of Object.entries(cluster.nodes)) {
          allAssets.push({
            key: `${clusterKey}-node-${nodeKey}`,
            cluster: clusterKey,
            name: nodeKey,
            assetType: "Node Disk",
            ...nodeData,
          });
        }
      }
      if (cluster.pvc) {
        for (const [pvcKey, pvcData] of Object.entries(cluster.pvc)) {
          allAssets.push({
            key: `${clusterKey}-pvc-${pvcKey}`,
            cluster: clusterKey,
            name: pvcData.claimName || pvcKey,
            assetType: "PVC",
            ...pvcData,
          });
        }
      }
    }

    // Group assets based on aggregate parameter
    if (aggregateBy === "type") {
      // Group by asset type (Node Disk, PVC)
      reorganized["Node Disk"] = { nodes: {} };
      reorganized["PVC"] = { pvc: {} };

      allAssets.forEach((asset) => {
        if (asset.assetType === "Node Disk") {
          reorganized["Node Disk"].nodes[asset.name] = asset;
        } else if (asset.assetType === "PVC") {
          reorganized["PVC"].pvc[asset.name] = asset;
        }
      });
    } else if (aggregateBy === "storageclass") {
      // Group by storage class
      allAssets.forEach((asset) => {
        const sc = asset.storageClass || "unspecified";
        if (!reorganized[sc]) {
          reorganized[sc] = {};
        }
        if (asset.local === 1) {
          if (!reorganized[sc].nodes) reorganized[sc].nodes = {};
          reorganized[sc].nodes[asset.name] = asset;
        } else {
          if (!reorganized[sc].pvc) reorganized[sc].pvc = {};
          reorganized[sc].pvc[asset.name] = asset;
        }
      });
    } else if (aggregateBy === "providerID") {
      // Group by providerID (one asset per group)
      allAssets.forEach((asset) => {
        const providerId = asset.providerID || asset.name;
        reorganized[providerId] = { type: asset.type, ...asset };
      });
    }

    return reorganized;
  };

  const finalData = reorganizeByAggregate(scaledData, aggregate);

  return {
    data: finalData,
    window: { start: start.toISOString(), end: now.toISOString(), days },
  };
};
