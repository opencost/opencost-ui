import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button, Header, HeaderName, Tag, Modal } from "@carbon/react";
import { Add, Dashboard, ChartLineSmooth, Activity } from "@carbon/icons-react";
import { useDashboard, timeAgo, type Widget } from "~/components/dashboard-context";
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
      updatedAt: new Date().toISOString(),
      owner: "You",
    });
    setSharedPayload(null);
    navigate(`/dashboard/${newId}`);
  };

  return (
    <>
      <Header aria-label="OpenCost Platform">
        <HeaderName href="/" prefix="">
          <img src="/logo.png" alt="OpenCost" className="h-6" />
        </HeaderName>
        <div className="ml-auto flex items-center pr-4">
          <Button onClick={() => setShowCreateModal(true)} renderIcon={Add} size="sm">
            Create Dashboard
          </Button>
        </div>
      </Header>

      <main className="pt-12 min-h-screen bg-[#f4f4f4]">
        <div className="p-8 max-w-[1584px] mx-auto">
          <div className="mb-8">
            <h2 className="text-[2rem] font-normal mb-2">Dashboards</h2>
            <p className="text-[#525252] text-sm">
              Monitor and analyze your cloud infrastructure costs
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-3 mb-8">
            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#e0e0e0] rounded-lg flex">
                  <Dashboard size={20} style={{ color: "#0f62fe" }} />
                </div>
                <span className="metric-label">Total Dashboards</span>
              </div>
              <p className="metric-value">{dashboards.length}</p>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#defbe6] rounded-lg flex">
                  <ChartLineSmooth size={20} style={{ color: "#198038" }} />
                </div>
                <span className="metric-label">Total Widgets</span>
              </div>
              <p className="metric-value">
                {dashboards.reduce((acc, d) => acc + d.widgets.length, 0)}
              </p>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#bae6ff] rounded-lg flex">
                  <Activity size={20} style={{ color: "#0072c3" }} />
                </div>
                <span className="metric-label">Active Monitoring</span>
              </div>
              <p className="metric-value">Live</p>
            </div>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="grid gap-4 grid-cols-3">
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="card-enhanced p-6 cursor-pointer"
                onClick={() => navigate(`/dashboard/${dashboard.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-[0.625rem] bg-[#e0e0e0] rounded-lg flex">
                    <Dashboard size={20} style={{ color: "#0f62fe" }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag type="gray" size="sm">
                      {dashboard.widgets.length} widgets
                    </Tag>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">
                  {dashboard.name}
                </h3>
                <p className="text-sm text-[#525252] mb-4">
                  {dashboard.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[#e0e0e0]">
                  <span className="text-xs text-[#8d8d8d]">
                    Updated {timeAgo(dashboard.updatedAt)}
                  </span>
                  <span className="text-xs text-[#8d8d8d]">by {dashboard.owner}</span>
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
            <p className="mb-4 text-sm text-[#525252]">
              Someone shared a dashboard configuration with you. Would you like to import it?
            </p>
            <div className="p-4 bg-[#f4f4f4] border-l-4 border-[#0f62fe] mb-4">
              <p className="font-semibold text-base mb-1">
                {sharedPayload.name}
              </p>
              {sharedPayload.description && (
                <p className="text-sm text-[#525252] mb-2">
                  {sharedPayload.description}
                </p>
              )}
              <p className="text-xs text-[#8d8d8d]">
                {sharedPayload.widgets.length} widget{sharedPayload.widgets.length !== 1 ? "s" : ""}
                {sharedPayload.tags?.length
                  ? ` · ${sharedPayload.tags.join(", ")}`
                  : ""}
              </p>
            </div>
            <p className="text-xs text-[#8d8d8d]">
              This will be added as a new dashboard in your workspace. No existing dashboards will be affected.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
