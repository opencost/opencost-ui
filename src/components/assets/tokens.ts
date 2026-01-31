export const windowOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
];

export const aggregationOptions = [
  { name: "Cluster", value: "cluster" },
  { name: "Node", value: "node" },
  { name: "Category", value: "category" },
  { name: "Type", value: "type" },
  { name: "Provider", value: "provider" },
  { name: "Account", value: "account" },
  { name: "Project", value: "project" },
  { name: "Service", value: "service" },
];

export const accumulateOptions = [
  { name: "Entire window", value: true },
  { name: "Daily", value: false },
];

export const assetTypeLabels = {
  Node: "Node",
  Disk: "Disk",
  LoadBalancer: "Load Balancer",
  ClusterManagement: "Cluster Management",
  Network: "Network",
  SharedAsset: "Shared Asset",
};
