import * as React from "react";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface ExternalCostsControlsProps {
  windowOptions: Array<{ name: string; value: string }>;
  window: string;
  setWindow: (value: string) => void;
  aggregationOptions: Array<{ name: string; value: string }>;
  aggregateBy: string;
  setAggregateBy: (value: string) => void;
  title: string;
  currency: string;
  currencyOptions: string[];
  setCurrency: (value: string) => void;
}

function ExternalCostsControls({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  currency,
  currencyOptions,
  setCurrency,
}: ExternalCostsControlsProps) {
  const [open, setOpen] = useState(false);
  const [tempWindow, setTempWindow] = useState(window);
  const [tempAggregateBy, setTempAggregateBy] = useState(aggregateBy);
  const [tempCurrency, setTempCurrency] = useState(currency);

  const handleOpen = () => {
    setTempWindow(window);
    setTempAggregateBy(aggregateBy);
    setTempCurrency(currency);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleApply = () => {
    setWindow(tempWindow);
    setAggregateBy(tempAggregateBy);
    setCurrency(tempCurrency);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={handleOpen}
        sx={{ marginRight: 1, borderWidth: 2, "&:hover": { borderWidth: 2 } }}
      >
        Edit
      </Button>

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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApply} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo(ExternalCostsControls);
