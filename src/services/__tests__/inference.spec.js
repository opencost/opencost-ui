import { http, HttpResponse } from 'msw';

import { inferenceEndpoints, inferenceCostTotalModel } from '../../../__tests__/handlers.js';
import { server } from '../../../__tests__/server.js';
import InferenceService, { FAILURE, serialiseFilters } from '../inference.js';

describe('serialiseFilters', () => {
  test('quotes every value, because model names contain slashes', () => {
    expect(serialiseFilters([{ property: 'model_name', value: 'meta-llama/Llama-3-8B' }])).toBe(
      'model_name:"meta-llama/Llama-3-8B"',
    );
  });

  test('joins terms with + and drops duplicates', () => {
    const filters = [
      { property: 'model_name', value: 'a' },
      { property: 'namespace', value: 'b' },
      { property: 'model_name', value: 'a' },
    ];
    expect(serialiseFilters(filters)).toBe('model_name:"a"+namespace:"b"');
  });

  test('passes a string through unchanged and an empty list to empty string', () => {
    expect(serialiseFilters('already:"serialised"')).toBe('already:"serialised"');
    expect(serialiseFilters([])).toBe('');
    expect(serialiseFilters(null)).toBe('');
  });
});

describe('fetchTotal', () => {
  test('returns the data envelope contents', async () => {
    const data = await InferenceService.fetchTotal({ window: '7d' });
    expect(data.inferenceCosts).toEqual(inferenceCostTotalModel.data.inferenceCosts);
  });

  test('omits granularity when it is the default', async () => {
    // The API guarantees a PR #3845-identical response when every new parameter
    // is absent. Sending granularity=model explicitly would make that guarantee
    // unverifiable from a request log, so the default is expressed by omission.
    let seen;
    server.use(
      http.get(inferenceEndpoints.TOTAL, ({ request }) => {
        seen = Object.fromEntries(new URL(request.url).searchParams.entries());
        return HttpResponse.json(inferenceCostTotalModel);
      }),
    );

    await InferenceService.fetchTotal({ window: '7d', granularity: 'model' });
    expect(seen).not.toHaveProperty('granularity');

    await InferenceService.fetchTotal({ window: '7d', granularity: 'engine' });
    expect(seen.granularity).toBe('engine');
  });

  test('sends window, costBasis, aggregate and filter when given', async () => {
    let seen;
    server.use(
      http.get(inferenceEndpoints.TOTAL, ({ request }) => {
        seen = Object.fromEntries(new URL(request.url).searchParams.entries());
        return HttpResponse.json(inferenceCostTotalModel);
      }),
    );

    await InferenceService.fetchTotal({
      window: '24h',
      costBasis: 'usage',
      aggregate: 'namespace',
      filter: 'model_name:"a"',
    });

    expect(seen).toMatchObject({
      window: '24h',
      costBasis: 'usage',
      aggregate: 'namespace',
      filter: 'model_name:"a"',
    });
  });
});

describe('failure classification', () => {
  // Each of these renders differently in the UI, so conflating them would put
  // the wrong message in front of an operator.
  const cases = [
    { status: 404, kind: FAILURE.DISABLED, expect: /INFERENCE_COST_ENABLED/ },
    { status: 501, kind: FAILURE.DISABLED, expect: /INFERENCE_COST_ENABLED/ },
    { status: 500, kind: FAILURE.SERVER, expect: /error/i },
    { status: 503, kind: FAILURE.SERVER, expect: /error/i },
  ];

  for (const c of cases) {
    test(`HTTP ${c.status} classifies as ${c.kind}`, async () => {
      server.use(
        http.get(inferenceEndpoints.TOTAL, () =>
          HttpResponse.json({ code: c.status, message: 'nope' }, { status: c.status }),
        ),
      );

      await expect(InferenceService.fetchTotal({ window: '7d' })).rejects.toMatchObject({
        kind: c.kind,
      });
    });
  }

  test('HTTP 400 passes the server message through verbatim', async () => {
    // The server names the rejected dimension and lists the valid ones. Replacing
    // that with a generic message would discard the only actionable part.
    const message = 'unsupported aggregation dimension "bogus". Supported dimensions: model_name, namespace';
    server.use(
      http.get(inferenceEndpoints.TOTAL, () => HttpResponse.json({ code: 400, message }, { status: 400 })),
    );

    await expect(InferenceService.fetchTotal({ window: '7d' })).rejects.toMatchObject({
      kind: FAILURE.BAD_REQUEST,
      message,
    });
  });

  test('a network failure classifies as network, not as a server error', async () => {
    server.use(http.get(inferenceEndpoints.TOTAL, () => HttpResponse.error()));

    await expect(InferenceService.fetchTotal({ window: '7d' })).rejects.toMatchObject({
      kind: FAILURE.NETWORK,
    });
  });

  test('an aborted request classifies as timeout', async () => {
    server.use(
      http.get(inferenceEndpoints.TOTAL, async () => {
        await new Promise((r) => setTimeout(r, 1000));
        return HttpResponse.json(inferenceCostTotalModel);
      }),
    );

    const controller = new AbortController();
    const pending = InferenceService.fetchTotal({ window: '7d' }, controller.signal);
    controller.abort();

    await expect(pending).rejects.toMatchObject({ kind: FAILURE.TIMEOUT });
  });
});

describe('fetchTimeseries', () => {
  test('defaults accumulate to day', async () => {
    let seen;
    server.use(
      http.get(inferenceEndpoints.TIMESERIES, ({ request }) => {
        seen = Object.fromEntries(new URL(request.url).searchParams.entries());
        return HttpResponse.json({ code: 200, data: { inferenceCostSets: [] } });
      }),
    );

    await InferenceService.fetchTimeseries({ window: '7d' });
    expect(seen.accumulate).toBe('day');
  });
});
