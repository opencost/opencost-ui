import { createContext, useContext, useState } from "react";

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

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([
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
  ]);

  const createDashboard = (dashboard: Dashboard) => {
    setDashboards((prev) => [...prev, dashboard]);
  };

  const deleteDashboard = (id: string) => {
    setDashboards((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDashboard = (id: string, updates: Partial<Dashboard>) => {
    setDashboards((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
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
