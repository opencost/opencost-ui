import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "opencost-dashboards-v2";
export const DEFAULT_DASHBOARD_ID = "1";

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

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
  createdAt?: string;
  updatedAt: string;
  owner: string;
}

function newWidgetId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `widget-${crypto.randomUUID()}`;
  }
  return `widget-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Deep-clone a dashboard for duplication (new ids, no shared widget references). */
function cloneDashboardDeep(
  source: Dashboard,
  newDashboardId: string,
): Dashboard {
  const now = new Date().toISOString();
  const tagsWithoutDefault = source.tags.filter(
    (tag) => tag.toLowerCase() !== "default",
  );
  return {
    id: newDashboardId,
    name: `Copy of ${source.name}`,
    description: source.description,
    widgets: source.widgets.map((widget) => ({
      ...widget,
      id: newWidgetId(),
    })),
    tags: tagsWithoutDefault,
    starred: false,
    createdAt: now,
    updatedAt: now,
    owner: "You",
  };
}

export function getDefaultDashboard(
  dashboards: Dashboard[],
): Dashboard | undefined {
  if (dashboards.length === 0) {
    return undefined;
  }

  const starredDashboard = dashboards.find((dashboard) => dashboard.starred);
  if (starredDashboard) {
    return starredDashboard;
  }

  const taggedDefault = dashboards.find((dashboard) =>
    dashboard.tags.some((tag) => tag.toLowerCase() === "default"),
  );
  if (taggedDefault) {
    return taggedDefault;
  }

  const idMatch = dashboards.find(
    (dashboard) => dashboard.id === DEFAULT_DASHBOARD_ID,
  );
  return idMatch ?? dashboards[0];
}

interface DashboardContextValue {
  dashboards: Dashboard[];
  createDashboard: (dashboard: Dashboard) => void;
  duplicateDashboard: (id: string) => string | null;
  deleteDashboard: (id: string) => void;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined,
);

const DEFAULT_DASHBOARDS: Dashboard[] = [
  {
    id: DEFAULT_DASHBOARD_ID,
    name: "Default Dashboard",
    description: "Overall cloud cost analysis",
    widgets: [
      { id: "1", type: "summary-cards", title: "Cost Summary", gridSize: "4" },
      {
        id: "2",
        type: "cost-allocation-chart",
        title: "Cost Allocation",
        gridSize: "4",
      },
      {
        id: "3",
        type: "cost-allocation-table",
        title: "Cost Breakdown Table",
        gridSize: "4",
      },
      {
        id: "4",
        type: "cloud-costs-chart",
        title: "Cloud Costs",
        gridSize: "4",
      },
    ],
    tags: ["default"],
    starred: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: "You",
  },
  {
    id: "2",
    name: "Allocations",
    description:
      "Cost allocation breakdown by cluster, namespace, and workload",
    widgets: [
      {
        id: "1",
        type: "cost-allocation-chart",
        title: "Cost Allocation",
        gridSize: "4",
      },
      {
        id: "2",
        type: "cost-allocation-table",
        title: "Allocation Breakdown Table",
        gridSize: "4",
      },
    ],
    tags: ["allocations"],
    starred: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: "You",
  },
  {
    id: "3",
    name: "Cloud Cost",
    description: "Cloud infrastructure spend and service-level cost breakdown",
    widgets: [
      {
        id: "1",
        type: "cloud-costs-chart",
        title: "Cloud Costs Chart",
        gridSize: "4",
      },
      {
        id: "2",
        type: "cloud-costs-table",
        title: "Cloud Costs Table",
        gridSize: "4",
      },
    ],
    tags: ["cloud"],
    starred: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: "You",
  },
  {
    id: "4",
    name: "Infra Assets",
    description:
      "Infrastructure asset costs, utilization, and carbon emissions",
    widgets: [
      {
        id: "1",
        type: "assets-visualization",
        title: "Infrastructure Assets",
        gridSize: "4",
      },
    ],
    tags: ["infrastructure"],
    starred: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: "You",
  },
];

function loadDashboardsFromStorage(): Dashboard[] {
  try {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored) as Dashboard[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((dashboard) => ({
          ...dashboard,
          createdAt: dashboard.createdAt ?? dashboard.updatedAt,
        }));
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
  } catch {}
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

  const duplicateDashboard = (id: string): string | null => {
    const createdId: { current: string | null } = { current: null };
    setDashboards((prev) => {
      const source = prev.find((d) => d.id === id);
      if (!source) return prev;
      const dashboardId = `dashboard-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      createdId.current = dashboardId;
      const copy = cloneDashboardDeep(source, dashboardId);
      const next = [...prev, copy];
      saveDashboardsToStorage(next);
      return next;
    });
    return createdId.current;
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
      const next = prev.map((d) =>
        d.id === id
          ? { ...d, ...updates, updatedAt: new Date().toISOString() }
          : d,
      );
      saveDashboardsToStorage(next);
      return next;
    });
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboards,
        createDashboard,
        duplicateDashboard,
        deleteDashboard,
        updateDashboard,
      }}
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
