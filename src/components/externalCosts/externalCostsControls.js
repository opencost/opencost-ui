import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import * as React from "react";

import SelectWindow from "../../components/SelectWindow";
import {
  windowOptions,
  aggregationOptions,
  costTypeOptions,
} from "../../components/externalCosts/tokens";

function ExternalCostsControls({
  window,
  setWindow,
  aggregateBy,
  setAggregateBy,
  costType,
  setCostType,
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
        <InputLabel id="aggregation-select-label">Cost Type</InputLabel>
        <Select
          id="cost-type-select"
          value={costType}
          onChange={(e) => {
            setCostType(e.target.value);
          }}
        >
          {costTypeOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default React.memo(ExternalCostsControls);
