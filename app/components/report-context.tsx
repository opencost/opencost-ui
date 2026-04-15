import { createContext, useContext, useEffect, useState } from "react";
import { REPORT_DEFAULT_QUERY, type Report } from "~/types/report";

const STORAGE_KEY = "opencost-reports-v1";

interface ReportContextValue {
  reports: Report[];
  createReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  deleteReport: (id: string) => void;
}

const ReportContext = createContext<ReportContextValue | undefined>(undefined);

function createDefaultReport(id: string, name: string, description: string): Report {
  const now = new Date().toISOString();
  return {
    id,
    name,
    description,
    tags: ["cost"],
    owner: "You",
    visibility: "public",
    favorite: false,
    query: { ...REPORT_DEFAULT_QUERY },
    createdAt: now,
    updatedAt: now,
  };
}

const DEFAULT_REPORTS: Report[] = [
  createDefaultReport(
    "report-1",
    "Namespace Cost Trend",
    "Track total allocation cost by namespace over time",
  ),
  createDefaultReport(
    "report-2",
    "Cluster Cost Breakdown",
    "Compare total costs across clusters for the selected window",
  ),
];

function loadReportsFromStorage(): Report[] {
  try {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored) as Report[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((report) => ({
          ...report,
          favorite: report.favorite ?? false,
          query: {
            ...REPORT_DEFAULT_QUERY,
            ...report.query,
          },
        }));
      }
    }
  } catch {
    // Fallback to defaults on parse or access errors.
  }
  return DEFAULT_REPORTS;
}

function saveReportsToStorage(reports: Report[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    }
  } catch {
    // Ignore storage write errors.
  }
}

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>(DEFAULT_REPORTS);

  useEffect(() => {
    setReports(loadReportsFromStorage());
  }, []);

  const createReport = (report: Report) => {
    setReports((prev) => {
      const next = [...prev, report];
      saveReportsToStorage(next);
      return next;
    });
  };

  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports((prev) => {
      const next = prev.map((report) =>
        report.id === id
          ? {
              ...report,
              ...updates,
              query: updates.query
                ? { ...report.query, ...updates.query }
                : report.query,
              updatedAt: new Date().toISOString(),
            }
          : report,
      );
      saveReportsToStorage(next);
      return next;
    });
  };

  const deleteReport = (id: string) => {
    setReports((prev) => {
      const next = prev.filter((report) => report.id !== id);
      saveReportsToStorage(next);
      return next;
    });
  };

  return (
    <ReportContext.Provider
      value={{ reports, createReport, updateReport, deleteReport }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReport must be used within ReportProvider");
  }
  return context;
}
