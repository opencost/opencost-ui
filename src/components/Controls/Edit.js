import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/styles';
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

// import React from 'react';
import React, { useState, useEffect } from 'react';

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
<<<<<<< HEAD

  conversionInputContainer: {
    display: 'flex',
    alignItems: 'center', // <--- CHANGE THIS from 'flex-end' to 'center'
    gap: '8px',
    margin: 8,
  },
  conversionFormControl: {
    minWidth: 150,
  },
  applyButton: {
    // Experiment with this value. Often a small negative margin-top
    // or positive margin-bottom is needed to visually shift it up.
    marginTop: '-6px', // Adjust this value (e.g., -4px, -8px)
    // Or try a positive margin-bottom if align-items: flex-start
    // marginBottom: '4px',
  },
}});
=======
  },
});
>>>>>>> e506066 (feat: Add support for multiple aggregations in cost allocation view)

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
<<<<<<< HEAD
  }
=======
  };
>>>>>>> e506066 (feat: Add support for multiple aggregations in cost allocation view)

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
