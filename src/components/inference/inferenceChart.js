import { Typography } from '@material-ui/core';
import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCost } from './tokens.js';

const CONSUMED_COLOUR = '#2e7d32';
const IDLE_COLOUR = '#c62828';

/**
 * Turns the timeseries response into chart rows.
 *
 * Steps whose consumed and idle cost are both absent are carried through with
 * null values rather than zeros, so recharts leaves a gap. Plotting zero would
 * assert that nothing was consumed and nothing was wasted in that step, which is
 * a measurement nobody took.
 */
export function toChartData(sets) {
  if (!Array.isArray(sets)) return [];

  return sets.map((set) => {
    const entries = Object.values(set.inferenceCosts || {});

    let consumed = null;
    let idle = null;
    let excluded = 0;

    for (const entry of entries) {
      const c = entry.efficiency?.consumedCost;
      const i = entry.efficiency?.idleCost;

      if (c == null || i == null) {
        excluded += 1;
        continue;
      }
      consumed = (consumed || 0) + c;
      idle = (idle || 0) + i;
    }

    const start = set.window?.start ? new Date(set.window.start) : null;

    return {
      label: start ? start.toISOString().slice(0, 10) : '',
      consumedCost: consumed,
      idleCost: idle,
      excluded,
      empty: entries.length === 0,
    };
  });
}

const InferenceChart = ({ data, currency, height = 280 }) => {
  const rows = toChartData(data);

  const totals = rows.reduce(
    (acc, r) => ({
      consumed: acc.consumed + (r.consumedCost || 0),
      idle: acc.idle + (r.idleCost || 0),
    }),
    { consumed: 0, idle: 0 },
  );

  const emptySteps = rows.filter((r) => r.empty).length;
  const excludedSteps = rows.filter((r) => r.excluded > 0).length;

  if (rows.length === 0) {
    return <Typography style={{ padding: 24 }}>No trend data for this window.</Typography>;
  }

  // The text alternative is not decoration. A stacked bar chart is unreadable to
  // a screen reader, so the totals it conveys are stated in prose alongside it.
  const description =
    `Consumed and idle cost per day. Total consumed ${formatCost(totals.consumed, currency)}, ` +
    `total idle ${formatCost(totals.idle, currency)} across ${rows.length} steps.` +
    (emptySteps > 0 ? ` ${emptySteps} step(s) have no data and are shown as gaps.` : '');

  return (
    <div>
      <div role="img" aria-label={description} style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => formatCost(v, currency)} width={90} />
            <Tooltip formatter={(v, name) => [formatCost(v, currency), name]} />
            {/* Series are named in the legend, so the split is not conveyed by
                colour alone. */}
            <Legend />
            <Bar dataKey="consumedCost" name="Consumed" stackId="cost" fill={CONSUMED_COLOUR} />
            <Bar dataKey="idleCost" name="Idle" stackId="cost" fill={IDLE_COLOUR} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Typography component="p" style={{ padding: '0 24px 8px', color: '#8a8a8a', fontSize: '0.75rem' }}>
        {description}
        {excludedSteps > 0 &&
          ` ${excludedSteps} step(s) contain workloads whose capacity was not measurable; those are excluded from the bars.`}
      </Typography>
    </div>
  );
};

export default InferenceChart;
