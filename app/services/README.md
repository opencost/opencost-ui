### Services mapping between `src` (legacy) and `app` (Remix)

This project currently maintains equivalent service layers in both the legacy `src` tree and the Remix `app` tree.
When changing behavior in one, update the mapped file in the other within the same change.

- `src/services/api_client.js` ↔ `app/services/api-client.ts`
  - Shared behavior: resolve a single `baseURL` for all API calls.
  - Rule: prefer an explicit environment variable, otherwise fall back to `http://localhost:9090` for local development.

- `src/services/allocation.js` ↔ `app/services/allocation.ts`
  - Shared behavior: build allocation query parameters (`window`, `aggregate`, `includeIdle`, optional `accumulate`, optional `filter` via `parseFilters`, fixed `step: "1d"`), call `/allocation/compute`, and return `result.data`.
  - Both support optional mock data controlled by a `REACT_APP_USE_MOCK_DATA`-style flag, using the same mock payloads.

- `src/services/externalCosts.js` ↔ `app/services/external-costs.ts`
  - Shared behavior: `parseExternalCostFilters` and two methods: `fetchExternalGraphCosts` and `fetchExternalTableCosts`.
  - Both construct identical query parameters and return `result.data.data`.

- `src/services/cloudCostDayTotals.js` ↔ `app/services/cloud-cost-day-totals.ts`
  - Shared behavior: for aggregates including `"item"`, call `/cloudCost` with `window`, `costMetric`, and `filter`, then reduce `cloudCosts` into items of `{ date, cost }` using the same `costMetricToPropName` mapping.

- `src/services/cloudCostTop.js` ↔ `app/services/cloud-cost.ts`
  - Shared behavior: for item aggregates, call `/cloudCost` and pass data to `formatSampleItemsForGraph`; for others, call the `/cloudCost/view/*` endpoints plus `/cloudCost/status` and return `{ tableRows, graphData, tableTotal, cloudCostStatus }`.

- `src/services/logger.js` ↔ `app/services/logger.ts`
  - Shared behavior: level-aware `Logger` based on a proxy around `console` with `createLogger` factory and `_logLevel`, `getLogLevel`, `setLogLevel`.

#### Change workflow

1. When adding or changing a service method in `src/services`, locate the corresponding file in `app/services` and apply the same change (and vice versa).
2. Keep parameter order, endpoint paths, and return value shapes aligned across both implementations.
3. If you add new cost metrics, query parameters, or response fields, update both sides together so legacy and Remix UIs see consistent data.

