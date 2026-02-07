/**
 * Constants and configuration for the Assets page
 */

export const windowOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
  { name: "Last 30 days", value: "30d" },
];

export const aggregationOptions = [
  { name: "Type", value: "type" },
  { name: "Provider", value: "provider" },
  { name: "Cluster", value: "cluster" },
  { name: "Project", value: "project" },
];

export const assetTypes = [
  { name: "Node", value: "Node" },
  { name: "Disk", value: "Disk" },
  { name: "Network", value: "Network" },
  { name: "Load Balancer", value: "LoadBalancer" },
  { name: "Management", value: "Management" },
  { name: "Other", value: "Other" },
];

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format minutes to hours/days
 */
export function formatMinutes(minutes) {
  if (!minutes || minutes === 0) return "0m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}
