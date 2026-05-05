import { useNavigate } from "react-router";
import DashboardAppShell from "~/components/dashboard-app-shell";
import DashboardView from "~/components/dashboard-view";
import {
  getDefaultDashboard,
  useDashboard,
  type Widget,
} from "~/components/dashboard-context";

export function meta() {
  return [{ title: "OpenCost — Home" }];
}

export default function HomePage() {
  const navigate = useNavigate();
  const { dashboards, updateDashboard } = useDashboard();
  const defaultDashboard = getDefaultDashboard(dashboards);

  if (!defaultDashboard) {
    return (
      <DashboardAppShell>
        <main className="p-[4rem_2rem] text-center">
          <h2 className="text-2xl font-semibold mb-4">No dashboards found</h2>
          <p className="text-[#525252]">
            Create a dashboard from the Dashboards section to get started.
          </p>
        </main>
      </DashboardAppShell>
    );
  }

  const handleUpdateWidgets = (newWidgets: Widget[]) => {
    updateDashboard(defaultDashboard.id, { widgets: newWidgets });
  };

  return (
    <DashboardAppShell>
      <main className="pb-8 min-h-screen bg-[#f4f4f4]">
        <DashboardView
          dashboard={defaultDashboard}
          onBack={() => navigate("/dashboards")}
          onUpdateWidgets={handleUpdateWidgets}
          isDefaultDashboard
          showBackButton={false}
        />
      </main>
    </DashboardAppShell>
  );
}
