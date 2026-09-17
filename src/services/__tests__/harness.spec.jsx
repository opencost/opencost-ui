import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { axe } from 'vitest-axe';

import {
  inferenceCostDegraded,
  inferenceCostTotalModel,
  inferenceEndpoints,
} from '../../../__tests__/handlers.js';
import { server } from '../../../__tests__/server.js';
import { http, HttpResponse } from 'msw';

// This file proves the test harness itself works before any feature code exists.
// It is not a placeholder to delete later: each test here fails loudly if a piece
// of the setup regresses, and a silently broken harness would let every feature
// test pass for the wrong reason.

describe('test harness', () => {
  test('jsdom renders a component and jest-dom matchers are loaded', () => {
    render(<h1>Inference efficiency</h1>);
    expect(screen.getByRole('heading', { name: 'Inference efficiency' })).toBeInTheDocument();
  });

  test('userEvent drives interaction and React state updates', async () => {
    const Counter = () => {
      const [n, setN] = useState(0);
      return <button onClick={() => setN(n + 1)}>clicked {n} times</button>;
    };

    render(<Counter />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button'));
    expect(await screen.findByRole('button', { name: 'clicked 1 times' })).toBeInTheDocument();
  });

  test('ResizeObserver is stubbed, so a recharts container can mount', () => {
    // recharts calls ResizeObserver on mount. Asserting the stub exists is
    // cheaper and clearer than mounting a chart, and it is the actual
    // precondition every chart test depends on.
    expect(typeof global.ResizeObserver).toBe('function');
    const observer = new global.ResizeObserver(() => {});
    expect(() => observer.observe(document.body)).not.toThrow();
  });

  test('matchMedia is stubbed, so MUI v4 useMediaQuery does not throw', () => {
    expect(typeof window.matchMedia).toBe('function');
    expect(window.matchMedia('(min-width: 600px)').matches).toBe(false);
  });

  test('vitest-axe matchers are loaded and can pass an accessible tree', async () => {
    const { container } = render(
      <main>
        <h1>Inference</h1>
        <table>
          <caption>Inference cost by model</caption>
          <thead>
            <tr>
              <th scope="col">Model</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>llama-3-8b</td>
            </tr>
          </tbody>
        </table>
      </main>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  test('vitest-axe actually detects a violation rather than passing everything', async () => {
    // A matcher that never fails is worse than no matcher. This pins that axe is
    // wired up and reporting, using an image with no alt text.
    const { container } = render(<img src="chart.png" />);
    const results = await axe(container);
    expect(results.violations.length).toBeGreaterThan(0);
  });
});

describe('MSW boundary', () => {
  test('default handlers serve the model-granularity fixture', async () => {
    const res = await fetch('http://opencost.test/inferenceCost/total?window=7d&aggregate=model_name');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Object.keys(body.data.inferenceCosts)).toHaveLength(3);
    expect(body).toEqual(inferenceCostTotalModel);
  });

  test('granularity=engine selects the engine fixture, so the param is really read', async () => {
    const res = await fetch('http://opencost.test/inferenceCost/total?window=7d&granularity=engine');
    const body = await res.json();

    const keys = Object.keys(body.data.inferenceCosts);
    expect(keys).toContain('3f2a1b8c-1111-4aaa-9bbb-000000000003/0');
    expect(keys).toContain('3f2a1b8c-1111-4aaa-9bbb-000000000003/1');
  });

  test('server.use overrides a handler for one test only', async () => {
    server.use(
      http.get(inferenceEndpoints.TOTAL, () =>
        HttpResponse.json(
          { code: 400, message: 'unsupported aggregation dimension "bogus"' },
          { status: 400 },
        ),
      ),
    );

    const res = await fetch('http://opencost.test/inferenceCost/total?aggregate=bogus');
    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain('unsupported aggregation dimension');
  });

  test('the override from the previous test was reset', async () => {
    // resetHandlers in afterEach is what makes per-test stubbing safe. If this
    // returned 400 the suite would have order-dependent tests, which is the
    // failure mode that makes an MSW setup untrustworthy.
    const res = await fetch('http://opencost.test/inferenceCost/total?window=7d');
    expect(res.status).toBe(200);
  });
});

describe('degraded fixture', () => {
  // These assertions are about the fixture, not about production code. They are
  // here because the fixture encodes the invariants the UI's honesty depends on,
  // and a future capture that drops one of them would silently remove the
  // regression coverage rather than fail.
  const rows = Object.values(inferenceCostDegraded.data.inferenceCosts);

  test('carries one row of every measurement availability value', () => {
    const values = new Set(rows.map((r) => r.measurementAvailability));
    for (const expected of [
      'available',
      'no_decode_loop',
      'engine_unsupported',
      'engine_telemetry_unavailable',
      'no_batch_denominator',
    ]) {
      expect(values).toContain(expected);
    }
  });

  test('a pooling model reports cost with no capacity consumption, not zero consumption', () => {
    const pooling = rows.find((r) => r.measurementAvailability === 'no_decode_loop');

    expect(pooling.totalCost).toBeGreaterThan(0);
    // The distinction this whole feature turns on: absent, not zero. A zero here
    // would render as 100% idle and invite someone to delete a healthy
    // embedding deployment.
    expect(pooling.efficiency.capacityConsumption).toBeUndefined();
    expect(pooling.efficiency.idleCost).toBeUndefined();
  });

  test('carries a host-vs-consumed divergence case', () => {
    const model = inferenceCostTotalModel.data.inferenceCosts['google/gemma-4-31B/llm-serving'];

    expect(model.hostGpuDutyCycle.average).toBeGreaterThan(0.9);
    expect(model.efficiency.capacityConsumption).toBeLessThan(0.2);
    expect(model.hostGpuDutyCycle.divergenceIndicator).toBeDefined();
  });

  test('carries a batch-bound row whose KV utilization is low', () => {
    const model = inferenceCostTotalModel.data.inferenceCosts['mistral-7b-instruct/ml-batch'];

    expect(model.efficiency.bindingConstraint).toBe('batch_slots');
    expect(model.saturation.kvCacheUtilization.p95).toBeLessThan(0.3);
    // Low KV does not mean idle. This row is the counterexample.
    expect(model.efficiency.capacityConsumption).toBeGreaterThan(0.9);
  });

  test('carries an aggregate row with a non-zero excluded member count', () => {
    const partial = rows.find((r) => r.excludedMemberCount > 0);

    expect(partial).toBeDefined();
    expect(partial.measurementAvailability).toBe('available');
  });
});
