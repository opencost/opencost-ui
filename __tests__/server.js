import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { handlers } from './handlers.js';

export const server = setupServer(...handlers);

// An unstubbed request is logged loudly rather than allowed to resolve to
// nothing. This is not defensive noise: a silently unhandled inference request
// renders as an empty table, which is indistinguishable from a real "no
// inference workloads" result. Confusing "not measured" with "measured as zero"
// is the exact failure this feature exists to prevent, so the test harness
// should not be capable of it either.
server.events.on('request:unhandled', ({ request }) => {
  console.error(`No MSW handler for ${request.method} ${request.url}`);
});

/**
 * mockAPIResponse stubs a GET endpoint and hands the responder a flattened
 * params object, which is what most tests actually want. Reaching for
 * `new URL(request.url).searchParams` in every test body obscures the one or
 * two parameters the test is really about.
 *
 * @param {string} path wildcard-prefixed path, e.g. '*\/inferenceCost/total'
 * @param {(params: Record<string, string>) => unknown} responder
 */
export function mockAPIResponse(path, responder) {
  server.use(
    http.get(path, ({ request }) => {
      const params = Object.fromEntries(new URL(request.url).searchParams.entries());
      return HttpResponse.json(responder(params));
    }),
  );
}
