import { useState } from "react";
import { Button, Tile, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { ArrowLeft, OverflowMenuVertical, Edit, Filter } from "@carbon/icons-react";
import DashboardBuilder from "./dashboard-builder";
import ScopedViews, { DEFAULT_ALLOCATION_FILTERS, DEFAULT_CLOUD_FILTERS, type Filters } from "./scoped-views";
import CostSummaryCards from "./cost-summary-cards";
import CostAllocationChart from "./cost-allocation-chart";
import CostAllocationTable from "./cost-allocation-table";
import CloudCostWidget from "./cloud-cost-widget";
import CloudCostTableWidget from "./cloud-cost-table-widget";
import ExternalServicesChartWidget from "./external-services-chart-widget";
import AssetsVisualization from "./assets-visualization";
import type { Widget, Dashboard } from "./dashboard-context";

function WidgetRenderer({
  widget,
  allocationFilters,
  cloudFilters,
}: {
  widget: Widget;
  allocationFilters: { window: string; aggregateBy: string; accumulate: boolean; includeIdle: boolean };
  cloudFilters: { window: string; aggregateBy: string; costMetric: string; currency: string };
}) {
  switch (widget.type) {
    case "summary-cards":
      return <CostSummaryCards {...allocationFilters} />;
    case "cloud-costs-chart":
      return (
        <Tile style={{ padding: "1rem" }}>
          <CloudCostWidget
            window={cloudFilters.window}
            aggregateBy={cloudFilters.aggregateBy}
            costMetric={cloudFilters.costMetric}
            currency={cloudFilters.currency}
          />
        </Tile>
      );
    case "cloud-costs-table":
      return (
        <Tile style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
          <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "1rem" }}>Cloud service spend with utilization and totals</p>
          <CloudCostTableWidget
            window={cloudFilters.window}
            aggregateBy={cloudFilters.aggregateBy}
            costMetric={cloudFilters.costMetric}
            currency={cloudFilters.currency}
          />
        </Tile>
      );
    case "cost-allocation-chart":
      return (
        <Tile style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
          <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "1rem" }}>Cost breakdown by cluster, namespace, pod, or other dimension</p>
          <CostAllocationChart {...allocationFilters} />
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
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
          <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "1rem" }}>
            Cost allocation breakdown by cluster, namespace, pod, or other dimension
          </p>
          <CostAllocationTable {...allocationFilters} />
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

const defaultFilters: Filters = {
  ...DEFAULT_ALLOCATION_FILTERS,
  ...DEFAULT_CLOUD_FILTERS,
};

export default function DashboardView({ dashboard, onBack, onUpdateWidgets }: DashboardViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widget[]>(dashboard.widgets);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const allocationFilters = {
    window: filters.allocationWindow ?? DEFAULT_ALLOCATION_FILTERS.allocationWindow,
    aggregateBy: filters.allocationAggregateBy ?? DEFAULT_ALLOCATION_FILTERS.allocationAggregateBy,
    accumulate: filters.allocationAccumulate ?? DEFAULT_ALLOCATION_FILTERS.allocationAccumulate,
    includeIdle: filters.allocationIncludeIdle ?? DEFAULT_ALLOCATION_FILTERS.allocationIncludeIdle,
  };

  const cloudFilters = {
    window: filters.cloudWindow ?? DEFAULT_CLOUD_FILTERS.cloudWindow,
    aggregateBy: filters.cloudAggregateBy ?? DEFAULT_CLOUD_FILTERS.cloudAggregateBy,
    costMetric: filters.cloudCostMetric ?? DEFAULT_CLOUD_FILTERS.cloudCostMetric,
    currency: filters.cloudCurrency ?? DEFAULT_CLOUD_FILTERS.cloudCurrency,
  };

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
          filters={filters}
          onFiltersChanged={setFilters}
          hasCloudWidgets={currentWidgets.some(
            (w) => w.type === "cloud-costs-chart" || w.type === "cloud-costs-table"
          )}
        />
      )}

      {currentWidgets.length > 0 ? (
        <div className="dashboard-grid">
          {currentWidgets.map((widget) => (
            <div key={widget.id} className={`dashboard-grid-item-${widget.gridSize}`}>
              <WidgetRenderer widget={widget} allocationFilters={allocationFilters} cloudFilters={cloudFilters} />
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
