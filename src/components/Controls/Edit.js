import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import React from "react";

import SelectWindow from "../SelectWindow";

function EditControl({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  accumulateOptions,
  accumulate,
  setAccumulate,
  currencyOptions,
  currency,
  setCurrency,
}) {
  return (
    <div style={{ display: "inline-flex" }}>
      <SelectWindow
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow}
      />
      <FormControl style={{ margin: 8, minWidth: 120 }} variant="standard">
        <InputLabel id="aggregation-select-label">Breakdown</InputLabel>
        <Select
          id="aggregation-select"
          value={aggregateBy}
          onChange={(e) => {
            setAggregateBy(e.target.value);
          }}
        >
          {aggregationOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ margin: 8, minWidth: 120 }} variant="standard">
        <InputLabel id="accumulate-label">Resolution</InputLabel>
        <Select
          id="accumulate"
          value={accumulate}
          onChange={(e) => setAccumulate(e.target.value)}
        >
          {accumulateOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ margin: 8, minWidth: 120 }} variant="standard">
        <InputLabel id="currency-label">Currency</InputLabel>
        <Select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {currencyOptions?.map((currency) => (
            <MenuItem key={currency} value={currency}>
              {currency}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default React.memo(EditControl);
