import { type RouteConfig, index, route } from "@react-router/dev/routes";


// Defaulting to New routes..
// Legacy Routes removed.
export default [
  index("routes/home.tsx"),
  route("dashboards", "routes/dashboard-list.tsx"),
  route("dashboard/:dashboardId", "routes/dashboard.tsx"),
  route("reports", "routes/reports-list.tsx"),
  route("report/:reportId", "routes/report-builder.tsx"),
  route("settings", "routes/settings.tsx"),
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;