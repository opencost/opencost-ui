'use client';

import { useState } from 'react';
import { Button, Header, HeaderName, Tile, Tag } from '@carbon/react';
import { Add, Dashboard, ChartLineSmooth, Activity } from '@carbon/icons-react';
import DashboardView from '@/components/dashboard-view';
import CreateDashboardModal from '@/components/create-dashboard-modal';
import { DashboardProvider, useDashboard } from '@/components/dashboard-context';

function DashboardContent() {
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { dashboards, updateDashboard } = useDashboard();

  const currentDashboard = dashboards.find((d) => d.id === selectedDashboard);

  const handleUpdateWidgets = (dashboardId, newWidgets) => {
    updateDashboard(dashboardId, { widgets: newWidgets });
  };

  return (
    <>
      <Header aria-label="OpenCost Platform">
        <HeaderName href="#" prefix="">
          OpenCost
        </HeaderName>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '1rem' }}>
          <Button onClick={() => setShowCreateModal(true)} renderIcon={Add} size="sm">
            Create Dashboard
          </Button>
        </div>
      </Header>

      {/* Main Content */}
      <main style={{ paddingTop: '3rem', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
        {selectedDashboard ? (
          <DashboardView
            dashboardId={selectedDashboard}
            onBack={() => setSelectedDashboard(null)}
            widgets={currentDashboard?.widgets || []}
            onUpdateWidgets={(newWidgets) => handleUpdateWidgets(selectedDashboard, newWidgets)}
          />
        ) : (
          <div style={{ padding: '2rem', maxWidth: '1584px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '400', marginBottom: '0.5rem' }}>
                Dashboards
              </h2>
              <p style={{ color: '#525252', fontSize: '0.875rem' }}>Monitor and analyze your cloud infrastructure costs</p>
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(3, 1fr)',
                marginBottom: '2rem',
              }}
            >
              <div className="metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '0.5rem',
                      display: 'flex',
                    }}
                  >
                    <Dashboard size={20} style={{ color: '#0f62fe' }} />
                  </div>
                  <span className="metric-label">Total Dashboards</span>
                </div>
                <p className="metric-value">{dashboards.length}</p>
              </div>

              <div className="metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#defbe6',
                      borderRadius: '0.5rem',
                      display: 'flex',
                    }}
                  >
                    <ChartLineSmooth size={20} style={{ color: '#198038' }} />
                  </div>
                  <span className="metric-label">Total Widgets</span>
                </div>
                <p className="metric-value">
                  {dashboards.reduce((acc, d) => acc + d.widgets.length, 0)}
                </p>
              </div>

              <div className="metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#bae6ff',
                      borderRadius: '0.5rem',
                      display: 'flex',
                    }}
                  >
                    <Activity size={20} style={{ color: '#0072c3' }} />
                  </div>
                  <span className="metric-label">Active Monitoring</span>
                </div>
                <p className="metric-value">Live</p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(3, 1fr)',
              }}
            >
              {dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="card-enhanced"
                  onClick={() => setSelectedDashboard(dashboard.id)}
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div
                      style={{
                        padding: '0.625rem',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '0.5rem',
                        display: 'flex',
                      }}
                    >
                      <Dashboard size={20} style={{ color: '#0f62fe' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tag type="gray" size="sm">
                        {dashboard.widgets.length} widgets
                      </Tag>
                    </div>
                  </div>

                  <h3 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    {dashboard.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '1rem' }}>
                    {dashboard.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e0e0e0',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#8d8d8d' }}>Updated {dashboard.updatedAt}</span>
                    <span style={{ fontSize: '0.75rem', color: '#8d8d8d' }}>by {dashboard.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Dashboard Modal */}
      {showCreateModal && (
        <CreateDashboardModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onDashboardCreated={(id) => {
            setSelectedDashboard(id);
            setShowCreateModal(false);
          }}
        />
      )}
    </>
  );
}

export default function Home() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
