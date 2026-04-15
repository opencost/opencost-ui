import { type RouteConfig, index, route } from "@react-router/dev/routes";

const isLegacyMode = import.meta.env.VITE_LEGACY_MODE === "true";

const legacyRoutes: RouteConfig = [
  index("routes/legacy/allocation.tsx"),
  route("cloud", "routes/legacy/cloud.tsx"),
  route("external-costs", "routes/legacy/external-costs.tsx"),
  route("*", "routes/$.tsx"),
];

const newUIRoutes: RouteConfig = [
  index("routes/home.tsx"),
  route("dashboards", "routes/dashboard-list.tsx"),
  route("dashboard/:dashboardId", "routes/dashboard.tsx"),
  route("reports", "routes/reports-list.tsx"),
  route("report/:reportId", "routes/report-builder.tsx"),
  route("*", "routes/$.tsx"),
];

export default (isLegacyMode
  ? legacyRoutes
  : newUIRoutes) satisfies RouteConfig;
