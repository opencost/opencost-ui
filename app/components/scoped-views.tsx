import { useState } from "react";
import { Tile, Button, Select, SelectItem, TextInput, Tag } from "@carbon/react";
import { Filter, TrashCan, Save } from "@carbon/icons-react";

const AVAILABLE_FILTERS = {
  namespace: ["default", "kube-system", "monitoring", "ingress-nginx", "cert-manager", "payment-service"],
  service: ["AWS EC2", "AWS RDS", "AWS S3", "GCP Compute", "GCP Storage", "Azure VMs"],
  region: ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1", "ap-northeast-1"],
  cluster: ["production", "staging", "development", "qa"],
  team: ["Engineering", "DevOps", "Data", "Platform", "ML", "Finance"],
  environment: ["production", "staging", "development", "testing"],
};

interface Filters {
  dateRange?: string;
  cluster?: string[];
  environment?: string[];
  team?: string[];
  [key: string]: string | string[] | undefined;
}

interface SavedView {
  name: string;
  filters: Filters;
}

interface ScopedViewsProps {
  onFiltersChanged: (filters: Filters) => void;
  onViewSaved?: (name: string, filters: Filters) => void;
}

export default function ScopedViews({ onFiltersChanged, onViewSaved }: ScopedViewsProps) {
  const [filters, setFilters] = useState<Filters>({ dateRange: "30d" });
  const [savedViews] = useState<SavedView[]>([
    { name: "Production Costs", filters: { environment: ["production"], cluster: ["production"] } },
    { name: "Engineering Team", filters: { team: ["Engineering"] } },
  ]);
  const [viewName, setViewName] = useState("");
  const [showSaveView, setShowSaveView] = useState(false);

  const updateFilter = (key: string, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChanged(newFilters);
  };

  const saveView = () => {
    if (viewName.trim()) {
      onViewSaved?.(viewName, filters);
      setViewName("");
      setShowSaveView(false);
    }
  };

  const loadView = (view: SavedView) => {
    setFilters(view.filters);
    onFiltersChanged(view.filters);
  };

  const clearFilters = () => {
    const reset = { dateRange: "30d" };
    setFilters(reset);
    onFiltersChanged(reset);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== "dateRange" && value && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <div style={{ width: "100%" }}>
      <Tile style={{ padding: "1.5rem", marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={20} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Scoped Views & Filters</h3>
            {activeFilterCount > 0 && <Tag type="blue">{activeFilterCount} active</Tag>}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {activeFilterCount > 0 && (
              <Button kind="ghost" size="sm" onClick={clearFilters} renderIcon={TrashCan}>
                Clear All
              </Button>
            )}
            <Button kind="secondary" size="sm" onClick={() => setShowSaveView(!showSaveView)} renderIcon={Save}>
              Save View
            </Button>
          </div>
        </div>

        {savedViews.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Quick Views:</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {savedViews.map((view) => (
                <Tag
                  key={view.name}
                  type="outline"
                  onClick={() => loadView(view)}
                  style={{ cursor: "pointer" }}
                >
                  {view.name}
                </Tag>
              ))}
            </div>
          </div>
        )}

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}
        >
          <Select
            id="date-range"
            labelText="Date Range"
            value={filters.dateRange || "30d"}
            onChange={(e) => updateFilter("dateRange", e.target.value)}
          >
            <SelectItem value="7d" text="Last 7 days" />
            <SelectItem value="30d" text="Last 30 days" />
            <SelectItem value="90d" text="Last 90 days" />
            <SelectItem value="custom" text="Custom range" />
          </Select>

          <Select
            id="cluster-filter"
            labelText="Cluster"
            value={filters.cluster?.[0] || ""}
            onChange={(e) => updateFilter("cluster", e.target.value ? [e.target.value] : [])}
          >
            <SelectItem value="" text="All clusters" />
            {AVAILABLE_FILTERS.cluster.map((c) => <SelectItem key={c} value={c} text={c} />)}
          </Select>

          <Select
            id="environment-filter"
            labelText="Environment"
            value={filters.environment?.[0] || ""}
            onChange={(e) => updateFilter("environment", e.target.value ? [e.target.value] : [])}
          >
            <SelectItem value="" text="All environments" />
            {AVAILABLE_FILTERS.environment.map((e) => <SelectItem key={e} value={e} text={e} />)}
          </Select>

          <Select
            id="team-filter"
            labelText="Team"
            value={filters.team?.[0] || ""}
            onChange={(e) => updateFilter("team", e.target.value ? [e.target.value] : [])}
          >
            <SelectItem value="" text="All teams" />
            {AVAILABLE_FILTERS.team.map((t) => <SelectItem key={t} value={t} text={t} />)}
          </Select>
        </div>

        {showSaveView && (
          <div
            style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#e0e0e0", borderRadius: "4px" }}
          >
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <TextInput
                  id="view-name"
                  labelText="View Name"
                  placeholder="Enter a name for this view..."
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                />
              </div>
              <Button kind="primary" size="sm" onClick={saveView} disabled={!viewName.trim()}>
                Save
              </Button>
              <Button kind="secondary" size="sm" onClick={() => setShowSaveView(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Tile>
    </div>
  );
}
