import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/styles';
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"

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

function EditControl({
  windowOptions, window, setWindow,
  aggregationOptions, aggregateBy, setAggregateBy,
  accumulateOptions, accumulate, setAccumulate,
  currencyOptions, currency, setCurrency,
  conversionRate, setConversionRate,
}) {
  const classes = useStyles();

  // Handle multiple aggregations
  const handleAggregationChange = (event) => {
    const value = event.target.value;
    setAggregateBy(value);
  const [tempConversionRate, setTempConversionRate] = useState(
    String(conversionRate)
  );

  // Effect to update local input field if conversionRate from props changes (e.g., from URL)
  useEffect(() => {
    setTempConversionRate(String(conversionRate));
  }, [conversionRate]);

  // Function to handle button click and apply the rate
  const handleApplyConversionRate = () => {
    let rate = parseFloat(tempConversionRate);
    if (isNaN(rate) || rate <= 0) {
      // Handle invalid input: revert to default or show an error
      console.warn("Invalid conversion rate entered. Must be a positive number.");
      rate = 1.0; // Or some other default/error handling
      setTempConversionRate(String(rate)); // Update input field to show default
    }
    setConversionRate(rate); // Call the prop function, which updates parent state and URL
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
      <FormControl className={classes.formControl}>
        <InputLabel id="currency-label">Currency</InputLabel>
        <Select
          id="currency"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
        >
          {currencyOptions?.map((currency) => (
            <MenuItem key={currency} value={currency}>
              {currency}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className={classes.conversionInputContainer}>
        <FormControl className={classes.conversionFormControl}> {/* Wrapped TextField in FormControl */}
          <TextField
            label="Conversion Rate"
            type="number"
            value={tempConversionRate}
            onChange={(e) => setTempConversionRate(e.target.value)}
            inputProps={{
              step: "0.0001",
              min: "0.000001",
            }}
            helperText="Enter a positive number"
            variant="outlined"
            size="small"
            // No need for InputLabel here, TextField's label prop handles it
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyConversionRate}
          disabled={!tempConversionRate || parseFloat(tempConversionRate) === conversionRate}
          className={classes.applyButton}
        >
          Apply Rate
        </Button>
      </div>
      {/* <--- END OF CONVERSION RATE BLOCK */}

    </div>
  );
}}

export default EditControl;
