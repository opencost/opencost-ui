import { useParams, useNavigate } from "react-router";
import { useDashboard } from "~/components/dashboard-context";
import DashboardView from "~/components/dashboard-view";
import AppHeader from "~/components/app-header";
import type { Widget } from "~/components/dashboard-context";

export function meta() {
  return [{ title: "OpenCost — Dashboard" }];
}

export default function DashboardPage() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const { dashboards, updateDashboard } = useDashboard();

  const dashboard = dashboards.find((d) => d.id === dashboardId);

  if (!dashboard) {
    return (
      <>
        <AppHeader />
        <main className="pt-12 p-[4rem_2rem] text-center">
          <h2 className="text-2xl font-semibold mb-4">Dashboard not found</h2>
          <p className="text-[var(--cds-text-secondary)] mb-6">
            The dashboard you are looking for does not exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[var(--cds-button-primary)] text-[var(--cds-text-on-color)] border-none py-3 px-6 cursor-pointer text-sm"
          >
            Back to Dashboards
          </button>
        </main>
      </>
    );
  }

  const handleUpdateWidgets = (newWidgets: Widget[]) => {
    updateDashboard(dashboard.id, { widgets: newWidgets });
  };

  return (
    <>
      <AppHeader />
      <main className="pt-20 pb-8 min-h-screen bg-[var(--cds-background)]">
        <DashboardView
          dashboard={dashboard}
          onBack={() => navigate("/")}
          onUpdateWidgets={handleUpdateWidgets}
        />
      </main>
    </>
  );
}
