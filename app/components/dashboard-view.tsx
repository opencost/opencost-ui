import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { ArrowLeft, OverflowMenuVertical } from "@carbon/icons-react";
import { EditOutlined, ShareOutlined } from "@mui/icons-material";
import DashboardBuilder from "./dashboard-builder";
import CostSummaryCards from "./cost-summary-cards";
import CostAllocationChart from "./cost-allocation-chart";
import CostAllocationTable from "./cost-allocation-table";
import CloudCostWidget from "./cloud-cost-widget";
import CloudCostTableWidget from "./cloud-cost-table-widget";
import ExternalServicesChartWidget from "./external-services-chart-widget";
import AssetsVisualization from "./assets-visualization";
import WidgetCard from "./widget-card";
import { AllocationFiltersProvider } from "./allocation-filters-context";
import { encodeSharePayload } from "~/lib/share-encoding";
import type { Widget, Dashboard } from "./dashboard-context";

function WidgetRenderer({
  widget,
  useSharedAllocationFilters,
}: {
  widget: Widget;
  useSharedAllocationFilters: boolean;
}) {
  const { t } = useTranslation();

  const getTranslatedWidgetTitle = (title: string) => {
    if (title === "Cost Summary") return t("cost.cost_summary");
    if (title === "Cost Allocation") return t("cost.cost_allocation");
    if (title === "Cost Breakdown Table" || title === "Allocation Breakdown Table") {
      return t("cost.cost_breakdown_table");
    }
    if (title === "Cloud Costs") return t("cost.cloud_costs");
    return title;
  };

  const widgetTitle = getTranslatedWidgetTitle(widget.title);

  switch (widget.type) {
    case "summary-cards":
      return <CostSummaryCards title={widgetTitle} />;
    case "cloud-costs-chart":
      return (
        <WidgetCard>
          <CloudCostWidget />
        </WidgetCard>
      );
    case "cloud-costs-table":
      return (
        <WidgetCard>
          <CloudCostTableWidget
            title={widgetTitle}
            description={t("cost.cloud_services_spend")}
          />
        </WidgetCard>
      );
    case "cost-allocation-chart":
      return (
        <WidgetCard>
          <CostAllocationChart
            title={widgetTitle}
            description={t("cost.cost_allocation_desc")}
            useSharedFilters={useSharedAllocationFilters}
          />
        </WidgetCard>
      );
    case "external-services-chart":
    case "external-costs-chart":
      return (
        <WidgetCard title={widgetTitle} description={t("cost.external_costs")}>
          <ExternalServicesChartWidget />
        </WidgetCard>
      );
    case "assets-visualization":
      return <AssetsVisualization />;
    case "cost-allocation-table":
    case "cost-table":
      return (
        <WidgetCard>
          <CostAllocationTable
            title={widgetTitle}
            description={t("cost.cost_allocation_desc")}
            useSharedFilters={useSharedAllocationFilters}
          />
        </WidgetCard>
      );
    case "anomaly-detection":
      return (
        <WidgetCard title={widgetTitle}>
          <div
            className="v2-empty-state"
            style={{ minHeight: "10rem" }}
          >
            <p className="v2-empty-state__description">
              Anomaly detection coming soon
            </p>
          </div>
        </WidgetCard>
      );
    case "carbon-metrics":
      return (
        <WidgetCard title={widgetTitle}>
          <div className="v2-empty-state" style={{ minHeight: "10rem" }}>
            <p className="v2-empty-state__description">
              Carbon metrics coming soon
            </p>
          </div>
        </WidgetCard>
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
  return encodeSharePayload({
    name: dashboard.name,
    description: dashboard.description,
    widgets: dashboard.widgets,
    tags: dashboard.tags,
  });
}

export default function DashboardView({
  dashboard,
  onBack,
  onUpdateWidgets,
  onDuplicate,
  isDefaultDashboard = false,
  showBackButton = true,
}: DashboardViewProps) {
  const { t } = useTranslation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widget[]>(
    dashboard.widgets,
  );
  const [shareToast, setShareToast] = useState<"copied" | "error" | null>(null);

  const getTranslatedDashboardName = (d: Dashboard) => {
    if (d.id === "1" || d.name === "Home") return t("dashboards.home_name");
    if (d.id === "2" || d.name === "Allocations") return t("dashboards.allocations_name");
    if (d.id === "3" || d.name === "Cloud Cost") return t("dashboards.cloud_cost_name");
    if (d.id === "4" || d.name === "Infra Assets") return t("dashboards.infra_assets_name");
    return d.name;
  };

  const getTranslatedDashboardDesc = (d: Dashboard) => {
    if (d.id === "1" || d.name === "Home") return t("dashboards.home_desc");
    if (d.id === "2" || d.name === "Allocations") return t("dashboards.allocations_desc");
    if (d.id === "3" || d.name === "Cloud Cost") return t("dashboards.cloud_cost_desc");
    if (d.id === "4" || d.name === "Infra Assets") return t("dashboards.infra_assets_desc");
    return d.description;
  };

  const resolvedName = getTranslatedDashboardName(dashboard);
  const resolvedDesc = getTranslatedDashboardDesc(dashboard);

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
    <div className="p-6 max-w-[1584px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          {showBackButton && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border transition-colors"
              style={{
                background: "var(--cds-layer)",
                borderColor: "var(--cds-border-subtle)",
                color: "var(--cds-text-secondary)",
              }}
              aria-label={t("common.back")}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="v2-page-title truncate">{resolvedName}</h1>
            {resolvedDesc && (
              <p
                className="m-0 mt-0.5 text-xs truncate"
                style={{ color: "var(--cds-text-secondary)" }}
              >
                {resolvedDesc}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Share feedback toast */}
          {shareToast && (
            <span
              className="text-xs px-2"
              style={{
                color:
                  shareToast === "copied"
                    ? "var(--cds-support-success)"
                    : "var(--cds-support-error)",
              }}
            >
              {shareToast === "copied" ? t("common.link_copied") : t("common.copy_failed")}
            </span>
          )}
          <button
            type="button"
            onClick={handleShareDashboard}
            className="inline-flex h-8 items-center gap-1.5 rounded border px-3 text-xs font-medium transition-colors"
            style={{
              background: "var(--cds-layer)",
              borderColor: "var(--cds-border-subtle)",
              color: "var(--cds-text-secondary)",
            }}
            title={t("common.share")}
          >
            <ShareOutlined sx={{ fontSize: 14 }} />
            {t("common.share")}
          </button>
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded border px-3 text-xs font-medium transition-colors"
            style={{
              background: "var(--cds-layer)",
              borderColor: "var(--cds-border-subtle)",
              color: "var(--cds-text-secondary)",
            }}
            title={t("common.edit")}
          >
            <EditOutlined sx={{ fontSize: 14 }} />
            {t("common.edit")}
          </button>
          <OverflowMenu
            renderIcon={OverflowMenuVertical}
            iconDescription="More options"
            flipped
            size="sm"
          >
            {onDuplicate && (
              <OverflowMenuItem
                itemText={t("dashboards.duplicate")}
                onClick={onDuplicate}
              />
            )}
            <OverflowMenuItem
              itemText={t("dashboards.delete")}
              hasDivider
              disabled={isDefaultDashboard}
              isDelete
            />
          </OverflowMenu>
        </div>
      </div>

      {/* Widgets */}
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
        <div className="v2-widget-card">
          <div className="v2-empty-state" style={{ minHeight: "16rem" }}>
            <div className="v2-empty-state__title">No widgets yet</div>
            <p className="v2-empty-state__description">
              Add widgets to build your cost visibility dashboard.
            </p>
            <Button onClick={() => setIsEditMode(true)} renderIcon={EditOutlined} size="sm">
              Add Widgets
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
