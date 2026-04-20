import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { ArrowLeft } from "@carbon/icons-react";
import { useNavigate, useParams } from "react-router";
import { Star, StarBorder } from "@mui/icons-material";
import DashboardAppShell from "~/components/dashboard-app-shell";
import ReportBuilderSidePanel from "~/components/report-builder-side-panel";
import ReportResultsView from "~/components/report-results-view";
import { useReport } from "~/components/report-context";
import { runReport, type ReportRunResult } from "~/services/report-query";
import { normalizeReportQuery, type Report } from "~/types/report";

export function meta() {
  return [{ title: "OpenCost — Report Builder" }];
}

function escapeCsvField(value: string | number | null | undefined): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function ReportBuilderPage() {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const { reports, updateReport, createReport, deleteReport } = useReport();
  const report = useMemo(
    () => reports.find((candidate) => candidate.id === reportId),
    [reports, reportId],
  );
  const [draft, setDraft] = useState<Report | null>(null);
  const [running, setRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [runError, setRunError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportRunResult | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!report) return;
    setDraft(report);
    setResult(null);
    setRunError(null);
  }, [report]);

  const executeRun = useCallback(async (targetReport: Report) => {
    setRunning(true);
    setRunError(null);
    try {
      const next = await runReport(targetReport);
      setResult(next);
    } catch (error: any) {
      setRunError(error?.message || "Unable to run report.");
      setResult(null);
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    if (!autoRun || !draft) return;
    const timer = window.setTimeout(() => {
      void executeRun(draft);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [autoRun, draft && JSON.stringify(draft.query), executeRun]);

  if (!report || !draft) {
    return (
      <DashboardAppShell>
        <main className="p-[4rem_2rem] text-center">
          <h2 className="mb-4 text-2xl font-semibold">Report not found</h2>
          <p className="mb-6 text-[#525252]">
            The report you are looking for does not exist.
          </p>
          <Button onClick={() => navigate("/reports")}>Back to Reports</Button>
        </main>
      </DashboardAppShell>
    );
  }

  const currentReport = report;
  const currentDraft = draft;

  const pushFeedback = (message: string) => {
    setActionFeedback(message);
    window.setTimeout(() => setActionFeedback(null), 2600);
  };

  const handleSave = () => {
    updateReport(currentReport.id, {
      name: currentDraft.name,
      description: currentDraft.description,
      tags: currentDraft.tags,
      visibility: currentDraft.visibility,
      favorite: currentDraft.favorite,
      query: currentDraft.query,
    });
    pushFeedback("Report saved.");
  };

  const handleSaveAsCopy = () => {
    const now = new Date().toISOString();
    const copyId = `report-${Date.now()}`;
    const copy: Report = {
      ...currentDraft,
      id: copyId,
      name: `${currentDraft.name} (Copy)`,
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    createReport(copy);
    pushFeedback("Report copied.");
    navigate(`/report/${copyId}`);
  };

  const handleToggleFavorite = () => {
    const next = !currentDraft.favorite;
    handleUpdateDraft({ favorite: next });
    updateReport(currentReport.id, { favorite: next });
    pushFeedback(next ? "Added to favorites." : "Removed from favorites.");
  };

  const handleExport = () => {
    if (!result) {
      pushFeedback("Run report before exporting.");
      return;
    }

    const rowsForCsv: Array<{ name: string; value: number }> =
      result.layer === "allocation"
        ? result.rows.map((row) => ({ name: row.name, value: row.measureValue }))
        : result.layer === "cloudCost"
          ? result.rows.map((row) => ({ name: row.name, value: row.cost }))
          : result.layer === "externalCost"
            ? result.rows.map((row) => ({ name: row.name, value: row.cost }))
            : result.assets.map((asset) => ({ name: asset.name, value: asset.totalCost }));

    if (rowsForCsv.length === 0) {
      pushFeedback("Run report before exporting.");
      return;
    }

    const firstColumnLabel =
      result.layer === "allocation"
        ? result.groupingLabel
        : result.layer === "cloudCost"
          ? result.groupingLabel
          : result.layer === "externalCost"
            ? result.groupingLabel
            : "Asset";
    const secondColumnLabel =
      result.layer === "allocation"
        ? result.measureLabel
        : result.layer === "cloudCost"
          ? result.metricLabel
          : result.layer === "externalCost"
            ? "Cost"
            : "Total Cost";

    const header = [escapeCsvField(firstColumnLabel), escapeCsvField(secondColumnLabel)].join(",");
    const body = rowsForCsv
      .map((row) => [escapeCsvField(row.name), escapeCsvField(row.value)].join(","))
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${currentDraft.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 0);
    pushFeedback("Export started.");
  };

  const handleDelete = () => {
    deleteReport(currentReport.id);
    navigate("/reports");
  };

  const handleUpdateDraft = (updates: Partial<Report>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updates,
        query: updates.query ? normalizeReportQuery(updates.query) : prev.query,
      };
    });
  };

  return (
    <DashboardAppShell>
      <main className="min-h-screen bg-[#f4f4f4]">
        <div className="mx-auto max-w-[1600px] px-6 pb-6 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                kind="ghost"
                size="sm"
                onClick={() => navigate("/reports")}
                iconDescription="Back to reports"
              >
                <ArrowLeft className="mr-[0.375rem]" />
                Back to Reports
              </Button>
              <div>
                <h1 className="m-0 text-[2rem] font-normal text-[#262626]">
                  {currentDraft.name}
                </h1>
                <p className="m-0 mt-1 text-sm text-[#525252]">
                  {currentDraft.description}
                </p>
                {actionFeedback ? (
                  <p className="m-0 mt-1 text-xs text-[#198038]">{actionFeedback}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" kind="ghost" onClick={handleSaveAsCopy}>
                Save As Copy
              </Button>
              <Button
                size="sm"
                kind="ghost"
                onClick={handleToggleFavorite}
                renderIcon={currentDraft.favorite ? Star : StarBorder}
              >
                Favorite
              </Button>
              <Button size="sm" kind="ghost" onClick={handleExport}>
                Export
              </Button>
              <OverflowMenu flipped size="sm" iconDescription="More actions">
                <OverflowMenuItem
                  itemText="Create New Report"
                  onClick={() => navigate("/reports")}
                />
                <OverflowMenuItem itemText="Edit Details" onClick={() => navigate("/reports")} />
                <OverflowMenuItem itemText="Delete Report" isDelete onClick={handleDelete} />
                {/* <OverflowMenuItem
                  itemText="Subscribe to Report"
                />
                <OverflowMenuItem
                  itemText="Export PDF"
                /> */}
              </OverflowMenu>
            </div>
          </div>

          <div className="flex min-h-[70vh] overflow-hidden rounded border border-[#e0e0e0] bg-white">
            <section className="min-h-[70vh] min-w-0 flex-1 bg-[#f8fafb] p-4">
              <ReportResultsView
                result={result}
                loading={running}
                error={runError}
                query={currentDraft.query}
              />
            </section>
            <ReportBuilderSidePanel
              report={currentDraft}
              onUpdate={handleUpdateDraft}
              onRun={() => void executeRun(currentDraft)}
              isRunning={running}
              autoRun={autoRun}
              onAutoRunChange={setAutoRun}
            />
          </div>
        </div>
      </main>
    </DashboardAppShell>
  );
}
