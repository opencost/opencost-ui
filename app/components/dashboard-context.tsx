import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "opencost-dashboards";

export interface Widget {
  id: string;
  type: string;
  title: string;
  gridSize: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  tags: string[];
  starred: boolean;
  updatedAt: string;
  owner: string;
}

interface DashboardContextValue {
  dashboards: Dashboard[];
  createDashboard: (dashboard: Dashboard) => void;
  deleteDashboard: (id: string) => void;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined
);

const DEFAULT_DASHBOARDS: Dashboard[] = [
  {
    id: "1",
    name: "Default Dashboard",
    description: "Overall cloud cost analysis",
    widgets: [
      { id: "1", type: "summary-cards", title: "Cost Summary", gridSize: "4" },
      { id: "2", type: "cost-allocation-chart", title: "Cost Allocation", gridSize: "4" },
      { id: "3", type: "cost-table", title: "Cost Breakdown Table", gridSize: "4" },
      { id: "4", type: "cloud-costs-chart", title: "Cloud Costs", gridSize: "4" },
    ],
    tags: ["default"],
    starred: true,
    updatedAt: "2 hours ago",
    owner: "You",
  },
];

function loadDashboardsFromStorage(): Dashboard[] {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored) as Dashboard[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Invalid JSON or other error - fall back to default
  }
  return DEFAULT_DASHBOARDS;
}

function saveDashboardsToStorage(dashboards: Dashboard[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
    }
  } catch {
  }
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboards, setDashboards] = useState<Dashboard[]>(DEFAULT_DASHBOARDS);

  useEffect(() => {
    setDashboards(loadDashboardsFromStorage());
  }, []);

  const createDashboard = (dashboard: Dashboard) => {
    setDashboards((prev) => {
      const next = [...prev, dashboard];
      saveDashboardsToStorage(next);
      return next;
    });
  };

  const deleteDashboard = (id: string) => {
    setDashboards((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDashboardsToStorage(next);
      return next;
    });
  };

  const updateDashboard = (id: string, updates: Partial<Dashboard>) => {
    setDashboards((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...updates } : d));
      saveDashboardsToStorage(next);
      return next;
    });
  };

  return (
    <DashboardContext.Provider
      value={{ dashboards, createDashboard, deleteDashboard, updateDashboard }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
