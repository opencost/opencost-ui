import React, { useEffect, useState } from "react";
import { endOfDay, startOfDay, isValid } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import { find, get } from "lodash";

const windowOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
];

const AssetsSelectWindow = ({ window, setWindow }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [intervalString, setIntervalString] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStartDateChange = (date) => {
    if (isValid(date)) {
      setStartDate(startOfDay(date));
    }
  };

  const handleEndDateChange = (date) => {
    if (isValid(date)) {
      setEndDate(endOfDay(date));
    }
  };

  const handlePresetClick = (value) => {
    setWindow(value);
    setStartDate(null);
    setEndDate(null);
    handleClose();
  };

  const handleApplyCustom = () => {
    if (intervalString !== null) {
      setWindow(intervalString);
      handleClose();
    }
  };

  useEffect(() => {
    if (startDate !== null && endDate !== null) {
      let adjustedStartDate = new Date(
        startDate - startDate.getTimezoneOffset() * 60000,
      );
      let adjustedEndDate = new Date(
        endDate - endDate.getTimezoneOffset() * 60000,
      );
      setIntervalString(
        adjustedStartDate.toISOString().split(".")[0] +
          "Z" +
          "," +
          adjustedEndDate.toISOString().split(".")[0] +
          "Z",
      );
    }
  }, [startDate, endDate]);

  const open = Boolean(anchorEl);
  const selectedName = get(
    find(windowOptions, { value: window }),
    "name",
    "Custom",
  );

  return (
    <>
      <TextField
        id="assets-date-range"
        label="Date Range"
        value={selectedName}
        onClick={handleClick}
        slotProps={{
          htmlInput: {
            readOnly: true,
            style: { cursor: "pointer" },
          },
        }}
        sx={{
          width: 150,
          "& .MuiInputBase-root": {
            backgroundColor: "#ffffff",
            borderRadius: "8px",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#e0e0e0",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0f62fe",
          },
        }}
        variant="outlined"
        size="small"
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              mt: 1,
              overflow: "hidden",
            },
          },
        }}
      >
        <div
          style={{
            display: "flex",
            minWidth: 420,
          }}
        >
          <div
            style={{
              padding: "20px",
              borderRight: "1px solid #e8e8e8",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <DatePicker
              format="MM/dd/yyyy"
              label="Start Date"
              value={startDate}
              maxDate={new Date()}
              onChange={handleStartDateChange}
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: { width: 150 },
                },
              }}
            />
            <DatePicker
              format="MM/dd/yyyy"
              label="End Date"
              value={endDate}
              maxDate={new Date()}
              onChange={handleEndDateChange}
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: { width: 150 },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleApplyCustom}
              disabled={!startDate || !endDate}
              sx={{
                mt: 1,
                background: "#0f62fe",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                color: "#ffffff",
                "&:hover": {
                  background: "#0043ce",
                },
                "&:disabled": {
                  background: "#c6c6c6",
                  color: "#8d8d8d",
                },
              }}
            >
              Apply
            </Button>
          </div>

          {/* Presets Section */}
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {windowOptions.map((opt) => (
              <span
                key={opt.value}
                onClick={() => handlePresetClick(opt.value)}
                style={{
                  color: window === opt.value ? "#0f62fe" : "#525252",
                  fontWeight: window === opt.value ? 600 : 400,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#0f62fe";
                  e.target.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color =
                    window === opt.value ? "#0f62fe" : "#525252";
                  e.target.style.textDecoration = "none";
                }}
              >
                {opt.name}
              </span>
            ))}
          </div>
        </div>
      </Popover>
    </>
  );
};

export default AssetsSelectWindow;
