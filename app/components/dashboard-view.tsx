import { useState } from "react";
import { Button, Tile, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { ArrowLeft, OverflowMenuVertical, Edit } from "@carbon/icons-react";
import DashboardBuilder from "./dashboard-builder";
import CostSummaryCards from "./cost-summary-cards";
import CostAllocationChart from "./cost-allocation-chart";
import CostAllocationTable from "./cost-allocation-table";
import CloudCostWidget from "./cloud-cost-widget";
import CloudCostTableWidget from "./cloud-cost-table-widget";
import ExternalServicesChartWidget from "./external-services-chart-widget";
import AssetsVisualization from "./assets-visualization";
import { AllocationFiltersProvider } from "./allocation-filters-context";
import type { Widget, Dashboard } from "./dashboard-context";

function WidgetRenderer({
  widget,
  useSharedAllocationFilters,
}: {
  widget: Widget;
  useSharedAllocationFilters: boolean;
}) {
  switch (widget.type) {
    case "summary-cards":
      return <CostSummaryCards title={widget.title} />;
    case "cloud-costs-chart":
      return (
        <Tile style={{ padding: "1rem" }}>
          <CloudCostWidget />
        </Tile>
      );
    case "cloud-costs-table":
      return (
        <Tile style={{ padding: "1rem" }}>
          <CloudCostTableWidget
            title={widget.title}
            description="Cloud service spend with utilization and totals"
          />
        </Tile>
      );
    case "cost-allocation-chart":
      return (
        <Tile style={{ padding: "1rem" }}>
          <CostAllocationChart
            title={widget.title}
            description="Cost breakdown by cluster, namespace, pod, or other dimension"
            useSharedFilters={useSharedAllocationFilters}
          />
        </Tile>
      );
    case "external-services-chart":
    case "external-costs-chart":
      return (
        <Tile style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
          <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "1rem" }}>Third-party service costs</p>
          <ExternalServicesChartWidget />
        </Tile>
      );
    case "assets-visualization":
      return <AssetsVisualization />;
    case "cost-allocation-table":
    case "cost-table":
      return (
        <Tile style={{ padding: "1rem" }}>
          <CostAllocationTable
            title={widget.title}
            description="Cost allocation breakdown by cluster, namespace, pod, or other dimension"
            useSharedFilters={useSharedAllocationFilters}
          />
        </Tile>
      );
    case "anomaly-detection":
      return (
        <Tile style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
          <div style={{ padding: "2rem", textAlign: "center", color: "#525252" }}>Anomaly detection widget</div>
        </Tile>
      );
    case "carbon-metrics":
      return (
        <Tile style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
          <div style={{ padding: "2rem", textAlign: "center", color: "#525252" }}>Carbon metrics widget</div>
        </Tile>
      );
    default:
      return null;
  }
}

interface DashboardViewProps {
  dashboard: Dashboard;
  onBack: () => void;
  onUpdateWidgets: (widgets: Widget[]) => void;
}

const DEFAULT_DASHBOARD_ID = "1";

export default function DashboardView({ dashboard, onBack, onUpdateWidgets }: DashboardViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widget[]>(dashboard.widgets);
  const isDefaultDashboard = dashboard.id === DEFAULT_DASHBOARD_ID;

  const hasAllocationChart = currentWidgets.some((w) => w.type === "cost-allocation-chart");
  const hasAllocationTable = currentWidgets.some((w) => w.type === "cost-allocation-table" || w.type === "cost-table");
  const useSharedAllocationFilters = hasAllocationChart && hasAllocationTable;

  const handleSaveLayout = (newWidgets: Widget[]) => {
    setCurrentWidgets(newWidgets);
    onUpdateWidgets(newWidgets);
    setIsEditMode(false);
  };

  if (isEditMode) {
    return (
      <DashboardBuilder
        dashboardId={dashboard.id}
        initialWidgets={currentWidgets}
        onSave={handleSaveLayout}
        onCancel={() => setIsEditMode(false)}
        isDefaultDashboard={isDefaultDashboard}
      />
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Button kind="ghost" size="sm" onClick={onBack} renderIcon={ArrowLeft} iconDescription="Back">
            Back
          </Button>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "700" }}>{dashboard.name}</h1>
            <p style={{ fontSize: "0.875rem", color: "#525252" }}>{dashboard.description}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <OverflowMenu renderIcon={OverflowMenuVertical} iconDescription="More options" flipped size="sm">
            <OverflowMenuItem itemText="Edit Layout" onClick={() => setIsEditMode(true)} />
            <OverflowMenuItem itemText="Share Dashboard" />
            <OverflowMenuItem
              itemText="Delete Dashboard"
              hasDivider
              disabled={isDefaultDashboard}
              isDelete
            />
          </OverflowMenu>
        </div>
      </div>

      {currentWidgets.length > 0 ? (
        useSharedAllocationFilters ? (
          <AllocationFiltersProvider>
            <div className="dashboard-grid">
              {currentWidgets.map((widget) => (
                <div key={widget.id} className={`dashboard-grid-item-${widget.gridSize}`}>
                  <WidgetRenderer widget={widget} useSharedAllocationFilters={true} />
                </div>
              ))}
            </div>
          </AllocationFiltersProvider>
        ) : (
          <div className="dashboard-grid">
            {currentWidgets.map((widget) => (
              <div key={widget.id} className={`dashboard-grid-item-${widget.gridSize}`}>
                <WidgetRenderer widget={widget} useSharedAllocationFilters={false} />
              </div>
            ))}
          </div>
        )
      ) : (
        <Tile style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "1rem" }}>
            No widgets added to this dashboard
          </p>
          <Button onClick={() => setIsEditMode(true)} renderIcon={Edit}>
            Add Widgets
          </Button>
        </Tile>
      )}
    </div>
  );
}
