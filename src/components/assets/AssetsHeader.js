import React from "react";
import PropTypes from "prop-types";
import { Button, Dropdown } from "@carbon/react";
import { Renew, Download } from "@carbon/icons-react";
import ThemeToggle from "../ThemeToggle";

/**
 * AssetsHeader - Control bar for the Assets page
 * Contains dropdowns for window and aggregate selection, plus refresh button
 */

const windowOptions = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "24h", label: "Last 24 hours" },
  { id: "48h", label: "Last 48 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "14d", label: "Last 14 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "week", label: "Week-to-date" },
  { id: "lastweek", label: "Last week" },
];

const aggregateOptions = [
  { id: "type", label: "Asset Type" },
  { id: "namespace", label: "Namespace" },
  { id: "cluster", label: "Cluster" },
  { id: "service", label: "Service" },
  { id: "node", label: "Node" },
  { id: "label", label: "Label" },
  { id: "providerID", label: "Provider ID" },
];

const AssetsHeader = ({
  window,
  setWindow,
  aggregate,
  setAggregate,
  onRefresh,
  onExport,
  isLoading,
  isExporting,
}) => {
  const headerStyle = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: "1rem",
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "var(--card-bg)",
    borderRadius: "4px",
    transition: "background-color 0.2s ease",
  };

  const titleStyle = {
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginRight: "auto",
    marginBottom: "0.5rem",
  };

  const controlsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: "1rem",
  };

  const dropdownContainerStyle = {
    minWidth: "180px",
  };

  // Find current selections
  const selectedWindow = windowOptions.find((opt) => opt.id === window);
  const selectedAggregate = aggregateOptions.find((opt) => opt.id === aggregate);

  return (
    <div style={headerStyle}>
      <h1 style={titleStyle}>Assets</h1>
      <div style={controlsContainerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
          <ThemeToggle />
        </div>
        <div style={dropdownContainerStyle}>
          <Dropdown
            id="window-dropdown"
            titleText="Window"
            label="Select time window"
            items={windowOptions}
            selectedItem={selectedWindow}
            itemToString={(item) => (item ? item.label : "")}
            onChange={({ selectedItem }) => {
              if (selectedItem) {
                setWindow(selectedItem.id);
              }
            }}
            size="md"
          />
        </div>
        <div style={dropdownContainerStyle}>
          <Dropdown
            id="aggregate-dropdown"
            titleText="Aggregate By"
            label="Select aggregation"
            items={aggregateOptions}
            selectedItem={selectedAggregate}
            itemToString={(item) => (item ? item.label : "")}
            onChange={({ selectedItem }) => {
              if (selectedItem) {
                setAggregate(selectedItem.id);
              }
            }}
            size="md"
          />
        </div>
        <Button
          kind="secondary"
          size="md"
          renderIcon={Download}
          onClick={onExport}
          disabled={isLoading || isExporting}
          hasIconOnly
          iconDescription="Export to CSV"
          tooltipPosition="bottom"
        />
        <Button
          kind="secondary"
          size="md"
          renderIcon={Renew}
          onClick={onRefresh}
          disabled={isLoading}
          hasIconOnly
          iconDescription="Refresh data"
          tooltipPosition="bottom"
        />
      </div>
    </div>
  );
};

AssetsHeader.propTypes = {
  /** Current window value */
  window: PropTypes.string.isRequired,
  /** Handler to update window */
  setWindow: PropTypes.func.isRequired,
  /** Current aggregate value */
  aggregate: PropTypes.string.isRequired,
  /** Handler to update aggregate */
  setAggregate: PropTypes.func.isRequired,
  /** Handler for refresh button click */
  onRefresh: PropTypes.func.isRequired,
  /** Handler for export button click */
  onExport: PropTypes.func,
  /** Loading state to disable refresh button */
  isLoading: PropTypes.bool,
  /** Exporting state to disable export button */
  isExporting: PropTypes.bool,
};

AssetsHeader.defaultProps = {
  isLoading: false,
  isExporting: false,
  onExport: null,
};

export default AssetsHeader;
