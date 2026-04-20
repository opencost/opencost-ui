import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Modal } from "@carbon/react";
import { Search } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router";
import CreateReportModal from "~/components/create-report-modal";
import DashboardAppShell from "~/components/dashboard-app-shell";
import ReportListTable from "~/components/report-list-table";
import { useReport } from "~/components/report-context";
import { normalizeReportQuery, type Report } from "~/types/report";

interface SharedReportPayload {
  name: string;
  description: string;
  tags: string[];
  visibility: "public" | "private";
  favorite?: boolean;
  query: Report["query"];
}

const SEARCH_DEBOUNCE_MS = 300;

function decodeShareParam(encoded: string): SharedReportPayload | null {
  try {
    return JSON.parse(atob(decodeURIComponent(encoded))) as SharedReportPayload;
  } catch {
    return null;
  }
}

export function meta() {
  return [
    { title: "OpenCost — Reports" },
    { name: "description", content: "Cost allocation reports in OpenCost" },
  ];
}

export default function ReportsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [reportPendingDelete, setReportPendingDelete] = useState<Report | null>(null);
  const [sharedPayload, setSharedPayload] = useState<SharedReportPayload | null>(null);
  const [shareFeedback, setShareFeedback] = useState("");
  const { reports, createReport, updateReport, deleteReport } = useReport();

  const searchTerm = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(searchTerm);
  const selectedTag = searchParams.get("tag") ?? "all";
  const selectedVisibility = searchParams.get("visibility") ?? "all";
  const selectedOwner = searchParams.get("owner") ?? "all";

  const allTags = useMemo(
    () => Array.from(new Set(reports.flatMap((report) => report.tags))).sort(),
    [reports],
  );
  const allOwners = useMemo(
    () => Array.from(new Set(reports.map((report) => report.owner))).sort(),
    [reports],
  );

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

  const filteredReports = reports.filter((report) => {
    const normalizedSearch = searchInput.trim().toLowerCase();
    const matchesQuery =
      searchInput.trim().length === 0 ||
      report.name.toLowerCase().includes(normalizedSearch) ||
      report.description.toLowerCase().includes(normalizedSearch) ||
      report.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

    const matchesTag = selectedTag === "all" || report.tags.includes(selectedTag);
    const matchesVisibility =
      selectedVisibility === "all" || report.visibility === selectedVisibility;
    const matchesOwner = selectedOwner === "all" || report.owner === selectedOwner;

    return matchesQuery && matchesTag && matchesVisibility && matchesOwner;
  });

  const updateQueryParam = useCallback(
    (key: "q" | "tag" | "visibility" | "owner", value: string) => {
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
    if (!shareParam) return;
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
  }, [searchParams, setSearchParams]);

  const handleShareReport = async (report: Report) => {
    const payload: SharedReportPayload = {
      name: report.name,
      description: report.description,
      tags: report.tags,
      visibility: report.visibility,
      favorite: report.favorite,
      query: report.query,
    };
    const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
    const shareUrl = `${window.location.origin}/reports?share=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback(`Share link copied for "${report.name}".`);
      window.setTimeout(() => setShareFeedback(""), 2600);
    } catch {
      setShareFeedback("Unable to copy automatically. Please copy from browser URL bar.");
      navigate(`/reports?share=${encoded}`);
    }
  };

  const confirmDelete = () => {
    if (!reportPendingDelete) return;
    deleteReport(reportPendingDelete.id);
    setReportPendingDelete(null);
    if (editingReport?.id === reportPendingDelete.id) {
      setEditingReport(null);
    }
  };

  const handleImportShared = () => {
    if (!sharedPayload) return;
    const now = new Date().toISOString();
    const newReport: Report = {
      id: `report-${Date.now()}`,
      name: sharedPayload.name,
      description: sharedPayload.description,
      tags: sharedPayload.tags ?? [],
      visibility: sharedPayload.visibility ?? "public",
      favorite: sharedPayload.favorite ?? false,
      owner: "You",
      query: normalizeReportQuery(sharedPayload.query),
      createdAt: now,
      updatedAt: now,
    };
    createReport(newReport);
    setSharedPayload(null);
    navigate(`/report/${newReport.id}`);
  };

  return (
    <>
      <DashboardAppShell>
        <main className="min-h-screen bg-[#f4f4f4]">
          <div className="mx-auto max-w-[1600px] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="m-0 text-[2rem] font-normal">Reports</h2>
                {shareFeedback ? (
                  <p className="mt-1 text-xs text-[#198038]">{shareFeedback}</p>
                ) : null}
              </div>
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                Create Report
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
                  value={selectedVisibility}
                  onChange={(event) => updateQueryParam("visibility", event.target.value)}
                  className="h-8 rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#525252]"
                >
                  <option value="all">Filter by Visibility</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
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

              <ReportListTable
                reports={filteredReports}
                totalReportCount={reports.length}
                onEdit={setEditingReport}
                onShare={(report) => void handleShareReport(report)}
                onDelete={setReportPendingDelete}
              />
            </div>
          </div>
        </main>
      </DashboardAppShell>

      <CreateReportModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(report) => {
          createReport(report);
          setShowCreateModal(false);
          navigate(`/report/${report.id}`);
        }}
      />

      <CreateReportModal
        open={!!editingReport}
        onClose={() => setEditingReport(null)}
        reportToEdit={editingReport}
        onUpdate={(id, updates) => updateReport(id, updates)}
      />

      <Modal
        open={!!reportPendingDelete}
        modalHeading="Delete Report"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        danger
        onRequestSubmit={confirmDelete}
        onRequestClose={() => setReportPendingDelete(null)}
        onSecondarySubmit={() => setReportPendingDelete(null)}
      >
        {reportPendingDelete ? (
          <div>
            <p className="mb-3 text-sm text-[#525252]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#161616]">
                {reportPendingDelete.name}
              </span>
              ?
            </p>
            <p className="m-0 text-xs text-[#8d8d8d]">
              This action cannot be undone.
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!sharedPayload}
        modalHeading="Import Shared Report"
        primaryButtonText="Import Report"
        secondaryButtonText="Dismiss"
        onRequestSubmit={handleImportShared}
        onRequestClose={() => setSharedPayload(null)}
        onSecondarySubmit={() => setSharedPayload(null)}
      >
        {sharedPayload ? (
          (() => {
            const q = normalizeReportQuery(sharedPayload.query);
            return (
              <div>
                <p className="mb-4 text-sm text-[#525252]">
                  Someone shared a report configuration with you. Do you want to import it?
                </p>
                <div className="mb-4 border-l-4 border-[#0f62fe] bg-[#f4f4f4] p-4">
                  <p className="mb-1 text-base font-semibold">{sharedPayload.name}</p>
                  {sharedPayload.description ? (
                    <p className="mb-2 text-sm text-[#525252]">
                      {sharedPayload.description}
                    </p>
                  ) : null}
                  <p className="text-xs text-[#8d8d8d]">
                    Measures: {q.measures.join(", ")} · Groupings: {q.groupings.join(", ")}
                  </p>
                </div>
                <p className="text-xs text-[#8d8d8d]">
                  This will be added as a new report in your workspace.
                </p>
              </div>
            );
          })()
        ) : null}
      </Modal>
    </>
  );
}
