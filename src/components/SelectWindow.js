import React, { useEffect, useState } from "react";
import { endOfDay, startOfDay } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Button, Link, Popover, TextField } from "@mui/material";
import { isValid } from "date-fns";
import { find, get } from "lodash";

const SelectWindow = ({ windowOptions, window, setWindow }) => {
  const [open, setOpen] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [intervalString, setIntervalString] = useState(null);

  const [startDateHelperText, setStartDateHelperText] = useState("");
  const [endDateHelperText, setEndDateHelperText] = useState("");

  const handleClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
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

  const anchorRef = React.useRef(null);
  const popoverContainerRef = React.useRef(null);

  return (
    <>
      <TextField
        inputRef={anchorRef}
        id="date-range-input"
        label="Date Range"
        value={get(find(windowOptions, { value: window }), "name", "Custom")}
        onClick={handleClick}
        variant="standard"
        InputProps={{
          readOnly: true,
        }}
        style={{ width: 120, cursor: "pointer" }}
      />
      <Popover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
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
            onClick: (e) => {
              e.stopPropagation();
            },
          },
        }}
      >
        <div
          ref={popoverContainerRef}
          style={{
            paddingLeft: 18,
            paddingRight: 18,
            paddingTop: 6,
            paddingBottom: 18,
            display: "flex",
            flexFlow: "row",
          }}
          onClick={(e) => {
            e.stopPropagation();
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
                popper: {
                  placement: "bottom-start",
                  container: document.body,
                  modifiers: [
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                        rootBoundary: "viewport",
                        padding: 8,
                      },
                    },
                    {
                      name: "flip",
                      options: {
                        fallbackPlacements: ["bottom", "top", "top-start"],
                      },
                    },
                    {
                      name: "offset",
                      options: {
                        offset: [0, 8],
                      },
                    },
                  ],
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
                popper: {
                  placement: "bottom-start",
                  container: document.body,
                  modifiers: [
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                        rootBoundary: "viewport",
                        padding: 8,
                      },
                    },
                    {
                      name: "flip",
                      options: {
                        fallbackPlacements: ["bottom", "top", "top-start"],
                      },
                    },
                    {
                      name: "offset",
                      options: {
                        offset: [0, 8],
                      },
                    },
                  ],
                },
              }}
            />
            <div>
              <Button
                variant="contained"
                style={{ marginTop: 16 }}
                onClick={handleSubmitCustomDates}
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
              <Link
                key={opt.value}
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmitPresetDates(opt.value);
                }}
                style={{
                  cursor: "pointer",
                  marginBottom: "0.5rem",
                  textAlign: "left",
                  display: "block",
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                {opt.name}
              </Link>
            ))}
          </div>
        </div>
      </Popover>
    </>
  );
};

export default React.memo(SelectWindow);
