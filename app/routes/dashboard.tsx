import { useParams, useNavigate } from "react-router";
import { Header, HeaderName } from "@carbon/react";
import { useDashboard } from "~/components/dashboard-context";
import DashboardView from "~/components/dashboard-view";
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
        <Header aria-label="OpenCost Platform">
          <HeaderName href="/" prefix="">
            OpenCost
          </HeaderName>
        </Header>
        <main style={{ paddingTop: "3rem", padding: "4rem 2rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
            Dashboard not found
          </h2>
          <p style={{ color: "#525252", marginBottom: "1.5rem" }}>
            The dashboard you are looking for does not exist.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#0f62fe",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
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
      <Header aria-label="OpenCost Platform">
        <HeaderName href="/" prefix="">
          OpenCost
        </HeaderName>
      </Header>
      <main style={{ paddingTop: "5rem", paddingBottom: "2rem", minHeight: "100vh", backgroundColor: "#f4f4f4" }}>
        <DashboardView
          dashboard={dashboard}
          onBack={() => navigate("/")}
          onUpdateWidgets={handleUpdateWidgets}
        />
      </main>
    </>
  );
}
