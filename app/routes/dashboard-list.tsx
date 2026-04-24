import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button, Modal, Tag } from "@carbon/react";
import {
  Search,
  StarBorder,
  Star,
  EditOutlined,
  ContentCopy,
  IosShareOutlined,
  DeleteOutline,
} from "@mui/icons-material";
import {
  useDashboard,
  type Dashboard,
  type Widget,
} from "~/components/dashboard-context";
import CreateDashboardModal from "~/components/create-dashboard-modal";
import DashboardAppShell from "~/components/dashboard-app-shell";
import { decodeSharePayload, encodeSharePayload } from "~/lib/share-encoding";

const SEARCH_DEBOUNCE_MS = 300;

interface SharedDashboardPayload {
  name: string;
  description: string;
  widgets: Widget[];
  tags: string[];
}

function decodeShareParam(encoded: string): SharedDashboardPayload | null {
  try {
    const payload = decodeSharePayload(encoded);
    if (!payload || typeof payload !== "object") return null;

    const record = payload as Record<string, unknown>;
    const widgets = Array.isArray(record.widgets)
      ? record.widgets.filter((widget): widget is Widget => {
          if (!widget || typeof widget !== "object") return false;
          const candidate = widget as Record<string, unknown>;
          return (
            typeof candidate.id === "string" &&
            typeof candidate.type === "string" &&
            typeof candidate.title === "string" &&
            typeof candidate.gridSize === "string"
          );
        })
      : [];

    return {
      name:
        typeof record.name === "string" && record.name.trim().length > 0
          ? record.name
          : "Shared Dashboard",
      description: typeof record.description === "string" ? record.description : "",
      widgets,
      tags: Array.isArray(record.tags)
        ? record.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
    };
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
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [dashboardPendingDelete, setDashboardPendingDelete] =
    useState<Dashboard | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string>("");
  const [sharedPayload, setSharedPayload] =
    useState<SharedDashboardPayload | null>(null);
  const { dashboards, createDashboard, duplicateDashboard, deleteDashboard } =
    useDashboard();
  const searchTerm = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(searchTerm);
  const selectedTag = searchParams.get("tag") ?? "all";
  const selectedScope = searchParams.get("scope") ?? "all";
  const selectedOwner = searchParams.get("owner") ?? "all";

  const allTags = Array.from(new Set(dashboards.flatMap((d) => d.tags))).sort();
  const allOwners = Array.from(new Set(dashboards.map((d) => d.owner))).sort();

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchParams(
        (prev) => {
          const prevQ = prev.get("q") ?? "";
          if (prevQ === searchInput) return prev;
          const next = new URLSearchParams(prev);
          if (searchInput.length === 0) {
            next.delete("q");
          } else {
            next.set("q", searchInput);
          }
          return next;
        },
        { replace: true },
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  const filteredDashboards = dashboards.filter((dashboard) => {
    const q = searchInput.trim().toLowerCase();
    const matchesQuery =
      searchInput.trim().length === 0 ||
      dashboard.name.toLowerCase().includes(q) ||
      dashboard.description.toLowerCase().includes(q) ||
      dashboard.tags.some((tag) => tag.toLowerCase().includes(q));

    const matchesTag =
      selectedTag === "all" || dashboard.tags.includes(selectedTag);
    const matchesOwner = selectedOwner === "all" || dashboard.owner === selectedOwner;
    const scopeValue = dashboard.starred ? "opencost" : "public";
    const matchesScope = selectedScope === "all" || selectedScope === scopeValue;

    return matchesQuery && matchesTag && matchesOwner && matchesScope;
  });

  const updateQueryParam = useCallback(
    (key: "q" | "tag" | "scope" | "owner", value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value.length === 0 || value === "all") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: "You",
    });
    setSharedPayload(null);
    navigate(`/dashboard/${newId}`);
  };

  const handleShareDashboard = async (dashboard: Dashboard) => {
    if (typeof window === "undefined") return;

    const sharePayload: SharedDashboardPayload = {
      name: dashboard.name,
      description: dashboard.description,
      widgets: dashboard.widgets,
      tags: dashboard.tags,
    };
    const encoded = encodeSharePayload(sharePayload);
    const shareUrl = `${window.location.origin}/dashboards?share=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback(`Share link copied for "${dashboard.name}".`);
      window.setTimeout(() => setShareFeedback(""), 2600);
    } catch {
      setShareFeedback("Unable to copy automatically. Please copy from browser URL bar.");
      navigate(`/dashboards?share=${encoded}`);
    }
  };

  const handleDeleteDashboard = (dashboard: Dashboard) => {
    setDashboardPendingDelete(dashboard);
  };

  const handleDuplicateDashboard = (dashboard: Dashboard) => {
    const newId = duplicateDashboard(dashboard.id);
    if (newId) navigate(`/dashboard/${newId}`);
  };

  const confirmDeleteDashboard = () => {
    if (!dashboardPendingDelete) return;
    deleteDashboard(dashboardPendingDelete.id);
    if (editingDashboard?.id === dashboardPendingDelete.id) {
      setEditingDashboard(null);
    }
    setDashboardPendingDelete(null);
  };

  return (
    <>
      <DashboardAppShell>
        <main className="min-h-screen bg-[#f4f4f4]">
          <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="m-0 text-[2rem] font-normal">Dashboards</h2>
                {shareFeedback ? (
                  <p className="mt-1 text-xs text-[#198038]">{shareFeedback}</p>
                ) : null}
              </div>
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                Create Dashboard
              </Button>
            </div>

            <div className="mb-4 overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
              <div className="grid grid-cols-[minmax(220px,1fr)_180px_180px_200px] items-center gap-2.5 border-b border-[#e0e0e0] bg-[#f8f8f8] p-3">
                <div className="flex h-8 items-center gap-1.5 rounded border border-[#d0d0d0] bg-white px-2 text-[#8d8d8d]">
                  <Search fontSize="small" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search"
                    className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#262626] outline-none"
                  />
                </div>
                <select
                  value={selectedTag}
                  onChange={(event) => updateQueryParam("tag", event.target.value)}
                  className="h-8 rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#525252]"
                >
                  <option value="all">Filter by Tag</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedScope}
                  onChange={(event) => updateQueryParam("scope", event.target.value)}
                  className="h-8 rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#525252]"
                >
                  <option value="all">Filter by scope</option>
                  <option value="opencost">OpenCost</option>
                  <option value="public">Public</option>
                </select>
                <select
                  value={selectedOwner}
                  onChange={(event) => updateQueryParam("owner", event.target.value)}
                  className="h-8 rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#525252]"
                >
                  <option value="all">Filter by Created By</option>
                  {allOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>

              {filteredDashboards.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-8 px-3 py-2.5 text-left text-xs font-semibold text-[#525252]" />
                      <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
                        Name
                      </th>
                      <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
                        Created By
                      </th>
                      <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
                        Created On
                      </th>
                      <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
                        Time Last Modified
                      </th>
                      <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
                        Visibility
                      </th>
                      <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
                        Tags
                      </th>
                      <th className="min-w-[10.5rem] whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold text-[#525252]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDashboards.map((dashboard) => {
                      const createdOn = new Date(
                        dashboard.createdAt ?? dashboard.updatedAt,
                      ).toLocaleDateString();
                      const modifiedOn = new Date(dashboard.updatedAt).toLocaleString();
                      const visibility = dashboard.starred ? "OpenCost" : "Public";
                      return (
                        <tr key={dashboard.id} className="border-t border-[#f0f0f0] hover:bg-[#fcfcfc]">
                          <td className="w-8 px-3 py-2.5 text-center align-middle">
                            {dashboard.starred ? (
                              <Star fontSize="small" className="text-[#f1c21b]" />
                            ) : (
                              <StarBorder fontSize="small" className="text-[#8d8d8d]" />
                            )}
                          </td>
                          <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                            <Link
                              to={`/dashboard/${dashboard.id}`}
                              className="text-[#262626] no-underline hover:text-[#0f62fe]"
                            >
                              {dashboard.name}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                            {dashboard.owner}
                          </td>
                          <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                            {createdOn}
                          </td>
                          <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                            {modifiedOn}
                          </td>
                          <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                            <span
                              className={`rounded-[10px] px-2 py-0.5 text-[11px] font-semibold ${
                                visibility === "Public"
                                  ? "bg-[#defbe6] text-[#198038]"
                                  : "bg-[#edf5ff] text-[#0f62fe]"
                              }`}
                            >
                              {visibility}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                            <div className="flex items-center gap-1 flex-wrap">
                              {dashboard.tags.length > 0 ? (
                                dashboard.tags.slice(0, 3).map((tag) => (
                                  <Tag key={tag} type="gray" size="sm">
                                    {tag}
                                  </Tag>
                                ))
                              ) : (
                                <span className="text-[#8d8d8d]">--</span>
                              )}
                            </div>
                          </td>
                          <td className="min-w-[10.5rem] whitespace-nowrap px-3 py-2.5 text-right align-middle">
                            <button
                              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border border-[#d0d0d0] bg-white text-[#525252] hover:border-[#0f62fe] hover:text-[#0f62fe]"
                              aria-label="Edit dashboard"
                              title="Edit dashboard details"
                              onClick={() => setEditingDashboard(dashboard)}
                            >
                              <EditOutlined fontSize="small" />
                            </button>
                            <button
                              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border border-[#d0d0d0] bg-white text-[#525252] hover:border-[#0f62fe] hover:text-[#0f62fe]"
                              aria-label="Duplicate dashboard"
                              title="Duplicate dashboard"
                              onClick={() => handleDuplicateDashboard(dashboard)}
                            >
                              <ContentCopy fontSize="small" />
                            </button>
                            <button
                              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border border-[#d0d0d0] bg-white text-[#525252] hover:border-[#0f62fe] hover:text-[#0f62fe]"
                              aria-label="Share dashboard"
                              title="Share dashboard"
                              onClick={() => void handleShareDashboard(dashboard)}
                            >
                              <IosShareOutlined fontSize="small" />
                            </button>
                            <button
                              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border border-[#d0d0d0] bg-white text-[#525252] hover:border-[#da1e28] hover:text-[#da1e28]"
                              aria-label="Delete dashboard"
                              title="Delete dashboard"
                              onClick={() => handleDeleteDashboard(dashboard)}
                            >
                              <DeleteOutline fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-sm text-[#6f6f6f]">
                  No dashboards match the selected search and filters.
                </div>
              )}
            </div>
          </div>
        </main>
      </DashboardAppShell>

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
      {editingDashboard && (
        <CreateDashboardModal
          open={!!editingDashboard}
          onClose={() => setEditingDashboard(null)}
          dashboardToEdit={editingDashboard}
          onDashboardUpdated={() => setEditingDashboard(null)}
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

      <Modal
        open={!!dashboardPendingDelete}
        modalHeading="Delete Dashboard"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        danger
        onRequestSubmit={confirmDeleteDashboard}
        onRequestClose={() => setDashboardPendingDelete(null)}
        onSecondarySubmit={() => setDashboardPendingDelete(null)}
      >
        {dashboardPendingDelete ? (
          <div>
            <p className="mb-3 text-sm text-[#525252]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#161616]">
                {dashboardPendingDelete.name}
              </span>
              ?
            </p>
            <p className="m-0 text-xs text-[#8d8d8d]">
              This action cannot be undone.
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
