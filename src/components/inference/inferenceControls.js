import { Button, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import * as React from 'react';

import { aggregationOptions, costBasisOptions, windowOptions } from './tokens.js';

const Picker = ({ id, label, value, options, onChange }) => (
  <FormControl style={{ minWidth: 180, marginRight: 16 }}>
    <InputLabel id={`${id}-label`}>{label}</InputLabel>
    <Select
      labelId={`${id}-label`}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ 'aria-label': label }}
    >
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const InferenceControls = ({
  window,
  setWindow,
  aggregateBy,
  setAggregateBy,
  costBasis,
  setCostBasis,
  filters,
  clearFilters,
}) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap' }}>
    <Picker id="inference-window" label="Window" value={window} options={windowOptions} onChange={setWindow} />
    <Picker
      id="inference-aggregate"
      label="Group by"
      value={aggregateBy}
      options={aggregationOptions}
      onChange={setAggregateBy}
    />
    <Picker
      id="inference-cost-basis"
      label="Cost basis"
      value={costBasis}
      options={costBasisOptions}
      onChange={setCostBasis}
    />

    {filters.length > 0 && (
      <Button variant="outlined" onClick={clearFilters} style={{ marginBottom: 4 }}>
        Clear {filters.length} filter{filters.length === 1 ? '' : 's'}
      </Button>
    )}
  </div>
);

export default InferenceControls;
