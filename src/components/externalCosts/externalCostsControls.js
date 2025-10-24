import { makeStyles } from "@material-ui/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import * as React from "react";

import SelectWindow from "../../components/SelectWindow";
import {
  windowOptions,
  aggregationOptions,
  costTypeOptions,
} from "../../components/externalCosts/tokens";

const useStyles = makeStyles({
  wrapper: {
    display: "inline-flex",
  },
  formControl: {
    margin: 8,
    minWidth: 120,
  },
});

function ExternalCostsControls({
  window,
  setWindow,
  aggregateBy,
  setAggregateBy,
  costType,
  setCostType,
}) {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <SelectWindow
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow}
      />
      <FormControl className={classes.formControl}>
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
      <FormControl className={classes.formControl}>
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
