const costTypeOptions = [
  { name: "Blended", value: "blended" },
  { name: "Billed", value: "billed" },
  { name: "List", value: "list" },
];
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
  { name: "Domain", value: "domain" },
  { name: "Account Name", value: "accountName" },
  { name: "Resource Name", value: "resourceName" },
  { name: "Resource Type", value: "resourceType" },
  { name: "Zone", value: "zone" },
  { name: "Charge Category", value: "chargeCategory" },
  { name: "Provider ID", value: "providerId" },
  { name: "Usage Unit", value: "usageUnit" },
];

const aggToKeyMapExternalCosts = {
  zone: "zone",
  accountName: "account_name",
  chargeCategory: "charge_category",
  resourceName: "resource_name",
  resourceType: "resource_type",
  providerId: "provider_id",
  usageUnit: "usage_unit",
  domain: "domain",
};

export {
  costTypeOptions,
  windowOptions,
  aggregationOptions,
  aggToKeyMapExternalCosts,
};
