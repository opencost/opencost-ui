import { DropdownOption } from '../../types/assets';

export const windowOptions: DropdownOption[] = [
    { id: "Today", text: "today" },
    { id: "Yesterday", text: "yesterday" },
    { id: "Last 24h", text: "24h" },
    { id: "Last 48h", text: "48h" },
    { id: "Week-to-date", text: "week" },
    { id: "Last week", text: "lastweek" },
    { id: "Last 7 days", text: "7d" },
    { id: "Last 14 days", text: "14d" },
    { id: "Last 30 days", text: "30d" },
];

export const assetTypeOptions: DropdownOption[] = [
    { id: 'all', text: 'All types' },
    { id: 'Node', text: 'Node' },
    { id: 'Disk', text: 'Disk' },
    { id: 'LoadBalancer', text: 'LoadBalancer' },
    { id: 'ClusterManagement', text: 'ClusterManagement' },
];

export const currencyOptions: DropdownOption[] = [
    { id: 'USD', text: 'USD ($)' },
    { id: 'EUR', text: 'EUR (€)' },
    { id: 'GBP', text: 'GBP (£)' },
    { id: 'JPY', text: 'JPY (¥)' },
    { id: 'INR', text: 'INR (₹)' },
];

export const aggregationOptions: DropdownOption[] = [
    { id: 'daily', text: 'Daily' },
    { id: 'entire', text: 'Entire Window' },
];

export const serviceBreakdownOptions: DropdownOption[] = [
    { id: 'service', text: 'Service' },
    { id: 'cluster', text: 'Cluster' },
];

// Map internal IDs to display names if needed
export const assetTypeMap: Record<string, string> = {
    Node: 'Node',
    Disk: 'Disk',
    LoadBalancer: 'Load Balancer',
    ClusterManagement: 'Cluster Management',
};

export const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
};
