import { useState } from "react";
import { Button, Tile, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { ArrowLeft, OverflowMenuVertical, Edit, Filter } from "@carbon/icons-react";
import DashboardBuilder from "./dashboard-builder";
import ScopedViews from "./scoped-views";
import CostSummaryCards from "./cost-summary-cards";
import CostAllocationChart from "./cost-allocation-chart";
import CostByServiceChart from "./cost-by-service-chart";
import ExternalServicesChartWidget from "./external-services-chart-widget";
import AssetsVisualization from "./assets-visualization";
import type { Widget, Dashboard } from "./dashboard-context";

function WidgetRenderer({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case "summary-cards":
      return <CostSummaryCards />;
    case "cloud-costs-chart":
      return (
        <Tile style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
          <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "1rem" }}>
            Cloud infrastructure costs over time
          </p>
          <CostByServiceChart />
        </Tile>
      );
    case "cost-allocation-chart":
      return (
        <Tile style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
          <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "1rem" }}>Cost breakdown by namespace</p>
          <CostAllocationChart />
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
    case "cost-table":
      return (
        <Tile style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
          <div style={{ padding: "2rem", textAlign: "center", color: "#525252" }}>Cost table widget</div>
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

export default function DashboardView({ dashboard, onBack, onUpdateWidgets }: DashboardViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widget[]>(dashboard.widgets);

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
          <Button
            kind={showFilters ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            renderIcon={Filter}
          >
            Filters
          </Button>
          <OverflowMenu renderIcon={OverflowMenuVertical} iconDescription="More options" flipped size="sm">
            <OverflowMenuItem itemText="Edit Layout" onClick={() => setIsEditMode(true)} />
            <OverflowMenuItem itemText="Share Dashboard" />
            <OverflowMenuItem itemText="Make Homepage" />
            <OverflowMenuItem itemText="Delete Dashboard" hasDivider isDelete />
          </OverflowMenu>
        </div>
      </div>

      {showFilters && (
        <ScopedViews
          onFiltersChanged={() => {}}
          onViewSaved={(name, filters) => console.log(`Saved view: ${name}`, filters)}
        />
      )}

      {currentWidgets.length > 0 ? (
        <div className="dashboard-grid">
          {currentWidgets.map((widget) => (
            <div key={widget.id} className={`dashboard-grid-item-${widget.gridSize}`}>
              <WidgetRenderer widget={widget} />
            </div>
          ))}
        </div>
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
