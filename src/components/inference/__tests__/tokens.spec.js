import fc from 'fast-check';

import {
  ABSENT,
  AVAILABILITY,
  availabilityExplanation,
  capacityBand,
  formatCost,
  formatPercent,
  sortRows,
} from '../tokens.js';

describe('capacityBand', () => {
  // Requirement 14.7: exactly three bands, boundaries at 0.30 and 0.70, and the
  // band must be conveyed by a text label rather than colour alone.
  test('low below 0.30, moderate to 0.70 exclusive, high at 0.70 and above', () => {
    expect(capacityBand(0).name).toBe('low');
    expect(capacityBand(0.2999).name).toBe('low');
    expect(capacityBand(0.3).name).toBe('moderate');
    expect(capacityBand(0.6999).name).toBe('moderate');
    expect(capacityBand(0.7).name).toBe('high');
    expect(capacityBand(1).name).toBe('high');
  });

  test('every band carries a text label, not only a colour', () => {
    for (const v of [0.1, 0.5, 0.9]) {
      const band = capacityBand(v);
      expect(band.label).toBeTruthy();
      expect(typeof band.label).toBe('string');
    }
  });

  test('an absent value is not a band', () => {
    // A pooling model has no capacity consumption. Bucketing it into "low"
    // would be the exact misreading this feature exists to prevent.
    expect(capacityBand(null)).toBeNull();
    expect(capacityBand(undefined)).toBeNull();
  });

  test('band assignment is total over [0, 1]', () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1, noNaN: true }), (v) => {
        const band = capacityBand(v);
        return band !== null && ['low', 'moderate', 'high'].includes(band.name);
      }),
    );
  });
});

describe('formatPercent and formatCost', () => {
  test('capacity consumption renders as a percentage with one decimal place', () => {
    expect(formatPercent(0.8312)).toBe('83.1%');
    expect(formatPercent(0)).toBe('0.0%');
    expect(formatPercent(1)).toBe('100.0%');
  });

  test('an absent number renders as the absent marker, never as zero', () => {
    // This is the single most important assertion in this file. A dash and a
    // "0.0%" mean opposite things to someone deciding whether to delete a
    // deployment.
    expect(formatPercent(null)).toBe(ABSENT);
    expect(formatPercent(undefined)).toBe(ABSENT);
    expect(formatCost(null, 'USD')).toBe(ABSENT);
    expect(formatCost(undefined, 'USD')).toBe(ABSENT);
  });

  test('cost renders with two decimal places in the selected currency', () => {
    expect(formatCost(819.673, 'USD')).toBe('$819.67');
    expect(formatCost(0, 'USD')).toBe('$0.00');
  });

  test('a non-zero amount below the smallest displayable unit renders as less-than', () => {
    // Rendering $0.001 as "$0.00" claims a cost of nothing. For a per-token
    // figure that is a real number the user may be dividing by.
    expect(formatCost(0.001, 'USD')).toBe('<$0.01');
  });

  test('formatters never emit NaN or Infinity for any finite or non-finite input', () => {
    fc.assert(
      fc.property(fc.double(), (v) => {
        const pct = formatPercent(v);
        const cost = formatCost(v, 'USD');
        return !/NaN|Infinity/.test(pct) && !/NaN|Infinity/.test(cost);
      }),
    );
  });
});

describe('availabilityExplanation', () => {
  test('every availability value has an explanation', () => {
    for (const value of Object.values(AVAILABILITY)) {
      const explanation = availabilityExplanation(value, {});
      expect(explanation).toBeTruthy();
      expect(explanation.length).toBeGreaterThan(10);
    }
  });

  test('the pooling-model explanation names the mode rather than implying waste', () => {
    const text = availabilityExplanation(AVAILABILITY.NO_DECODE_LOOP, {});
    expect(text.toLowerCase()).toContain('pooling');
    expect(text.toLowerCase()).not.toContain('waste');
    expect(text.toLowerCase()).not.toContain('idle');
  });

  test('the unsupported-engine explanation names the engine it saw', () => {
    const text = availabilityExplanation(AVAILABILITY.ENGINE_UNSUPPORTED, {
      saturation: { engine: 'sglang' },
    });
    expect(text).toContain('sglang');
  });

  test('an unrecognised value still explains itself rather than rendering blank', () => {
    // A backend that adds an availability value the UI has not learned yet must
    // not produce an empty cell that reads as "fine".
    const text = availabilityExplanation('some_future_value', {});
    expect(text).toContain('some_future_value');
  });
});

describe('sortRows', () => {
  const row = (name, idle, cap) => ({
    key: name,
    properties: { modelName: name },
    totalCost: 100,
    efficiency: { idleCost: idle, capacityConsumption: cap },
  });

  test('sorts by idle cost descending by default', () => {
    const rows = [row('a', 10, 0.5), row('b', 90, 0.1), row('c', 50, 0.3)];
    expect(sortRows(rows, 'idleCost', 'desc').map((r) => r.key)).toEqual(['b', 'c', 'a']);
  });

  test('rows whose sorted value is absent come last in both directions', () => {
    // Requirement 16.10. An absent value is not smaller than every number and
    // not larger than every number; it is not comparable, so it goes to the
    // bottom either way rather than topping the table on an ascending sort.
    const rows = [row('a', 10, 0.5), row('absent', undefined, undefined), row('b', 90, 0.1)];

    expect(sortRows(rows, 'idleCost', 'desc').map((r) => r.key)).toEqual(['b', 'a', 'absent']);
    expect(sortRows(rows, 'idleCost', 'asc').map((r) => r.key)).toEqual(['a', 'b', 'absent']);
  });

  test('sorting is stable for equal values, so the table does not reshuffle on re-render', () => {
    const rows = [row('a', 50, 0.5), row('b', 50, 0.5), row('c', 50, 0.5)];
    expect(sortRows(rows, 'idleCost', 'desc').map((r) => r.key)).toEqual(['a', 'b', 'c']);
  });

  test('sorting never drops or duplicates a row', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            key: fc.string({ minLength: 1 }),
            idle: fc.option(fc.double({ min: 0, max: 1e6, noNaN: true }), { nil: undefined }),
          }),
          { maxLength: 30 },
        ),
        fc.constantFrom('asc', 'desc'),
        (raw, direction) => {
          const rows = raw.map((r, i) => ({
            key: `${r.key}-${i}`,
            properties: {},
            totalCost: 0,
            efficiency: { idleCost: r.idle },
          }));
          const sorted = sortRows(rows, 'idleCost', direction);
          return (
            sorted.length === rows.length &&
            new Set(sorted.map((r) => r.key)).size === new Set(rows.map((r) => r.key)).size
          );
        },
      ),
    );
  });
});
