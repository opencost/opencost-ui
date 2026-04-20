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
        <Tile className="p-4">
          <CloudCostWidget />
        </Tile>
      );
    case "cloud-costs-table":
      return (
        <Tile className="p-4">
          <CloudCostTableWidget
            title={widget.title}
            description="Cloud service spend with utilization and totals"
          />
        </Tile>
      );
    case "cost-allocation-chart":
      return (
        <Tile className="p-4">
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
        <Tile className="p-4">
          <h3 className="text-lg font-semibold mb-2">{widget.title}</h3>
          <p className="text-sm text-[#525252] mb-4">
            Third-party service costs
          </p>
          <ExternalServicesChartWidget />
        </Tile>
      );
    case "assets-visualization":
      return <AssetsVisualization />;
    case "cost-allocation-table":
    case "cost-table":
      return (
        <Tile className="p-4">
          <CostAllocationTable
            title={widget.title}
            description="Cost allocation breakdown by cluster, namespace, pod, or other dimension"
            useSharedFilters={useSharedAllocationFilters}
          />
        </Tile>
      );
    case "anomaly-detection":
      return (
        <Tile className="p-4">
          <h3 className="text-lg font-semibold mb-2">{widget.title}</h3>
          <div className="p-8 text-center text-[#525252]">
            Anomaly detection widget
          </div>
        </Tile>
      );
    case "carbon-metrics":
      return (
        <Tile className="p-4">
          <h3 className="text-lg font-semibold mb-2">{widget.title}</h3>
          <div className="p-8 text-center text-[#525252]">
            Carbon metrics widget
          </div>
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
  onDuplicate?: () => void;
  isDefaultDashboard?: boolean;
  showBackButton?: boolean;
}

function encodeDashboardShare(dashboard: Dashboard): string {
  const payload = {
    name: dashboard.name,
    description: dashboard.description,
    widgets: dashboard.widgets,
    tags: dashboard.tags,
  };
  return encodeURIComponent(btoa(JSON.stringify(payload)));
}

export default function DashboardView({
  dashboard,
  onBack,
  onUpdateWidgets,
  onDuplicate,
  isDefaultDashboard = false,
  showBackButton = true,
}: DashboardViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widget[]>(
    dashboard.widgets,
  );
  const [shareToast, setShareToast] = useState<"copied" | "error" | null>(null);
  const hasAllocationChart = currentWidgets.some(
    (w) => w.type === "cost-allocation-chart",
  );
  const hasAllocationTable = currentWidgets.some(
    (w) => w.type === "cost-allocation-table" || w.type === "cost-table",
  );
  const useSharedAllocationFilters = hasAllocationChart && hasAllocationTable;

  const handleSaveLayout = (newWidgets: Widget[]) => {
    setCurrentWidgets(newWidgets);
    onUpdateWidgets(newWidgets);
    setIsEditMode(false);
  };

  const handleShareDashboard = async () => {
    try {
      const encoded = encodeDashboardShare({
        ...dashboard,
        widgets: currentWidgets,
      });
      const url = `${window.location.origin}/dashboards?share=${encoded}`;
      await navigator.clipboard.writeText(url);
      setShareToast("copied");
      setTimeout(() => setShareToast(null), 4000);
    } catch {
      setShareToast("error");
      setTimeout(() => setShareToast(null), 4000);
    }
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
    <div className="p-[1.5rem_1.5rem_2rem] max-w-[1584px] mx-auto">
      <div className="flex items-center justify-between mb-6 pt-2">
        <div className="flex items-center gap-4">
          {showBackButton ? (
            <Button
              kind="ghost"
              size="sm"
              onClick={onBack}
              iconDescription="Back"
            >
              <ArrowLeft className="mr-[0.375rem]" />
              Back
            </Button>
          ) : null}
          <div>
            <h1 className="text-3xl font-bold">{dashboard.name}</h1>
            <p className="text-sm text-[#525252]">{dashboard.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OverflowMenu
            renderIcon={OverflowMenuVertical}
            iconDescription="More options"
            flipped
            size="sm"
          >
            <OverflowMenuItem
              itemText="Edit Layout"
              onClick={() => setIsEditMode(true)}
            />
            {onDuplicate ? (
              <OverflowMenuItem itemText="Duplicate Dashboard" onClick={onDuplicate} />
            ) : null}
            <OverflowMenuItem
              itemText="Share Dashboard"
              onClick={handleShareDashboard}
            />
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
                <div
                  key={widget.id}
                  className={`dashboard-grid-item-${widget.gridSize}`}
                >
                  <WidgetRenderer
                    widget={widget}
                    useSharedAllocationFilters={true}
                  />
                </div>
              ))}
            </div>
          </AllocationFiltersProvider>
        ) : (
          <div className="dashboard-grid">
            {currentWidgets.map((widget) => (
              <div
                key={widget.id}
                className={`dashboard-grid-item-${widget.gridSize}`}
              >
                <WidgetRenderer
                  widget={widget}
                  useSharedAllocationFilters={false}
                />
              </div>
            ))}
          </div>
        )
      ) : (
        <Tile className="p-12 text-center">
          <p className="text-sm text-[#525252] mb-4">
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
