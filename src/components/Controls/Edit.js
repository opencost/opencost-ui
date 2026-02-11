import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React from "react";
import SelectWindow from "../SelectWindow";

function EditControl({
  windowOptions = [],
  window = "",
  setWindow,
  aggregationOptions = [],
  aggregateBy = "",
  setAggregateBy,
  accumulateOptions = [],
  accumulate = "",
  setAccumulate,
  currencyOptions = [],
  currency = "",
  setCurrency,
}) {
  return (
    <div style={{ display: "inline-flex" }}>
      {/* Time Window Selector */}
      <SelectWindow
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow}
      />

      {/* Breakdown / Aggregation Selector */}
      <FormControl style={{ margin: 8, minWidth: 120 }} variant="standard">
        <InputLabel id="aggregation-select-label">Breakdown</InputLabel>
        <Select
          labelId="aggregation-select-label"
          id="aggregation-select"
          value={aggregateBy || ""}
          onChange={(e) => setAggregateBy(e.target.value)}
        >
          {aggregationOptions && aggregationOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Resolution / Accumulate Selector */}
      <FormControl style={{ margin: 8, minWidth: 120 }} variant="standard">
        <InputLabel id="accumulate-label">Resolution</InputLabel>
        <Select
          labelId="accumulate-label"
          id="accumulate"
          value={accumulate || ""}
          onChange={(e) => setAccumulate(e.target.value)}
        >
          {accumulateOptions && accumulateOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Currency Selector */}
      <FormControl style={{ margin: 8, minWidth: 120 }} variant="standard">
        <InputLabel id="currency-label">Currency</InputLabel>
        <Select
          labelId="currency-label"
          id="currency"
          value={currency || ""}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {currencyOptions && currencyOptions.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default React.memo(EditControl);