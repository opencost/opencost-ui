const windowOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
];

const aggregationOptions = [
  { name: "Type", value: "type" },
  { name: "Category", value: "category" },
  { name: "Provider", value: "provider" },
  { name: "Service", value: "service" },
  { name: "Cluster", value: "cluster" },
  { name: "Project", value: "project" },
];

const assetTypeMap = {
  Node: "Compute",
  Disk: "Storage",
  ClusterManagement: "Management",
  LoadBalancer: "Network",
  Network: "Network",
};

export { windowOptions, aggregationOptions, assetTypeMap };
