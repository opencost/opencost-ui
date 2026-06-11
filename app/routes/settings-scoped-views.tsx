import ScopedViewsPanel from "~/components/settings/scoped-views-panel";

export function meta() {
  return [
    { title: "OpenCost — Scoped views" },
    { name: "description", content: "Create and manage scoped cost views" },
  ];
}

export default function SettingsScopedViewsPage() {
  return <ScopedViewsPanel />;
}
