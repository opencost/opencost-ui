import blue from "@mui/material/colors/blue";
import orange from "@mui/material/colors/orange";
import green from "@mui/material/colors/green";
import purple from "@mui/material/colors/purple";
import teal from "@mui/material/colors/teal";
import grey from "@mui/material/colors/grey";

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

export const assetTypeOptions = [
  { name: "All Types", value: "all" },
  { name: "Node", value: "Node" },
  { name: "Disk", value: "Disk" },
  { name: "LoadBalancer", value: "LoadBalancer" },
  { name: "Network", value: "Network" },
  { name: "ClusterManagement", value: "ClusterManagement" },
  { name: "Cloud", value: "Cloud" },
];

export const categoryOptions = [
  { name: "All Categories", value: "all" },
  { name: "Compute", value: "Compute" },
  { name: "Storage", value: "Storage" },
  { name: "Network", value: "Network" },
  { name: "Management", value: "Management" },
];

export const assetTypeConfig = {
  Node: { label: "Nodes", color: blue[500] },
  Disk: { label: "Disks", color: orange[500] },
  LoadBalancer: { label: "Load Balancers", color: green[500] },
  Network: { label: "Network", color: purple[500] },
  ClusterManagement: { label: "Cluster Mgmt", color: teal[500] },
  Cloud: { label: "Cloud", color: grey[500] },
};
