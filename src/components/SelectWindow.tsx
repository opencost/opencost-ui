import React, { useEffect, useState } from "react";
import { endOfDay, startOfDay, isValid } from "date-fns";
import { find, get } from "lodash";
import {
  DatePicker,
  DatePickerInput,
  TextInput,
  Button,
  Link,
  Stack,
  Form,
} from "@carbon/react";

const SelectWindow = ({ windowOptions, window, setWindow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [intervalString, setIntervalString] = useState(null);
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  const handleStartDateChange = (dates) => {
    const date = dates[0];
    setStartDateError("");
    if (isValid(date)) {
      setStartDate(startOfDay(date));
    }
  };

  const handleEndDateChange = (dates) => {
    const date = dates[0];
    setEndDateError("");
    if (isValid(date)) {
      setEndDate(endOfDay(date));
    }
  };

  const handleSubmitPresetDates = (dateString) => {
    setWindow(dateString);
    setStartDate(null);
    setEndDate(null);
    setIsOpen(false);
  };

  const handleSubmitCustomDates = () => {
    if (intervalString !== null) {
      setWindow(intervalString);
      setIsOpen(false);
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

  const displayValue = get(find(windowOptions, { value: window }), "name", "Custom");

  return (
    <div style={{ position: "relative" }}>
      <TextInput
        id="date-range-input"
        labelText="Date Range"
        value={displayValue}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer", width: "150px" }}
      />
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 1000,
            backgroundColor: "var(--cds-layer)",
            border: "1px solid var(--cds-border-subtle)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            padding: "1rem",
            marginTop: "4px",
            minWidth: "400px",
          }}
        >
          <Stack gap={4} orientation="horizontal">
            <Form>
              <Stack gap={3}>
                <DatePicker
                  datePickerType="single"
                  value={startDate}
                  maxDate={new Date()}
                  onChange={handleStartDateChange}
                  dateFormat="m/d/Y"
                >
                  <DatePickerInput
                    id="date-picker-start"
                    labelText="Start Date"
                    placeholder="mm/dd/yyyy"
                    invalid={!!startDateError}
                    invalidText={startDateError}
                  />
                </DatePicker>
                <DatePicker
                  datePickerType="single"
                  value={endDate}
                  maxDate={new Date()}
                  onChange={handleEndDateChange}
                  dateFormat="m/d/Y"
                >
                  <DatePickerInput
                    id="date-picker-end"
                    labelText="End Date"
                    placeholder="mm/dd/yyyy"
                    invalid={!!endDateError}
                    invalidText={endDateError}
                  />
                </DatePicker>
                <Button onClick={handleSubmitCustomDates} kind="primary">
                  Apply
                </Button>
              </Stack>
            </Form>
            <Stack gap={2} style={{ paddingTop: "0.5rem", minWidth: "120px" }}>
              {windowOptions.map((opt) => (
                <Link
                  key={opt.value}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmitPresetDates(opt.value);
                  }}
                >
                  {opt.name}
                </Link>
              ))}
            </Stack>
          </Stack>
        </div>
      )}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default React.memo(SelectWindow);
