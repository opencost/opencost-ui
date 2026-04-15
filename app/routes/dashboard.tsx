import { useParams, useNavigate } from "react-router";
import DashboardAppShell from "~/components/dashboard-app-shell";
import {
  getDefaultDashboard,
  useDashboard,
} from "~/components/dashboard-context";
import DashboardView from "~/components/dashboard-view";
import type { Widget } from "~/components/dashboard-context";

export function meta() {
  return [{ title: "OpenCost — Dashboard" }];
}

export default function DashboardPage() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const { dashboards, updateDashboard } = useDashboard();
  const defaultDashboard = getDefaultDashboard(dashboards);

  const dashboard = dashboards.find((d) => d.id === dashboardId);

  if (!dashboard) {
    return (
      <DashboardAppShell>
        <main className="pt-12 p-[4rem_2rem] text-center">
          <h2 className="text-2xl font-semibold mb-4">Dashboard not found</h2>
          <p className="text-[#525252] mb-6">
            The dashboard you are looking for does not exist.
          </p>
          <button
            onClick={() => navigate("/dashboards")}
            className="bg-[#0f62fe] text-white border-none py-3 px-6 cursor-pointer text-sm"
          >
            Back to Dashboards
          </button>
        </main>
      </DashboardAppShell>
    );
  }

  const handleUpdateWidgets = (newWidgets: Widget[]) => {
    updateDashboard(dashboard.id, { widgets: newWidgets });
  };

  return (
    <DashboardAppShell>
      <main className="pb-8 min-h-screen bg-[#f4f4f4]">
        <DashboardView
          dashboard={dashboard}
          onBack={() => navigate("/dashboards")}
          onUpdateWidgets={handleUpdateWidgets}
          isDefaultDashboard={dashboard.id === defaultDashboard?.id}
        />
      </main>
    </DashboardAppShell>
  );
}
