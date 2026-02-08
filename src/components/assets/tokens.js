export const windowOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
  { name: "Custom range", value: "custom" },
];

export const aggregationOptions = [
  { name: "Individual Asset", value: "" },
  { name: "Type", value: "type" },
  { name: "Cluster", value: "cluster" },
  { name: "Provider", value: "provider" },
  { name: "Account/Project", value: "account" },
];

export const typeIcons = {
  Node: "memory",
  Disk: "storage",
  LoadBalancer: "cloud",
  Network: "settings_ethernet",
  ClusterManagement: "settings",
  Cloud: "cloud_queue",
};

export const categoryColors = {
  Compute: "#2196F3",
  Storage: "#4CAF50",
  Network: "#FF9800",
  Management: "#9C27B0",
  Other: "#607D8B",
};

export const typeColors = {
  Node: "#1976D2",
  Disk: "#388E3C",
  LoadBalancer: "#F57C00",
  Network: "#FF5722",
  ClusterManagement: "#7B1FA2",
};
