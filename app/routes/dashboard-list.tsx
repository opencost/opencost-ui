import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button, Header, HeaderName, Tag, Modal } from "@carbon/react";
import { Add, Dashboard, ChartLineSmooth, Activity } from "@carbon/icons-react";
import { useDashboard, type Widget } from "~/components/dashboard-context";
import CreateDashboardModal from "~/components/create-dashboard-modal";

interface SharedDashboardPayload {
  name: string;
  description: string;
  widgets: Widget[];
  tags: string[];
}

function decodeShareParam(encoded: string): SharedDashboardPayload | null {
  try {
    return JSON.parse(atob(encoded)) as SharedDashboardPayload;
  } catch {
    return null;
  }
}

export function meta() {
  return [
    { title: "OpenCost — Dashboards" },
    { name: "description", content: "Cloud cost intelligence dashboards" },
  ];
}

export default function DashboardList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sharedPayload, setSharedPayload] = useState<SharedDashboardPayload | null>(null);
  const { dashboards, createDashboard } = useDashboard();

  useEffect(() => {
    const shareParam = searchParams.get("share");
    if (shareParam) {
      const decoded = decodeShareParam(shareParam);
      if (decoded) setSharedPayload(decoded);
      setSearchParams((prev) => { prev.delete("share"); return prev; }, { replace: true });
    }
  }, []);

  const handleImportShared = () => {
    if (!sharedPayload) return;
    const newId = `dashboard-${Date.now()}`;
    createDashboard({
      id: newId,
      name: sharedPayload.name,
      description: sharedPayload.description,
      widgets: sharedPayload.widgets,
      tags: sharedPayload.tags ?? [],
      starred: false,
      updatedAt: "just now",
      owner: "You",
    });
    setSharedPayload(null);
    navigate(`/dashboard/${newId}`);
  };

  return (
    <>
      <Header aria-label="OpenCost Platform">
        <HeaderName href="/" prefix="">
          OpenCost
        </HeaderName>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            paddingRight: "1rem",
          }}
        >
          <Button onClick={() => setShowCreateModal(true)} renderIcon={Add} size="sm">
            Create Dashboard
          </Button>
        </div>
      </Header>

      <main style={{ paddingTop: "3rem", minHeight: "100vh", backgroundColor: "#f4f4f4" }}>
        <div style={{ padding: "2rem", maxWidth: "1584px", margin: "0 auto" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "400", marginBottom: "0.5rem" }}>Dashboards</h2>
            <p style={{ color: "#525252", fontSize: "0.875rem" }}>
              Monitor and analyze your cloud infrastructure costs
            </p>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(3, 1fr)",
              marginBottom: "2rem",
            }}
          >
            <div className="metric-card">
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "0.5rem",
                    display: "flex",
                  }}
                >
                  <Dashboard size={20} style={{ color: "#0f62fe" }} />
                </div>
                <span className="metric-label">Total Dashboards</span>
              </div>
              <p className="metric-value">{dashboards.length}</p>
            </div>

            <div className="metric-card">
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#defbe6",
                    borderRadius: "0.5rem",
                    display: "flex",
                  }}
                >
                  <ChartLineSmooth size={20} style={{ color: "#198038" }} />
                </div>
                <span className="metric-label">Total Widgets</span>
              </div>
              <p className="metric-value">
                {dashboards.reduce((acc, d) => acc + d.widgets.length, 0)}
              </p>
            </div>

            <div className="metric-card">
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#bae6ff",
                    borderRadius: "0.5rem",
                    display: "flex",
                  }}
                >
                  <Activity size={20} style={{ color: "#0072c3" }} />
                </div>
                <span className="metric-label">Active Monitoring</span>
              </div>
              <p className="metric-value">Live</p>
            </div>
          </div>

          {/* Dashboard Cards Grid */}
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(3, 1fr)",
            }}
          >
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="card-enhanced"
                onClick={() => navigate(`/dashboard/${dashboard.id}`)}
                style={{ padding: "1.5rem", cursor: "pointer" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      padding: "0.625rem",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "0.5rem",
                      display: "flex",
                    }}
                  >
                    <Dashboard size={20} style={{ color: "#0f62fe" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Tag type="gray" size="sm">
                      {dashboard.widgets.length} widgets
                    </Tag>
                  </div>
                </div>

                <h3 style={{ fontWeight: "600", fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                  {dashboard.name}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "1rem" }}>
                  {dashboard.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e0e0e0",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#8d8d8d" }}>
                    Updated {dashboard.updatedAt}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#8d8d8d" }}>by {dashboard.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showCreateModal && (
        <CreateDashboardModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onDashboardCreated={(id) => {
            setShowCreateModal(false);
            navigate(`/dashboard/${id}`);
          }}
        />
      )}

      <Modal
        open={!!sharedPayload}
        modalHeading="Import Shared Dashboard"
        primaryButtonText="Import Dashboard"
        secondaryButtonText="Dismiss"
        onRequestSubmit={handleImportShared}
        onRequestClose={() => setSharedPayload(null)}
        onSecondarySubmit={() => setSharedPayload(null)}
      >
        {sharedPayload && (
          <div>
            <p style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "#525252" }}>
              Someone shared a dashboard configuration with you. Would you like to import it?
            </p>
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f4f4f4",
                borderLeft: "4px solid #0f62fe",
                marginBottom: "1rem",
              }}
            >
              <p style={{ fontWeight: "600", fontSize: "1rem", marginBottom: "0.25rem" }}>
                {sharedPayload.name}
              </p>
              {sharedPayload.description && (
                <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "0.5rem" }}>
                  {sharedPayload.description}
                </p>
              )}
              <p style={{ fontSize: "0.75rem", color: "#8d8d8d" }}>
                {sharedPayload.widgets.length} widget{sharedPayload.widgets.length !== 1 ? "s" : ""}
                {sharedPayload.tags?.length
                  ? ` · ${sharedPayload.tags.join(", ")}`
                  : ""}
              </p>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#8d8d8d" }}>
              This will be added as a new dashboard in your workspace. No existing dashboards will be affected.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
