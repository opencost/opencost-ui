import React, { useEffect, useState } from "react";
import { endOfDay, startOfDay } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { isValid } from "date-fns";
import { find, get } from "lodash";

const SelectWindow = ({ windowOptions, window, setWindow }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [intervalString, setIntervalString] = useState(null);

  const [startDateHelperText, setStartDateHelperText] = useState("");
  const [endDateHelperText, setEndDateHelperText] = useState("");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStartDateChange = (date) => {
    setStartDateHelperText("");
    if (isValid(date)) {
      setStartDate(startOfDay(date));
    }
  };

  const handleEndDateChange = (date) => {
    setEndDateHelperText("");
    if (isValid(date)) {
      setEndDate(endOfDay(date));
    }
  };

  const handleSubmitPresetDates = (dateString) => {
    setWindow(dateString);
    setStartDate(null);
    setEndDate(null);
    handleClose();
  };

  const handleSubmitCustomDates = () => {
    if (intervalString !== null) {
      setWindow(intervalString);
      handleClose();
    }
  };

  useEffect(() => {
    if (startDate !== null && endDate !== null) {
      // Note: getTimezoneOffset() is calculated based on current system locale, NOT date object
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
  const id = open ? "date-range-popover" : undefined;

  return (
    <>
      <TextField
        id="filled-read-only-input"
        label="Date Range"
        value={get(find(windowOptions, { value: window }), "name", "Custom")}
        onClick={(e) => handleClick(e)}
        slotProps={{
          htmlInput: {
            readOnly: true,
            style: { cursor: "pointer" },
          },
        }}
        style={{ margin: 8, width: 120 }}
        variant="standard"
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div
          style={{
            paddingLeft: 18,
            paddingRight: 18,
            paddingTop: 6,
            paddingBottom: 18,
            display: "flex",
            flexFlow: "row",
          }}
        >
          <div style={{ display: "flex", flexFlow: "column" }}>
            <DatePicker
              style={{ width: "144px" }}
              autoOk={true}
              disableToolbar
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-start"
              label="Start Date"
              value={startDate}
              maxDate={new Date()}
              maxDateMessage="Date should not be after today."
              onChange={handleStartDateChange}
              onError={(error, value) => {
                if (error === "maxDate") {
                  setStartDateHelperText("Date should not be after today.");
                }
              }}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              slotProps={{
                field: {
                  helperText: startDateHelperText,
                  variant: "standard",
                },
              }}
            />
            <DatePicker
              style={{ width: "144px" }}
              autoOk={true}
              disableToolbar
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-end"
              label="End Date"
              value={endDate}
              maxDate={new Date()}
              maxDateMessage="Date should not be after today."
              onChange={handleEndDateChange}
              onError={(error, value) => {
                if (error === "maxDate") {
                  setEndDateHelperText("Date should not be after today.");
                }
              }}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              slotProps={{
                field: {
                  helperText: endDateHelperText,
                  variant: "standard",
                },
              }}
            />
            <div>
              <Button
                style={{ marginTop: 16 }}
                variant="contained"
                onClick={handleSubmitCustomDates}
                color="info"
              >
                Apply
              </Button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexFlow: "column",
              paddingTop: 12,
              marginLeft: 18,
            }}
          >
            {windowOptions.map((opt) => (
              <Typography key={opt.value}>
                <Link
                  style={{ cursor: "pointer" }}
                  key={opt.value}
                  value={opt.value}
                  onClick={() => handleSubmitPresetDates(opt.value)}
                  sx={{
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {opt.name}
                </Link>
              </Typography>
            ))}
          </div>
        </div>
      </Popover>
    </>
  );
};

export default React.memo(SelectWindow);
