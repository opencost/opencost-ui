import { http, HttpResponse } from 'msw';

import inferenceCostTotalModel from './fixtures/inferenceCost-total-model.json';
import inferenceCostTotalEngine from './fixtures/inferenceCost-total-engine.json';
import inferenceCostTimeseriesDay from './fixtures/inferenceCost-timeseries-day.json';
import inferenceCostDegraded from './fixtures/inferenceCost-degraded.json';

// URL patterns are wildcard-prefixed so a handler matches regardless of the
// host the service module is pointed at. The UI reads its base URL from runtime
// config, so pinning a host here would make every test depend on that config.
const TOTAL = '*/inferenceCost/total';
const TIMESERIES = '*/inferenceCost/timeseries';

// Default handlers cover the happy path only. Every degraded, error, and
// edge-case response is installed per test with server.use(), so a test's
// stubbing is visible in the test rather than hidden in this file.
export const handlers = [
  http.get(TOTAL, ({ request }) => {
    const params = new URL(request.url).searchParams;

    if (params.get('granularity') === 'engine') {
      return HttpResponse.json(inferenceCostTotalEngine);
    }
    return HttpResponse.json(inferenceCostTotalModel);
  }),

  http.get(TIMESERIES, () => HttpResponse.json(inferenceCostTimeseriesDay)),
];

// Named exports for the fixtures, so a test can assert against the same data the
// handler served without re-importing the JSON by path.
export {
  inferenceCostTotalModel,
  inferenceCostTotalEngine,
  inferenceCostTimeseriesDay,
  inferenceCostDegraded,
};

export const inferenceEndpoints = { TOTAL, TIMESERIES };
