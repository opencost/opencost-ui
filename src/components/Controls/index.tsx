import React, { useState } from "react";
import { Button } from "@carbon/react";
import { Edit } from "@carbon/icons-react";
import {
  Button as MuiButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import DownloadControl from "./Download";

interface ControlsProps {
  windowOptions: Array<{ name: string; value: string }>;
  window: string;
  setWindow: (value: string) => void;
  aggregationOptions: Array<{ name: string; value: string }>;
  aggregateBy: string;
  setAggregateBy: (value: string) => void;
  accumulateOptions: Array<{ name: string; value: boolean }>;
  accumulate: boolean;
  setAccumulate: (value: boolean) => void;
  title: string;
  cumulativeData: any[];
  currency: string;
  currencyOptions: string[];
  setCurrency: (value: string) => void;
}

const Controls: React.FC<ControlsProps> = ({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  accumulateOptions,
  accumulate,
  setAccumulate,
  title,
  cumulativeData,
  currency,
  currencyOptions,
  setCurrency,
}) => {
  const [open, setOpen] = useState(false);
  const [tempWindow, setTempWindow] = useState(window);
  const [tempAggregateBy, setTempAggregateBy] = useState(aggregateBy);
  const [tempAccumulate, setTempAccumulate] = useState(accumulate);
  const [tempCurrency, setTempCurrency] = useState(currency);

  const handleOpen = () => {
    setTempWindow(window);
    setTempAggregateBy(aggregateBy);
    setTempAccumulate(accumulate);
    setTempCurrency(currency);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleApply = () => {
    setWindow(tempWindow);
    setAggregateBy(tempAggregateBy);
    setAccumulate(tempAccumulate);
    setCurrency(tempCurrency);
    setOpen(false);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Button
        kind="tertiary"
        size="md"
        renderIcon={Edit}
        onClick={handleOpen}
      >
        Edit
      </Button>

      <DownloadControl cumulativeData={cumulativeData} title={title} />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Report</DialogTitle>

        <DialogContent sx={{ pb: 0 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Date Range</InputLabel>
            <Select
              value={tempWindow}
              onChange={(e) => setTempWindow(e.target.value)}
              label="Date Range"
            >
              {windowOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Aggregate By</InputLabel>
            <Select
              value={tempAggregateBy}
              onChange={(e) => setTempAggregateBy(e.target.value)}
              label="Aggregate By"
            >
              {aggregationOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Accumulate</InputLabel>
            <Select
              value={tempAccumulate}
              onChange={(e) => setTempAccumulate(e.target.value === "true")}
              label="Accumulate"
            >
              {accumulateOptions.map((opt) => (
                <MenuItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Currency</InputLabel>
            <Select
              value={tempCurrency}
              onChange={(e) => setTempCurrency(e.target.value)}
              label="Currency"
            >
              {currencyOptions.map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MuiButton onClick={handleClose}>Cancel</MuiButton>
          <MuiButton onClick={handleApply} variant="contained">
            Apply
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default React.memo(Controls);
