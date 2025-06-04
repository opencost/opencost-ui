import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/styles';

import React from 'react';

import SelectWindow from '../SelectWindow';

const useStyles = makeStyles({
  wrapper: {
    display: 'inline-flex',
  },
  formControl: {
    margin: 8,
    minWidth: 120,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },
  chip: {
    margin: 2,
  },
});

function EditControl({
  windowOptions, window, setWindow,
  aggregationOptions, aggregateBy, setAggregateBy,
  accumulateOptions, accumulate, setAccumulate,
  currencyOptions, currency, setCurrency,
}) {
  const classes = useStyles();

  // Handle multiple aggregations
  const handleAggregationChange = (event) => {
    const value = event.target.value;
    setAggregateBy(value);
  };

  return (
    <div className={classes.wrapper}>
      <SelectWindow
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow} />
      <FormControl className={classes.formControl}>
        <InputLabel id="aggregation-select-label">Breakdown</InputLabel>
        <Select
          id="aggregation-select"
          multiple
          value={Array.isArray(aggregateBy) ? aggregateBy : [aggregateBy]}
          onChange={handleAggregationChange}
          renderValue={(selected) => (
            <Box className={classes.chips}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={aggregationOptions.find(opt => opt.value === value)?.name || value}
                  className={classes.chip}
                />
              ))}
            </Box>
          )}
        >
          {aggregationOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel id="accumulate-label">Resolution</InputLabel>
        <Select
          id="accumulate"
          value={accumulate}
          onChange={e => setAccumulate(e.target.value)}
        >
          {accumulateOptions.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.name}</MenuItem>)}
        </Select>
      </FormControl>
      {currencyOptions && (
        <FormControl className={classes.formControl}>
          <InputLabel id="currency-select-label">Currency</InputLabel>
          <Select
            id="currency-select"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          >
            {currencyOptions.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
      )}
    </div>
  );
}

export default EditControl;
