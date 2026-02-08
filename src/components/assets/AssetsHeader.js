import PropTypes from "prop-types";
import { Dropdown, Button, Toggle } from "@carbon/react";
import { Renew } from "@carbon/icons-react";
import { useThemeMode } from "../../context/ThemeContext";

const WINDOW_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "24h", label: "Last 24h" },
  { id: "48h", label: "Last 48h" },
  { id: "7d", label: "Last 7 days" },
  { id: "14d", label: "Last 14 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "60d", label: "Last 60 days" },
  { id: "90d", label: "Last 90 days" },
];

const AGGREGATE_OPTIONS = [
  { id: "type", label: "Asset Type" },
  { id: "cluster", label: "Cluster" },
  { id: "storageclass", label: "Storage Class" },
  { id: "providerID", label: "Provider" },
];

const AssetsHeader = ({
  timeWindow,
  onTimeWindowChange,
  aggregateBy,
  onAggregateByChange,
  onRefresh,
  useMockData,
}) => {
  const { isDark, toggleTheme } = useThemeMode();
  const selectedWindow = WINDOW_OPTIONS.find((o) => o.id === timeWindow) || WINDOW_OPTIONS[4];
  const selectedAggregate = AGGREGATE_OPTIONS.find((o) => o.id === aggregateBy) || AGGREGATE_OPTIONS[0];

  return (
    <div className="assets-header-controls">
      {useMockData && <span className="mock-data-badge">Mock Data</span>}

      <Dropdown
        id="window-select"
        titleText="Date Range"
        label="Select window"
        items={WINDOW_OPTIONS}
        selectedItem={selectedWindow}
        onChange={({ selectedItem }) => {
          if (selectedItem) onTimeWindowChange(selectedItem.id);
        }}
        size="sm"
      />

      <Dropdown
        id="aggregate-select"
        titleText="Aggregate By"
        label="Select aggregation"
        items={AGGREGATE_OPTIONS}
        selectedItem={selectedAggregate}
        onChange={({ selectedItem }) => {
          if (selectedItem) onAggregateByChange(selectedItem.id);
        }}
        size="sm"
      />

      <Toggle
        id="theme-toggle"
        labelText="Dark Mode"
        labelA=""
        labelB=""
        toggled={isDark}
        onToggle={toggleTheme}
        size="sm"
      />

      <Button
        kind="ghost"
        renderIcon={Renew}
        onClick={onRefresh}
        iconDescription="Refresh data"
        hasIconOnly
        size="sm"
      />
    </div>
  );
};

AssetsHeader.propTypes = {
  timeWindow: PropTypes.string.isRequired,
  onTimeWindowChange: PropTypes.func.isRequired,
  aggregateBy: PropTypes.string.isRequired,
  onAggregateByChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  useMockData: PropTypes.bool,
};

export default AssetsHeader;
