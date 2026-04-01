import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import * as React from "react";

import SelectWindow from "../../SelectWindow";

function EditCloudCostControls({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  costMetricOptions,
  costMetric,
  setCostMetric,
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
        <InputLabel id="costMetric-label">Cost Metric</InputLabel>
        <Select
          id="costMetric"
          value={costMetric}
          onChange={(e) => setCostMetric(e.target.value)}
        >
          {costMetricOptions.map((opt) => (
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

export default React.memo(EditCloudCostControls);
