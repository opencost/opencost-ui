import * as React from "react";
import {
  Dropdown,
  TextInput,
  Grid,
  Column,
} from "@carbon/react";
import { windowOptions, aggregationOptions } from "./tokens";

/**
 * AssetsControls - Control panel for filtering and configuring asset view
 */
const AssetsControls = ({
  window,
  onWindowChange,
  aggregate,
  onAggregateChange,
  filters,
  onFiltersChange,
}) => {
  const [providerFilter, setProviderFilter] = React.useState("");
  const [clusterFilter, setClusterFilter] = React.useState("");

  const handleProviderChange = (value) => {
    setProviderFilter(value);

    // Update filters array
    const newFilters = filters.filter((f) => f.property !== "provider");
    if (value) {
      newFilters.push({ property: "provider", value });
    }
    onFiltersChange(newFilters);
  };

  const handleClusterChange = (value) => {
    setClusterFilter(value);

    // Update filters array
    const newFilters = filters.filter((f) => f.property !== "cluster");
    if (value) {
      newFilters.push({ property: "cluster", value });
    }
    onFiltersChange(newFilters);
  };

  return (
    <div className="assets-controls" style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#f4f4f4", borderRadius: "4px" }}>
      <Grid narrow>
        <Column lg={4} md={4} sm={4}>
          <Dropdown
            id="window-dropdown"
            titleText="Time Window"
            label="Select window"
            items={windowOptions}
            itemToString={(item) => item?.name || ""}
            selectedItem={windowOptions.find((w) => w.value === window)}
            onChange={({ selectedItem }) => onWindowChange(selectedItem?.value || "7d")}
          />
        </Column>

        <Column lg={4} md={4} sm={4}>
          <Dropdown
            id="aggregate-dropdown"
            titleText="Aggregate By"
            label="Select aggregation"
            items={aggregationOptions}
            itemToString={(item) => item?.name || ""}
            selectedItem={aggregationOptions.find((a) => a.value === aggregate)}
            onChange={({ selectedItem }) => onAggregateChange(selectedItem?.value || "day")}
          />
        </Column>

        <Column lg={4} md={4} sm={4}>
          <TextInput
            id="provider-filter"
            labelText="Filter by Provider"
            placeholder="e.g., AWS, GCP, Azure"
            value={providerFilter}
            onChange={(e) => handleProviderChange(e.target.value)}
          />
        </Column>

        <Column lg={4} md={4} sm={4}>
          <TextInput
            id="cluster-filter"
            labelText="Filter by Cluster"
            placeholder="e.g., production"
            value={clusterFilter}
            onChange={(e) => handleClusterChange(e.target.value)}
          />
        </Column>
      </Grid>
    </div>
  );
};

export default AssetsControls;
