const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9003';

const AssetsService = {
  fetchAssets: async (timeWindow = '120d', options = {}) => {
    try {
      const params = new URLSearchParams({
        window: timeWindow,
        ...options
      });
      
      const response = await fetch(`${API_BASE_URL}/assets?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data: data.data || data,
        window: data.window || {
          start: new Date(Date.now() - (120 * 24 * 60 * 60 * 1000)).toISOString(),
          end: new Date().toISOString(),
          days: 120
        }
      };
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw new Error(`Could not connect to the API: ${error.message}`);
    }
  },

  getMockData: () => {
    const now = new Date();
    const start = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    return {
      data: {
        "default-cluster": {
          "nodes": {
            "opencost-cluster-control-plane": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "opencost-cluster-control-plane",
              "storageClass": "__local__",
              "volumeName": "",
              "claimName": "",
              "local": 1,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 84304018735104,
              "bytes": 501809635328,
              "byteHoursUsed": 33064731377664,
              "byteUsageMax": 196855361536,
              "breakdown": {
                "idle": 0.6078,
                "system": 0.3922,
                "user": 0,
                "other": 0
              },
              "totalCost": 0.006426
            },
            "opencost-cluster-worker-1": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "opencost-cluster-worker-1",
              "storageClass": "__local__",
              "volumeName": "",
              "claimName": "",
              "local": 1,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 67443214988288,
              "bytes": 401927271488,
              "byteHoursUsed": 26977285995315.2,
              "byteUsageMax": 157509217280,
              "breakdown": {
                "idle": 0.60,
                "system": 0.40,
                "user": 0,
                "other": 0
              },
              "totalCost": 0.005141
            }
          },
          "pvc": {
            "pvc-01edfbc8-0074-4e72-b432-363fabb457e1": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "pvc-01edfbc8-0074-4e72-b432-363fabb457e1",
              "storageClass": "standard",
              "volumeName": "pvc-01edfbc8-0074-4e72-b432-363fabb457e1",
              "claimName": "storage-prometheus-alertmanager-0",
              "claimNamespace": "prometheus-system",
              "local": 0,
              "window": {
                "start": "2026-01-15T11:35:00Z",
                "end": "2026-01-15T11:42:35Z"
              },
              "minutes": 7.583736,
              "byteHours": 271432472.48789,
              "bytes": 2147483648,
              "breakdown": {
                "idle": 1,
                "system": 0,
                "user": 0,
                "other": 0
              },
              "totalCost": 0
            },
            "pvc-3431d37d-a48e-4331-b40c-c8818b25f1ee": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "pvc-3431d37d-a48e-4331-b40c-c8818b25f1ee",
              "storageClass": "standard",
              "volumeName": "pvc-3431d37d-a48e-4331-b40c-c8818b25f1ee",
              "claimName": "prometheus-server",
              "claimNamespace": "prometheus-system",
              "local": 0,
              "window": {
                "start": "2026-01-15T11:35:00Z",
                "end": "2026-01-15T11:42:35Z"
              },
              "minutes": 7.583736,
              "byteHours": 1085729892.58342,
              "bytes": 8589934592,
              "breakdown": {
                "idle": 1,
                "system": 0,
                "user": 0,
                "other": 0
              },
              "totalCost": 0
            },
            "pvc-storage-mysql-0": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "pvc-storage-mysql-0",
              "storageClass": "fast-ssd",
              "volumeName": "pvc-storage-mysql-0",
              "claimName": "storage-mysql-0",
              "claimNamespace": "database",
              "local": 0,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 10737418240000,
              "bytes": 107374182400,
              "byteHoursUsed": 7516192768000,
              "byteUsageMax": 75161927680,
              "breakdown": {
                "idle": 0.30,
                "system": 0,
                "user": 0.70,
                "other": 0
              },
              "totalCost": 0.821
            },
            "pvc-app-data-redis": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "pvc-app-data-redis",
              "storageClass": "fast-ssd",
              "volumeName": "pvc-app-data-redis",
              "claimName": "app-data-redis",
              "claimNamespace": "cache",
              "local": 0,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 5368709120000,
              "bytes": 53687091200,
              "byteHoursUsed": 4295767296000,
              "byteUsageMax": 42957672960,
              "breakdown": {
                "idle": 0.20,
                "system": 0,
                "user": 0.80,
                "other": 0
              },
              "totalCost": 0.410
            },
            "pvc-logs-elasticsearch-0": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "pvc-logs-elasticsearch-0",
              "storageClass": "standard",
              "volumeName": "pvc-logs-elasticsearch-0",
              "claimName": "logs-elasticsearch-0",
              "claimNamespace": "logging",
              "local": 0,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 53687091200000,
              "bytes": 536870912000,
              "byteHoursUsed": 26843545600000,
              "byteUsageMax": 268435456000,
              "breakdown": {
                "idle": 0.50,
                "system": 0,
                "user": 0.50,
                "other": 0
              },
              "totalCost": 4.096
            }
          }
        },
        "prod-cluster": {
          "nodes": {
            "prod-cluster-control-plane": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "prod-cluster-control-plane",
              "storageClass": "__local__",
              "volumeName": "",
              "claimName": "",
              "local": 1,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 91268055040000,
              "bytes": 536870912000,
              "byteHoursUsed": 36507222016000,
              "byteUsageMax": 214748364800,
              "breakdown": {
                "idle": 0.55,
                "system": 0.45,
                "user": 0,
                "other": 0
              },
              "totalCost": 0.007120
            },
            "prod-cluster-worker-1": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "prod-cluster-worker-1",
              "storageClass": "__local__",
              "volumeName": "",
              "claimName": "",
              "local": 1,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 72155450572800,
              "bytes": 429496729600,
              "byteHoursUsed": 32469952757760,
              "byteUsageMax": 171798691840,
              "breakdown": {
                "idle": 0.58,
                "system": 0.42,
                "user": 0,
                "other": 0
              },
              "totalCost": 0.005890
            }
          },
          "pvc": {
            "pvc-prod-mysql-0": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "pvc-prod-mysql-0",
              "storageClass": "fast-ssd",
              "volumeName": "pvc-prod-mysql-0",
              "claimName": "mysql-data",
              "claimNamespace": "database",
              "local": 0,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 21474836480000,
              "bytes": 214748364800,
              "byteHoursUsed": 16106127360000,
              "byteUsageMax": 161061273600,
              "breakdown": {
                "idle": 0.25,
                "system": 0,
                "user": 0.75,
                "other": 0
              },
              "totalCost": 1.642
            },
            "pvc-prod-redis": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "pvc-prod-redis",
              "storageClass": "fast-ssd",
              "volumeName": "pvc-prod-redis",
              "claimName": "redis-data",
              "claimNamespace": "cache",
              "local": 0,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 10737418240000,
              "bytes": 107374182400,
              "byteHoursUsed": 8589934592000,
              "byteUsageMax": 85899345920,
              "breakdown": {
                "idle": 0.20,
                "system": 0,
                "user": 0.80,
                "other": 0
              },
              "totalCost": 0.821
            },
            "pvc-prod-elasticsearch-0": {
              "type": "Disk",
              "category": "Storage",
              "providerID": "pvc-prod-elasticsearch-0",
              "storageClass": "standard",
              "volumeName": "pvc-prod-elasticsearch-0",
              "claimName": "elasticsearch-data",
              "claimNamespace": "logging",
              "local": 0,
              "window": {
                "start": "2026-01-09T00:00:00Z",
                "end": "2026-01-16T00:00:00Z"
              },
              "minutes": 10080,
              "byteHours": 64424509440000,
              "bytes": 644245094400,
              "byteHoursUsed": 32212254720000,
              "byteUsageMax": 322122547200,
              "breakdown": {
                "idle": 0.50,
                "system": 0,
                "user": 0.50,
                "other": 0
              },
              "totalCost": 4.915
            }
          }
        }
      },
      window: {
        start: start.toISOString(),
        end: now.toISOString(),
        days: 7
      }
    };
  }
};

export default AssetsService;