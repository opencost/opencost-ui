import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';

import {
  ABSENT,
  ABSENT_LABEL,
  AVAILABILITY,
  BINDING_CONSTRAINT_LABELS,
  availabilityExplanation,
  capacityBand,
  dimensionToProperty,
  formatCost,
  formatPercent,
} from './tokens.js';

const useStyles = makeStyles({
  absent: {
    color: '#8a8a8a',
    fontStyle: 'italic',
  },
  bandLow: { backgroundColor: '#fdecea', color: '#611a15' },
  bandModerate: { backgroundColor: '#fff4e5', color: '#663c00' },
  bandHigh: { backgroundColor: '#edf7ed', color: '#1e4620' },
  numeric: { fontVariantNumeric: 'tabular-nums' },
  clickable: { cursor: 'pointer' },
  note: { color: '#8a8a8a', fontSize: '0.75rem' },
});

const COLUMNS = [
  { id: 'name', label: 'Name', numeric: false },
  { id: 'capacityConsumption', label: 'Capacity consumed', numeric: true },
  { id: 'bindingConstraint', label: 'Bound by', numeric: false },
  { id: 'idleCost', label: 'Idle cost', numeric: true },
  { id: 'totalCost', label: 'Total cost', numeric: true },
  { id: 'costPerMillionTokens', label: 'Cost / 1M tokens', numeric: true },
];

/**
 * Absent renders a value the API did not report.
 *
 * The visible marker is an em dash, which announces as nothing to a screen
 * reader, so the reason travels in the accessible name. Requirement 16.1 is
 * explicit that the meaning must not be conveyed by a dash, icon, or colour
 * alone.
 */
const Absent = ({ reason }) => {
  const classes = useStyles();
  return (
    <Tooltip title={reason || ABSENT_LABEL}>
      <span className={classes.absent} aria-label={`${ABSENT_LABEL}: ${reason || ''}`}>
        {ABSENT}
      </span>
    </Tooltip>
  );
};

/**
 * CapacityCell renders capacity consumption as a percentage plus a band label.
 *
 * The band name is text, not only a colour fill, because a red chip means
 * nothing to a colour-blind or screen-reader user and this is the number the
 * whole page exists to communicate.
 */
const CapacityCell = ({ row }) => {
  const classes = useStyles();
  const value = row.efficiency?.capacityConsumption;
  const band = capacityBand(value);

  if (band === null) {
    return <Absent reason={availabilityExplanation(row.measurementAvailability, row)} />;
  }

  const bandClass = {
    low: classes.bandLow,
    moderate: classes.bandModerate,
    high: classes.bandHigh,
  }[band.name];

  const kvOnly = row.measurementAvailability === AVAILABILITY.NO_BATCH_DENOMINATOR;

  return (
    <span>
      <Chip
        size="small"
        className={bandClass}
        label={`${formatPercent(value)} ${band.label}`}
        aria-label={`${formatPercent(value)} capacity consumed, ${band.label} band. ${band.description}.`}
      />
      {kvOnly && (
        <Typography component="div" className={classes.note}>
          KV-cache only
        </Typography>
      )}
    </span>
  );
};

const InferenceTable = ({
  rows,
  dimension,
  currency,
  sortBy,
  sortDirection,
  onSort,
  onDrilldown,
  canDrilldown,
}) => {
  const classes = useStyles();

  if (rows.length === 0) {
    return (
      <Typography style={{ padding: 24 }}>
        No inference workloads were found in this window. This is a measured result, not an error.
      </Typography>
    );
  }

  return (
    <Table size="small">
      <caption style={{ captionSide: 'top', padding: '0 24px 8px' }}>
        Inference cost and capacity consumption, highest idle cost first.
      </caption>
      <TableHead>
        <TableRow>
          {COLUMNS.map((col) => (
            <TableCell
              key={col.id}
              align={col.numeric ? 'right' : 'left'}
              scope="col"
              sortDirection={sortBy === col.id ? sortDirection : false}
            >
              <TableSortLabel
                active={sortBy === col.id}
                direction={sortBy === col.id ? sortDirection : 'desc'}
                onClick={() => onSort(col.id)}
              >
                {col.label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => {
          const name = row.properties?.[dimensionToProperty[dimension]] || row.key;
          const constraint = row.efficiency?.bindingConstraint;
          const excluded = row.excludedMemberCount;

          return (
            <TableRow
              key={row.key}
              hover={canDrilldown}
              className={canDrilldown ? classes.clickable : undefined}
              tabIndex={canDrilldown ? 0 : -1}
              onClick={canDrilldown ? () => onDrilldown(row) : undefined}
              onKeyDown={
                canDrilldown
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onDrilldown(row);
                      }
                    }
                  : undefined
              }
            >
              <TableCell scope="row">
                {name}
                {excluded > 0 && (
                  <Tooltip
                    title={
                      `${excluded} member(s) are excluded from the derived measures because their own ` +
                      'telemetry is unavailable. Capacity consumed and idle cost cover the included members only.'
                    }
                  >
                    <Typography
                      component="div"
                      className={classes.note}
                      aria-label={`partial coverage: ${excluded} members excluded from the derived measures`}
                    >
                      partial coverage: {excluded} excluded
                    </Typography>
                  </Tooltip>
                )}
              </TableCell>

              <TableCell align="right">
                <CapacityCell row={row} />
              </TableCell>

              <TableCell>
                {constraint ? (
                  BINDING_CONSTRAINT_LABELS[constraint] || constraint
                ) : (
                  <Absent reason={availabilityExplanation(row.measurementAvailability, row)} />
                )}
              </TableCell>

              <TableCell align="right" className={classes.numeric}>
                {row.efficiency?.idleCost == null ? (
                  <Absent reason={availabilityExplanation(row.measurementAvailability, row)} />
                ) : (
                  formatCost(row.efficiency.idleCost, currency)
                )}
              </TableCell>

              <TableCell align="right" className={classes.numeric}>
                {formatCost(row.totalCost, currency)}
              </TableCell>

              <TableCell align="right" className={classes.numeric}>
                {formatCost(row.costPerMillionTokens, currency)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default InferenceTable;
