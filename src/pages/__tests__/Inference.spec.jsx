import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  inferenceCostDegraded,
  inferenceCostTimeseriesDay,
  inferenceEndpoints,
} from '../../../__tests__/handlers.js';
import { server } from '../../../__tests__/server.js';
import Inference from '../Inference.js';

const renderPage = (search = '') =>
  render(
    <MemoryRouter initialEntries={[`/inference${search}`]}>
      <Inference />
    </MemoryRouter>,
  );

const serveDegraded = () => {
  server.use(
    http.get(inferenceEndpoints.TOTAL, () => HttpResponse.json(inferenceCostDegraded)),
    http.get(inferenceEndpoints.TIMESERIES, () => HttpResponse.json(inferenceCostTimeseriesDay)),
  );
};

describe('Inference page', () => {
  test('loads with the idle-cost-descending default and lists every model', async () => {
    renderPage();

    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    const rows = screen.getAllByRole('row').slice(1); // drop the header row
    const names = rows.map((r) => r.cells[0].textContent);

    // gemma has the highest idle cost ($8,580) despite not having the highest
    // capacity consumption, which is the whole point of the default sort.
    expect(names[0]).toContain('google/gemma-4-31B');
    expect(names).toHaveLength(3);
  });

  test('requests the 7-day window, model aggregation and allocation basis by default', async () => {
    let seen;
    server.use(
      http.get(inferenceEndpoints.TOTAL, ({ request }) => {
        seen = Object.fromEntries(new URL(request.url).searchParams.entries());
        return HttpResponse.json({ code: 200, data: { inferenceCosts: {} } });
      }),
    );

    renderPage();
    await waitFor(() => expect(seen).toBeDefined());

    expect(seen).toMatchObject({ window: '7d', aggregate: 'model_name', costBasis: 'allocation' });
    expect(seen).not.toHaveProperty('granularity');
  });

  test('shows a capacity band as text, not colour alone', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    // gemma is at 11% consumed, which is the low band.
    expect(screen.getByText(/11\.0%\s+Low/)).toBeInTheDocument();
    // mistral is at 98%, the high band.
    expect(screen.getByText(/98\.0%\s+High/)).toBeInTheDocument();
  });

  test('surfaces a host-duty-cycle divergence case in the data it renders', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    // A batch-bound row with low KV must not read as idle. mistral is bound by
    // batch slots at 22% KV utilization, and shows as High.
    const row = screen.getByRole('row', { name: /mistral-7b-instruct/ });
    expect(within(row).getByText(/Batch slots/)).toBeInTheDocument();
  });
});

describe('honest degraded rendering', () => {
  // The regression this whole suite exists to prevent: a healthy embedding
  // deployment rendering as 100% waste.
  test('a pooling model shows cost but no capacity, and never a numeric zero', async () => {
    serveDegraded();
    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    const row = screen.getByRole('row', { name: /bge-large-en-v1\.5/ });

    // Cost is reported.
    expect(within(row).getByText('$2,410.80')).toBeInTheDocument();

    // Capacity and idle cost are absent, and the absence is announced rather
    // than being an unlabelled dash.
    const absent = within(row).getAllByLabelText(/not measured/);
    expect(absent.length).toBeGreaterThanOrEqual(2);
    for (const el of absent) {
      expect(el.textContent).not.toMatch(/0/);
    }

    // The explanation names the mode and does not call it waste or idle.
    const explanation = absent[0].getAttribute('aria-label');
    expect(explanation.toLowerCase()).toContain('pooling');
    expect(explanation.toLowerCase()).not.toContain('waste');
  });

  test('an unsupported engine names the engine it saw', async () => {
    serveDegraded();
    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    const row = screen.getByRole('row', { name: /custom-sglang-model/ });
    const absent = within(row).getAllByLabelText(/not measured/);
    expect(absent[0].getAttribute('aria-label')).toContain('sglang');
  });

  test('a KV-only row says so rather than implying both constraints were measured', async () => {
    serveDegraded();
    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    const row = screen.getByRole('row', { name: /llama-3-70b/ });
    expect(within(row).getByText('KV-cache only')).toBeInTheDocument();
  });

  test('a partial-coverage aggregate reports how many members were excluded', async () => {
    serveDegraded();
    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    const row = screen.getByRole('row', { name: /whisper-large-v3/ });
    expect(within(row).getByText(/partial coverage: 2 excluded/)).toBeInTheDocument();
  });

  test('a response-level diagnostic is shown, so a missing relabel rule is visible', async () => {
    serveDegraded();
    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    expect(screen.getByText(/pod_uid/)).toBeInTheDocument();
  });

  test('the summary counts rows whose capacity was not measurable', async () => {
    serveDegraded();
    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    // Three of the five degraded rows have no idle cost.
    expect(screen.getByText('3 of 5')).toBeInTheDocument();
  });
});

describe('error paths', () => {
  test('404 names the setting that enables the feature', async () => {
    server.use(
      http.get(inferenceEndpoints.TOTAL, () => HttpResponse.json({ code: 404 }, { status: 404 })),
      http.get(inferenceEndpoints.TIMESERIES, () => HttpResponse.json({ code: 404 }, { status: 404 })),
    );

    renderPage();
    await waitFor(() => expect(screen.getByText(/INFERENCE_COST_ENABLED/)).toBeInTheDocument());
  });

  test('400 passes the server message through', async () => {
    const message = 'unsupported aggregation dimension "bogus"';
    server.use(
      http.get(inferenceEndpoints.TOTAL, () => HttpResponse.json({ code: 400, message }, { status: 400 })),
      http.get(inferenceEndpoints.TIMESERIES, () => HttpResponse.json({ code: 400, message }, { status: 400 })),
    );

    renderPage();
    await waitFor(() => expect(screen.getByText(message)).toBeInTheDocument());
  });

  test('a failed request is distinguishable from an empty result', async () => {
    server.use(
      http.get(inferenceEndpoints.TOTAL, () => HttpResponse.error()),
      http.get(inferenceEndpoints.TIMESERIES, () => HttpResponse.error()),
    );

    renderPage();
    await waitFor(() => expect(screen.getByText(/Could not load inference data/)).toBeInTheDocument());

    // The empty-state sentence must NOT appear, or a broken backend reads as a
    // cluster with no inference workloads.
    expect(screen.queryByText(/No inference workloads were found/)).not.toBeInTheDocument();
  });

  test('an empty result says it is a measured result, not an error', async () => {
    server.use(
      http.get(inferenceEndpoints.TOTAL, () =>
        HttpResponse.json({ code: 200, data: { inferenceCosts: {} } }),
      ),
      http.get(inferenceEndpoints.TIMESERIES, () =>
        HttpResponse.json({ code: 200, data: { inferenceCostSets: [] } }),
      ),
    );

    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/No inference workloads were found/)).toBeInTheDocument(),
    );
  });
});

describe('drill-down and sorting', () => {
  test('selecting a model row filters on it and descends to namespace', async () => {
    const requests = [];
    server.use(
      http.get(inferenceEndpoints.TOTAL, ({ request }) => {
        requests.push(Object.fromEntries(new URL(request.url).searchParams.entries()));
        return HttpResponse.json(inferenceCostDegraded);
      }),
      http.get(inferenceEndpoints.TIMESERIES, () => HttpResponse.json(inferenceCostTimeseriesDay)),
    );

    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole('row', { name: /llama-3-70b/ }));

    await waitFor(() => expect(requests.length).toBeGreaterThan(1));
    const latest = requests[requests.length - 1];
    expect(latest.aggregate).toBe('namespace');
    expect(latest.filter).toBe('model_name:"llama-3-70b"');
  });

  test('a row can be activated from the keyboard', async () => {
    const requests = [];
    server.use(
      http.get(inferenceEndpoints.TOTAL, ({ request }) => {
        requests.push(Object.fromEntries(new URL(request.url).searchParams.entries()));
        return HttpResponse.json(inferenceCostDegraded);
      }),
      http.get(inferenceEndpoints.TIMESERIES, () => HttpResponse.json(inferenceCostTimeseriesDay)),
    );

    renderPage();
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    const row = screen.getByRole('row', { name: /llama-3-70b/ });
    row.focus();

    const user = userEvent.setup();
    await user.keyboard('{Enter}');

    await waitFor(() => expect(requests.length).toBeGreaterThan(1));
    expect(requests[requests.length - 1].aggregate).toBe('namespace');
  });

  test('rows whose sorted column is absent stay at the bottom on an ascending sort', async () => {
    serveDegraded();
    renderPage('?sortBy=idleCost&sortDirection=asc');
    await waitFor(() => expect(screen.queryByLabelText('Loading inference data')).not.toBeInTheDocument());

    const rows = screen.getAllByRole('row').slice(1);
    const names = rows.map((r) => r.cells[0].textContent);

    // The three unmeasurable rows must be last, not first. Ascending by idle cost
    // is exactly how someone hunts for the least wasteful workload, and putting
    // "not measured" at the top would answer that question wrongly.
    const lastThree = names.slice(-3).join(' ');
    expect(lastThree).toContain('bge-large-en-v1.5');
    expect(lastThree).toContain('custom-sglang-model');
    expect(lastThree).toContain('phi-3-mini');
  });
});
