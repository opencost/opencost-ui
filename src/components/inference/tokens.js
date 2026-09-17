// Shared vocabulary for the inference efficiency view.
//
// The rule this module exists to enforce: a value the API omitted is rendered as
// absent, never as zero. A pooling model has no capacity consumption; showing it
// as 0.0% would read as 100% waste and invite someone to delete a healthy
// embedding deployment. Every formatter here returns ABSENT for null or
// undefined rather than coercing to a number.

/** The marker shown in place of a value the API did not report. */
export const ABSENT = '—';

/** Screen-reader text for ABSENT. An em dash alone announces as nothing. */
export const ABSENT_LABEL = 'not measured';

export const AVAILABILITY = {
  AVAILABLE: 'available',
  NO_DECODE_LOOP: 'no_decode_loop',
  ENGINE_TELEMETRY_UNAVAILABLE: 'engine_telemetry_unavailable',
  NO_BATCH_DENOMINATOR: 'no_batch_denominator',
  ENGINE_UNSUPPORTED: 'engine_unsupported',
};

export const BINDING_CONSTRAINT_LABELS = {
  kv_cache: 'KV cache',
  batch_slots: 'Batch slots',
  queue: 'Queue',
  none: 'Not constrained',
};

export const windowOptions = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '48h', label: 'Last 48 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

export const aggregationOptions = [
  { value: 'model_name', label: 'Model' },
  { value: 'namespace', label: 'Namespace' },
  { value: 'cluster', label: 'Cluster' },
  { value: 'pod', label: 'Replica' },
  { value: 'controller', label: 'Controller' },
  { value: 'node', label: 'Node' },
];

export const costBasisOptions = [
  { value: 'allocation', label: 'Allocation (reconciles to the bill)' },
  { value: 'usage', label: 'Usage (active consumption only)' },
];

// The drill-down ladder. Selecting a row filters on the current dimension and
// descends. `pod` is the floor: selecting a replica opens its detail rather than
// descending further.
export const DRILLDOWN = {
  model_name: 'namespace',
  namespace: 'pod',
};

/** The property name each aggregation dimension reads from an entry. */
export const dimensionToProperty = {
  model_name: 'modelName',
  model_version: 'modelVersion',
  namespace: 'namespace',
  cluster: 'cluster',
  pod: 'pod',
  controller: 'controller',
  controller_kind: 'controllerKind',
  container: 'container',
  node: 'node',
  engine: 'engine',
};

const BANDS = [
  { name: 'low', label: 'Low', max: 0.3, description: 'Mostly unconsumed capacity' },
  { name: 'moderate', label: 'Moderate', max: 0.7, description: 'Partly consumed capacity' },
  { name: 'high', label: 'High', max: Infinity, description: 'Near capacity' },
];

/**
 * capacityBand classifies a capacity consumption value into one of three bands.
 *
 * Returns null for an absent value rather than defaulting to the lowest band.
 * Bucketing an unmeasured engine into "low" would state a measurement that was
 * never taken, which is the failure mode this whole view is built to avoid.
 */
export function capacityBand(value) {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }
  return BANDS.find((b) => value < b.max) || BANDS[BANDS.length - 1];
}

// Intl is used rather than manual arithmetic because manual arithmetic
// overflows. `(value * 100).toFixed(1)` produces the string "Infinity%" for
// inputs above ~1.79e306, since the multiply overflows before toFixed sees it.
// A property test caught that; Intl formats the same input as a very long but
// finite number. Capacity consumption is contractually in [0, 1], so such a
// value means the backend violated its contract, and the honest response is to
// render something finite rather than the word Infinity.
const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** formatPercent renders a [0, 1] fraction as a percentage with one decimal. */
export function formatPercent(value) {
  if (value == null || !Number.isFinite(value)) {
    return ABSENT;
  }
  return percentFormatter.format(value);
}

const currencyFormatters = new Map();

function currencyFormatter(currency) {
  if (!currencyFormatters.has(currency)) {
    let formatter;
    try {
      formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      // An unrecognised currency code must not blow up a table render.
      formatter = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    currencyFormatters.set(currency, formatter);
  }
  return currencyFormatters.get(currency);
}

/**
 * formatCost renders a monetary amount with two decimal places and thousands
 * separators.
 *
 * A non-zero amount below the smallest displayable unit renders as a less-than
 * rather than rounding to zero, because "$0.00" claims a cost of nothing and a
 * per-million-token figure genuinely can be smaller than a cent.
 */
export function formatCost(value, currency = 'USD') {
  if (value == null || !Number.isFinite(value)) {
    return ABSENT;
  }

  const magnitude = Math.abs(value);
  if (magnitude > 0 && magnitude < 0.005) {
    const sign = value < 0 ? '-' : '';
    return `${sign}<${currencyFormatter(currency).format(0.01)}`;
  }

  return currencyFormatter(currency).format(value);
}

/** formatCount renders an integer-ish count, or ABSENT. */
export function formatCount(value) {
  if (value == null || !Number.isFinite(value)) {
    return ABSENT;
  }
  return new Intl.NumberFormat().format(Math.round(value));
}

/** formatGauge renders a gauge value with two decimals, or ABSENT. */
export function formatGauge(value) {
  if (value == null || !Number.isFinite(value)) {
    return ABSENT;
  }
  return value.toFixed(2);
}

/**
 * availabilityExplanation returns the sentence shown when a row's derived
 * measures are absent.
 *
 * Every branch states what the telemetry does or does not support. None of them
 * describe the workload as wasteful, because for a pooling model or an
 * unsupported engine that is not a conclusion the data licenses.
 */
export function availabilityExplanation(availability, entry = {}) {
  switch (availability) {
    case AVAILABILITY.AVAILABLE:
      return 'Capacity consumption is measured from engine telemetry.';

    case AVAILABILITY.NO_DECODE_LOOP:
      return (
        'This engine serves a pooling model (embedding, classification, or reward), which runs no ' +
        'decode loop. Capacity signals are absent by design, not by collection failure.'
      );

    case AVAILABILITY.ENGINE_TELEMETRY_UNAVAILABLE:
      return (
        'No engine telemetry matched this workload. Cost is reported; capacity consumption was not ' +
        'measured. Check that model-server metrics carry a pod_uid label.'
      );

    case AVAILABILITY.NO_BATCH_DENOMINATOR:
      return (
        'The queue was never non-empty, so no concurrent-sequence ceiling could be observed. ' +
        'Capacity consumption rests on KV-cache utilization alone.'
      );

    case AVAILABILITY.ENGINE_UNSUPPORTED: {
      const engine = entry?.saturation?.engine || 'this engine';
      return `No metric mapping is implemented for ${engine}. Cost is reported; capacity signals are not.`;
    }

    default:
      // A backend that adds a value this build has not learned must not produce
      // a blank cell, which would read as "nothing to report".
      return `Capacity consumption was not reported. The API returned an unrecognised status: ${availability}.`;
  }
}

/** Accessor for the value a sortable column reads. */
export const columnValue = {
  name: (row, dimension) => row.properties?.[dimensionToProperty[dimension]] ?? row.key,
  capacityConsumption: (row) => row.efficiency?.capacityConsumption,
  bindingConstraint: (row) => row.efficiency?.bindingConstraint,
  idleCost: (row) => row.efficiency?.idleCost,
  totalCost: (row) => row.totalCost,
  costPerMillionTokens: (row) => row.costPerMillionTokens,
};

/**
 * sortRows orders rows by a column.
 *
 * Rows whose value for that column is absent always sort last, in both
 * directions. An absent value is not comparable: treating it as -Infinity would
 * put every unmeasured workload at the top of an ascending sort, which is
 * exactly where someone hunting for waste would misread it.
 *
 * The sort is stable, so equal values keep their relative order and the table
 * does not reshuffle between renders.
 */
export function sortRows(rows, column, direction, dimension = 'model_name') {
  const read = columnValue[column] || columnValue.totalCost;
  const factor = direction === 'asc' ? 1 : -1;

  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const av = read(a.row, dimension);
      const bv = read(b.row, dimension);

      const aAbsent = av == null || (typeof av === 'number' && !Number.isFinite(av));
      const bAbsent = bv == null || (typeof bv === 'number' && !Number.isFinite(bv));

      if (aAbsent && bAbsent) return a.index - b.index;
      if (aAbsent) return 1;
      if (bAbsent) return -1;

      if (typeof av === 'string' || typeof bv === 'string') {
        const cmp = String(av).localeCompare(String(bv));
        return cmp !== 0 ? cmp * factor : a.index - b.index;
      }

      if (av === bv) return a.index - b.index;
      return (av - bv) * factor;
    })
    .map((entry) => entry.row);
}
