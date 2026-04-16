import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button, Tag, Modal } from "@carbon/react";
import { Add, Dashboard, ChartLineSmooth, Activity } from "@carbon/icons-react";
import {
  useDashboard,
  timeAgo,
  type Widget,
} from "~/components/dashboard-context";
import CreateDashboardModal from "~/components/create-dashboard-modal";
import AppHeader from "~/components/app-header";

interface SharedDashboardPayload {
  name: string;
  description: string;
  widgets: Widget[];
  tags: string[];
}

function decodeShareParam(encoded: string): SharedDashboardPayload | null {
  try {
    return JSON.parse(
      atob(decodeURIComponent(encoded)),
    ) as SharedDashboardPayload;
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
  const [sharedPayload, setSharedPayload] =
    useState<SharedDashboardPayload | null>(null);
  const { dashboards, createDashboard } = useDashboard();

  useEffect(() => {
    const shareParam = searchParams.get("share");
    if (shareParam) {
      const decoded = decodeShareParam(shareParam);
      if (decoded) setSharedPayload(decoded);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("share");
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

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
      <AppHeader>
        <div className="flex items-center pr-4">
          <Button
            onClick={() => setShowCreateModal(true)}
            renderIcon={Add}
            size="sm"
          >
            Create Dashboard
          </Button>
        </div>
      </AppHeader>

      <main className="pt-12 min-h-screen bg-[var(--cds-background)]">
        <div className="p-8 max-w-[1584px] mx-auto">
          <div className="mb-8">
            <h2 className="text-[2rem] font-normal mb-2">Dashboards</h2>
            <p className="text-[var(--cds-text-secondary)] text-sm">
              Monitor and analyze your cloud infrastructure costs
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-3 mb-8">
            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[var(--cds-layer-accent)] rounded-lg flex">
                  <Dashboard
                    size={20}
                    style={{ color: "var(--cds-icon-interactive)" }}
                  />
                </div>
                <span className="metric-label">Total Dashboards</span>
              </div>
              <p className="metric-value">{dashboards.length}</p>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[var(--cds-layer-accent)] rounded-lg flex">
                  <ChartLineSmooth
                    size={20}
                    style={{ color: "var(--cds-support-success)" }}
                  />
                </div>
                <span className="metric-label">Total Widgets</span>
              </div>
              <p className="metric-value">
                {dashboards.reduce((acc, d) => acc + d.widgets.length, 0)}
              </p>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[var(--cds-layer-accent)] rounded-lg flex">
                  <Activity
                    size={20}
                    style={{ color: "var(--cds-support-info)" }}
                  />
                </div>
                <span className="metric-label">Active Monitoring</span>
              </div>
              <p className="metric-value">Live</p>
            </div>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="grid gap-4 grid-cols-3">
            {dashboards.map((dashboard) => (
              <Link
                key={dashboard.id}
                to={`/dashboard/${dashboard.id}`}
                className="card-enhanced p-6 cursor-pointer block no-underline text-inherit hover:no-underline focus:no-underline"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-[0.625rem] bg-[var(--cds-layer-accent)] rounded-lg flex">
                    <Dashboard
                      size={20}
                      style={{ color: "var(--cds-icon-interactive)" }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag type="gray" size="sm">
                      {dashboard.widgets.length} widgets
                    </Tag>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">{dashboard.name}</h3>
                <p className="text-sm text-[var(--cds-text-secondary)] mb-4">
                  {dashboard.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--cds-border-subtle)]">
                  <span className="text-xs text-[var(--cds-text-placeholder)]">
                    Updated {timeAgo(dashboard.updatedAt)}
                  </span>
                  <span className="text-xs text-[var(--cds-text-placeholder)]">
                    by {dashboard.owner}
                  </span>
                </div>
              </Link>
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
            <p className="mb-4 text-sm text-[var(--cds-text-secondary)]">
              Someone shared a dashboard configuration with you. Would you like
              to import it?
            </p>
            <div className="p-4 bg-[var(--cds-layer-accent)] border-l-4 border-[var(--cds-focus)] mb-4">
              <p className="font-semibold text-base mb-1">
                {sharedPayload.name}
              </p>
              {sharedPayload.description && (
                <p className="text-sm text-[var(--cds-text-secondary)] mb-2">
                  {sharedPayload.description}
                </p>
              )}
              <p className="text-xs text-[var(--cds-text-placeholder)]">
                {sharedPayload.widgets.length} widget
                {sharedPayload.widgets.length !== 1 ? "s" : ""}
                {sharedPayload.tags?.length
                  ? ` · ${sharedPayload.tags.join(", ")}`
                  : ""}
              </p>
            </div>
            <p className="text-xs text-[var(--cds-text-placeholder)]">
              This will be added as a new dashboard in your workspace. No
              existing dashboards will be affected.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
