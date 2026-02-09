export const MOCK_ASSETS_DATA = [
  {
    "ClusterManagement": {
      "type": "ClusterManagement",
      "properties": {
        "category": "Management",
        "provider": "GCP",
        "project": "guestbook-227502",
        "service": "Kubernetes",
        "cluster": "cluster-one"
      },
      "labels": {
        "cost-center": "engineering",
        "firebase": "enabled",
        "namespace": "kubecost",
        "test_gcp_label": "test_gcp_value"
      },
      "window": {
        "start": "2023-07-18T00:00:00Z",
        "end": "2023-07-25T00:00:00Z"
      },
      "start": "2023-07-18T00:00:00Z",
      "end": "2023-07-25T00:00:00Z",
      "minutes": 10080.000000,
      "totalCost": 16.105322
    },
    "Disk": {
      "type": "Disk",
      "properties": {
        "category": "Storage",
        "provider": "GCP",
        "project": "guestbook-227502",
        "service": "Kubernetes",
        "cluster": "cluster-one"
      },
      "labels": {
        "cost-center": "engineering",
        "firebase": "enabled",
        "namespace": "kubecost",
        "test_gcp_label": "test_gcp_value"
      },
      "window": {
        "start": "2023-07-18T00:00:00Z",
        "end": "2023-07-25T00:00:00Z"
      },
      "start": "2023-07-18T00:00:00Z",
      "end": "2023-07-24T17:10:00Z",
      "minutes": 9670.000000,
      "byteHours": 80541516519424.000000,
      "bytes": 499740536831.999939,
      "byteHoursUsed": 1260838260792.807129,
      "byteUsageMax": null,
      "breakdown": {
        "idle": 0.9800269272561808,
        "other": 0,
        "system": 0.019973072743819435,
        "user": 0
      },
      "adjustment": -6.533317,
      "totalCost": 3.630275,
      "storageClass": "",
      "volumeName": "",
      "claimName": "",
      "claimNamespace": ""
    },
    "LoadBalancer": {
      "type": "LoadBalancer",
      "properties": {
        "category": "Network",
        "provider": "GCP",
        "project": "guestbook-227502",
        "service": "Kubernetes",
        "cluster": "cluster-one",
        "name": "ingress-nginx/ingress-nginx-controller",
        "providerID": "35.202.154.180"
      },
      "labels": {
        "cost-center": "engineering",
        "firebase": "enabled",
        "namespace": "kubecost",
        "test_gcp_label": "test_gcp_value"
      },
      "window": {
        "start": "2023-07-18T00:00:00Z",
        "end": "2023-07-25T00:00:00Z"
      },
      "start": "2023-07-18T00:00:00Z",
      "end": "2023-07-24T17:10:00Z",
      "minutes": 9670.000000,
      "adjustment": 0.000000,
      "totalCost": 4.366667
    },
    "Network": {
      "type": "Network",
      "properties": {
        "category": "Network",
        "provider": "GCP",
        "project": "guestbook-227502",
        "service": "Kubernetes",
        "cluster": "cluster-one"
      },
      "labels": {
        "cost-center": "engineering",
        "firebase": "enabled",
        "goog-k8s-cluster-location": "us-central1-a",
        "goog-k8s-cluster-name": "kc-integration-test",
        "namespace": "kubecost",
        "test_gcp_label": "test_gcp_value"
      },
      "window": {
        "start": "2023-07-18T00:00:00Z",
        "end": "2023-07-25T00:00:00Z"
      },
      "start": "2023-07-18T00:00:00Z",
      "end": "2023-07-23T00:00:00Z",
      "minutes": 7200.0,
      "adjustment": -0.0,
      "totalCost": 2.290521
    },
    "Node": {
      "type": "Node",
      "properties": {
        "category": "Compute",
        "provider": "GCP",
        "project": "guestbook-227502",
        "service": "Kubernetes",
        "cluster": "cluster-one"
      },
      "labels": {
        "cost-center": "engineering",
        "firebase": "enabled",
        "instance": "10.95.11.109:9003",
        "job": "kubecost",
        "label_app": "integration",
        "label_beta_kubernetes_io_arch": "amd64",
        "label_beta_kubernetes_io_os": "linux",
        "label_cloud_google_com_gke_boot_disk": "pd-standard",
        "label_cloud_google_com_gke_container_runtime": "docker",
        "label_cloud_google_com_gke_cpu_scaling_level": "2",
        "label_cloud_google_com_gke_logging_variant": "DEFAULT",
        "label_cloud_google_com_gke_max_pods_per_node": "110",
        "label_cloud_google_com_gke_os_distribution": "cos",
        "label_department": "engineering",
        "label_env": "test",
        "label_failure_domain_beta_kubernetes_io_region": "us-central1",
        "label_failure_domain_beta_kubernetes_io_zone": "us-central1-a",
        "label_kubernetes_io_arch": "amd64",
        "label_kubernetes_io_os": "linux",
        "label_owner": "kubecost",
        "label_product": "integration",
        "label_team": "kubecost",
        "label_topology_kubernetes_io_region": "us-central1",
        "label_topology_kubernetes_io_zone": "us-central1-a",
        "namespace": "kubecost",
        "test_gcp_label": "test_gcp_value"
      },
      "window": {
        "start": "2023-07-18T00:00:00Z",
        "end": "2023-07-25T00:00:00Z"
      },
      "start": "2023-07-18T00:00:00Z",
      "end": "2023-07-24T17:10:00Z",
      "minutes": 9670.000000,
      "nodeType": "",
      "cpuCores": 6.0,
      "ramBytes": 23876288511.999996,
      "cpuCoreHours": 967.000000,
      "ramByteHours": 3848061831850.666504,
      "GPUHours": 0.000000,
      "cpuBreakdown": {
        "idle": 0.7816140688705785,
        "other": 0.01327077839354095,
        "system": 0.023247472082326824,
        "user": 0.18186768065355347
      },
      "ramBreakdown": {
        "idle": 0.9608696355583681,
        "other": 0,
        "system": 0.0044846381137333665,
        "user": 0.034645726327898
      },
      "preemptible": 0.000000,
      "discount": 0.222016,
      "cpuCost": 59016.618816,
      "gpuCost": 0.000000,
      "gpuCount": 0.000000,
      "ramCost": 29194.86507,
      "adjustment": -68597.241975,
      "totalCost": 29.862398
    }
  }
];

export const TIME_RANGES = [
  { id: "1h", label: "Last Hour" },
  { id: "6h", label: "Last 6 Hours" },
  { id: "1d", label: "Last Day" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" }
];