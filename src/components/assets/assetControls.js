import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DownloadIcon from "@mui/icons-material/Download";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { windowOptions, aggregationOptions } from "./tokens";
import { currencyCodes } from "../../constants/currencyCodes";
import { checkCustomWindow, toVerboseTimeRange } from "../../util";

const AssetControls = ({
  window,
  setWindow,
  aggregateBy,
  setAggregateBy,
  currency,
  setCurrency,
  onDownloadCSV,
  onCustomRange,
  showCharts,
  onToggleCharts,
}) => {
  const renderWindowValue = (value) => {
    const match = windowOptions.find((opt) => opt.value === value);
    if (match) return match.name;
    if (checkCustomWindow(value)) return toVerboseTimeRange(value);
    return value;
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.25,
          borderRadius: 999,
          border: "1px solid",
          borderColor: showCharts ? "#90caf9" : "#e0e0e0",
          backgroundColor: showCharts ? "#e3f2fd" : "#fafafa",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: showCharts ? "#1565c0" : "#616161" }}
        >
          Charts
        </Typography>
        <FormControlLabel
          labelPlacement="end"
          label={showCharts ? "On" : "Off"}
          control={
            <Switch
              size="small"
              checked={showCharts}
              onChange={() => onToggleCharts && onToggleCharts()}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#1565c0" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#90caf9" },
              }}
            />
          }
          sx={{ marginRight: 0, marginLeft: 0 }}
        />
      </Box>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Window</InputLabel>
        <Select
          value={window}
          label="Window"
          onChange={(e) => {
            const value = e.target.value;
            if (value === "custom") {
              if (onCustomRange) onCustomRange();
              return;
            }
            setWindow(value);
          }}
          renderValue={renderWindowValue}
        >
          {windowOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel shrink>Aggregate By</InputLabel>
        <Select
          value={aggregateBy}
          label="Aggregate By"
          notched
          displayEmpty
          renderValue={(value) => {
            const match = aggregationOptions.find((opt) => opt.value === value);
            return match ? match.name : "Individual Asset";
          }}
          onChange={(e) => setAggregateBy(e.target.value)}
        >
          {aggregationOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Currency</InputLabel>
        <Select
          value={currency}
          label="Currency"
          onChange={(e) => setCurrency(e.target.value)}
        >
          {currencyCodes.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip title="Download as CSV">
        <IconButton onClick={onDownloadCSV} size="small">
          <DownloadIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default AssetControls;
