import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import SelectWindow from "../SelectWindow";
import { windowOptions, aggregationOptions } from "./tokens";

function AssetsControls({ window, setWindow, aggregateBy, setAggregateBy }) {
  return (
    <div style={{ display: "inline-flex", marginBottom: "1rem" }}>
      <SelectWindow
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow}
      />
      <FormControl style={{ margin: 8, minWidth: 150 }} variant="standard">
        <InputLabel id="aggregate-by-label">Aggregate by</InputLabel>
        <Select
          labelId="aggregate-by-label"
          id="aggregate-by-select"
          value={aggregateBy}
          onChange={(e) => setAggregateBy(e.target.value)}
        >
          {aggregationOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default React.memo(AssetsControls);
