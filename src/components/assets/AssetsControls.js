import * as React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
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

  const handleProviderChange = (event) => {
    const value = event.target.value;
    setProviderFilter(value);

    // Update filters array
    const newFilters = filters.filter((f) => f.property !== "provider");
    if (value) {
      newFilters.push({ property: "provider", value });
    }
    onFiltersChange(newFilters);
  };

  const handleClusterChange = (event) => {
    const value = event.target.value;
    setClusterFilter(value);

    // Update filters array
    const newFilters = filters.filter((f) => f.property !== "cluster");
    if (value) {
      newFilters.push({ property: "cluster", value });
    }
    onFiltersChange(newFilters);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="window-select-label">Time Window</InputLabel>
        <Select
          labelId="window-select-label"
          id="window-select"
          value={window}
          label="Time Window"
          onChange={(e) => onWindowChange(e.target.value)}
        >
          {windowOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="aggregate-select-label">Aggregate By</InputLabel>
        <Select
          labelId="aggregate-select-label"
          id="aggregate-select"
          value={aggregate}
          label="Aggregate By"
          onChange={(e) => onAggregateChange(e.target.value)}
        >
          {aggregationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Filter by Provider"
        variant="outlined"
        value={providerFilter}
        onChange={handleProviderChange}
        sx={{ minWidth: 200 }}
        placeholder="e.g., AWS, GCP, Azure"
      />

      <TextField
        label="Filter by Cluster"
        variant="outlined"
        value={clusterFilter}
        onChange={handleClusterChange}
        sx={{ minWidth: 200 }}
        placeholder="e.g., production"
      />
    </Box>
  );
};

export default AssetsControls;
