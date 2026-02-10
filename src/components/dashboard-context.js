'use client';

import { createContext, useContext, useState } from 'react';

const DashboardContext = createContext(undefined);

export function DashboardProvider({ children }) {
  const [dashboards, setDashboards] = useState([
    {
      id: '1',
      name: 'Default Dashboard',
      description: 'Overall cloud cost analysis',
      widgets: [
        { id: '1', type: 'summary-cards', title: 'Cost Summary', gridSize: '4' },
        { id: '6', type: 'assets-visualization', title: 'Infrastructure Assets', gridSize: '4' },
      ],
      tags: ['default'],
      starred: true,
      updatedAt: '2 hours ago',
      owner: 'You',
    },
  ]);

  const createDashboard = (dashboard) => {
    setDashboards((prev) => [...prev, dashboard]);
  };

  const deleteDashboard = (id) => {
    setDashboards((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDashboard = (id, updates) => {
    setDashboards((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  return (
    <DashboardContext.Provider value={{ dashboards, createDashboard, deleteDashboard, updateDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
