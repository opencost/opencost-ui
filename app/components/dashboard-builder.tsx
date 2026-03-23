import { useState } from "react";
import { Button, Tile, Select, SelectItem, Modal } from "@carbon/react";
import { Add, TrashCan, Copy, ArrowLeft } from "@carbon/icons-react";
import type { Widget } from "./dashboard-context";

const WIDGET_TYPES = [
  { value: "summary-cards", label: "Cost Summary", description: "Key metrics overview" },
  { value: "cloud-costs-chart", label: "Cloud Costs Chart", description: "Cloud infrastructure costs over time" },
  { value: "cloud-costs-table", label: "Cloud Costs Table", description: "Cloud service spend with utilization and totals" },
  { value: "cost-allocation-chart", label: "Cost Allocation", description: "Cost breakdown by cluster, namespace, pod, or other dimension" },
  { value: "external-services-chart", label: "External Services Costs", description: "Third-party service costs" },
  { value: "cost-allocation-table", label: "Allocation Breakdown Table", description: "Detailed allocation breakdown by resource" },
  { value: "anomaly-detection", label: "Anomaly Detection", description: "Unusual spending patterns" },
  { value: "carbon-metrics", label: "Carbon & Sustainability", description: "Environmental impact tracking" },
  { value: "assets-visualization", label: "Infrastructure Assets", description: "Cost, utilization, and carbon emissions by asset" },
];

interface DashboardBuilderProps {
  dashboardId: string;
  initialWidgets?: Widget[];
  onSave: (widgets: Widget[]) => void;
  onCancel: () => void;
  isDefaultDashboard?: boolean;
}

export default function DashboardBuilder({
  dashboardId: _dashboardId,
  initialWidgets = [],
  onSave,
  onCancel,
  isDefaultDashboard = false,
}: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>(
    initialWidgets.length > 0
      ? initialWidgets
      : [
          { id: "1", type: "summary-cards", title: "Cost Summary", gridSize: "4" },
          { id: "2", type: "cloud-costs-chart", title: "Cloud Costs", gridSize: "2" },
          { id: "5", type: "cloud-costs-table", title: "Cloud Costs Table", gridSize: "2" },
          { id: "3", type: "cost-allocation-chart", title: "Cost Allocation", gridSize: "2" },
          { id: "4", type: "external-services-chart", title: "External Services Costs", gridSize: "2" },
        ]
  );
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState("summary-cards");
  const [newWidgetGridSize, setNewWidgetGridSize] = useState("4");

  const addWidget = () => {
    const widgetInfo = WIDGET_TYPES.find((w) => w.value === newWidgetType);
    const widget: Widget = {
      id: `widget-${Date.now()}`,
      type: newWidgetType,
      title: widgetInfo?.label || "New Widget",
      gridSize: newWidgetGridSize,
    };
    setWidgets([...widgets, widget]);
    setShowAddWidget(false);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    setSelectedWidget(null);
  };

  const deleteWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    setSelectedWidget(null);
  };

  const duplicateWidget = (widget: Widget) => {
    setWidgets([...widgets, { ...widget, id: `widget-${Date.now()}` }]);
  };

  return (
    <div style={{ padding: "1.5rem 1.5rem 2rem", maxWidth: "1584px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Button kind="ghost" size="sm" onClick={onCancel} iconDescription="Back">
            <ArrowLeft style={{ marginRight: "0.375rem" }} />
            Back
          </Button>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Edit Dashboard Layout</h2>
            <p style={{ fontSize: "0.875rem", color: "#525252" }}>
              {isDefaultDashboard
                ? "Default dashboard layout is fixed and cannot be modified"
                : "Customize your dashboard widgets"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button kind="secondary" onClick={onCancel}>Cancel</Button>
          <Button kind="primary" onClick={() => onSave(widgets)}>Save Layout</Button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: "2rem" }}>
        {widgets.map((widget) => (
          <Tile
            key={widget.id}
            className={`dashboard-grid-item-${widget.gridSize}`}
            style={{
              padding: "1rem",
              border: selectedWidget?.id === widget.id ? "2px solid #0f62fe" : "1px solid #e0e0e0",
              cursor: "pointer",
              minHeight: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            onClick={() => setSelectedWidget(widget)}
          >
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>{widget.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "#525252" }}>
                {WIDGET_TYPES.find((w) => w.value === widget.type)?.description}
              </p>
            </div>
            {!isDefaultDashboard && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={Copy}
                  onClick={(e) => { e.stopPropagation(); duplicateWidget(widget); }}
                >
                  Duplicate
                </Button>
                <Button
                  kind="danger--ghost"
                  size="sm"
                  renderIcon={TrashCan}
                  onClick={(e) => { e.stopPropagation(); deleteWidget(widget.id); }}
                >
                  Remove
                </Button>
              </div>
            )}
          </Tile>
        ))}

        {!isDefaultDashboard && (
          <Tile
            style={{
              padding: "1rem",
              border: "2px dashed #0f62fe",
              cursor: "pointer",
              minHeight: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowAddWidget(true)}
          >
            <div style={{ textAlign: "center" }}>
              <Add size={32} style={{ color: "#0f62fe", marginBottom: "0.5rem" }} />
              <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f62fe" }}>Add Widget</p>
            </div>
          </Tile>
        )}
      </div>

      {selectedWidget && !isDefaultDashboard && (
        <Tile style={{ padding: "1.5rem", backgroundColor: "#f4f4f4" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>Configure Widget</h3>
          <Select
            id="widget-size"
            labelText="Widget Size"
            value={selectedWidget.gridSize}
            onChange={(e) => updateWidget(selectedWidget.id, { gridSize: e.target.value })}
          >
            <SelectItem value="1" text="1 Column" />
            <SelectItem value="2" text="2 Columns" />
            <SelectItem value="3" text="3 Columns" />
            <SelectItem value="4" text="4 Columns (Full Width)" />
          </Select>
        </Tile>
      )}

      <Modal
        open={showAddWidget}
        onRequestClose={() => setShowAddWidget(false)}
        modalHeading="Add Widget"
        primaryButtonText="Add"
        secondaryButtonText="Cancel"
        onRequestSubmit={addWidget}
        size="sm"
      >
        <div style={{ marginBottom: "1rem" }}>
          <Select
            id="widget-type"
            labelText="Widget Type"
            value={newWidgetType}
            onChange={(e) => setNewWidgetType(e.target.value)}
          >
            {WIDGET_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} text={type.label} />
            ))}
          </Select>
          <p style={{ fontSize: "0.875rem", color: "#525252", marginTop: "0.5rem" }}>
            {WIDGET_TYPES.find((w) => w.value === newWidgetType)?.description}
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Select
              id="widget-size"
              labelText="Column span"
              value={newWidgetGridSize}
              onChange={(e) => setNewWidgetGridSize(e.target.value)}
            >
              <SelectItem value="1" text="1 column (¼ width)" />
              <SelectItem value="2" text="2 columns (½ width)" />
              <SelectItem value="3" text="3 columns (¾ width)" />
              <SelectItem value="4" text="4 columns (full width)" />
            </Select>
            <p style={{ fontSize: "0.75rem", color: "#6f6f6f", marginTop: "0.25rem" }}>
              How much horizontal space should this widget occupy?
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
