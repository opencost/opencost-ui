import axios from 'axios';

/** Requirement 14.6: a request that has not completed in 30 seconds is aborted. */
export const REQUEST_TIMEOUT_MS = 30000;

/**
 * Errors this service raises carry a kind, so the UI can distinguish the cases
 * Requirement 16 needs to render differently. Without this the page cannot tell
 * "inference tracking is switched off" from "the request never arrived", and
 * those need different messages.
 */
export const FAILURE = {
  DISABLED: 'disabled', // 404 or 501: the feature is not enabled on this backend
  BAD_REQUEST: 'badRequest', // 400: pass the server's message through verbatim
  SERVER: 'server', // 5xx
  TIMEOUT: 'timeout', // aborted at REQUEST_TIMEOUT_MS
  NETWORK: 'network', // no response at all
};

export class InferenceRequestError extends Error {
  constructor(kind, message, status) {
    super(message);
    this.name = 'InferenceRequestError';
    this.kind = kind;
    this.status = status;
  }
}

function classify(err) {
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.message === 'canceled') {
    return new InferenceRequestError(
      FAILURE.TIMEOUT,
      `The request did not complete within ${REQUEST_TIMEOUT_MS / 1000} seconds.`,
    );
  }

  if (!err.response) {
    return new InferenceRequestError(
      FAILURE.NETWORK,
      'Could not reach the OpenCost API. Check that it is running and reachable.',
    );
  }

  const { status, data } = err.response;

  if (status === 404 || status === 501) {
    return new InferenceRequestError(
      FAILURE.DISABLED,
      'Inference cost tracking is unavailable on this OpenCost instance. ' +
        'It is enabled with the INFERENCE_COST_ENABLED setting.',
      status,
    );
  }

  if (status === 400) {
    // The server names the rejected dimension and lists the supported ones, so
    // passing its message through is more useful than anything invented here.
    return new InferenceRequestError(
      FAILURE.BAD_REQUEST,
      data?.message || 'The request was rejected as invalid.',
      status,
    );
  }

  return new InferenceRequestError(
    FAILURE.SERVER,
    data?.message || `The OpenCost API returned an error (HTTP ${status}).`,
    status,
  );
}

/**
 * Builds the query parameters both endpoints share.
 *
 * `granularity` is omitted when it is the default. That is deliberate: the API
 * guarantees a PR #3845-identical response when every new parameter is absent,
 * and sending `granularity=model` explicitly would make that guarantee harder to
 * verify from a request log.
 */
function baseParams({ window, costBasis, aggregate, filter, granularity }) {
  const params = { window };

  if (costBasis) params.costBasis = costBasis;
  if (aggregate) params.aggregate = aggregate;
  if (filter) params.filter = filter;
  if (granularity && granularity !== 'model') params.granularity = granularity;

  return params;
}

/**
 * Serialises drill-down filters into the API's grammar.
 *
 * Values are always quoted. Model names contain "/" and namespaces can contain
 * characters that would otherwise be ambiguous against the "+" term separator,
 * and quoting unconditionally keeps the rendering injective, which is what makes
 * the parse-render-parse round trip stable.
 */
export function serialiseFilters(filters) {
  if (typeof filters === 'string') return filters;
  if (!filters || filters.length === 0) return '';

  const seen = new Set();
  const terms = [];
  for (const f of filters) {
    const term = `${f.property}:"${f.value}"`;
    if (!seen.has(term)) {
      seen.add(term);
      terms.push(term);
    }
  }
  return terms.join('+');
}

class InferenceService {
  BASE_URL = process.env.BASE_URL || '{PLACEHOLDER_BASE_URL}';

  baseUrl() {
    // Matches the existing services: the placeholder is substituted at container
    // start, and falls back to the local dev proxy port when it has not been.
    if (this.BASE_URL.includes('PLACEHOLDER_BASE_URL')) {
      return 'http://localhost:9090/model';
    }
    return this.BASE_URL;
  }

  async get(path, params, signal) {
    try {
      const result = await axios.get(`${this.baseUrl()}${path}`, {
        params,
        signal,
        timeout: REQUEST_TIMEOUT_MS,
      });
      return result.data.data;
    } catch (err) {
      throw classify(err);
    }
  }

  /** Total inference cost and efficiency for the window. */
  async fetchTotal(options, signal) {
    const params = baseParams(options);
    if (options.recommendations === false) params.recommendations = 'false';
    return this.get('/inferenceCost/total', params, signal);
  }

  /** Consumed and idle cost over time, for the trend chart. */
  async fetchTimeseries(options, signal) {
    const params = baseParams(options);
    params.accumulate = options.accumulate || 'day';
    return this.get('/inferenceCost/timeseries', params, signal);
  }
}

export default new InferenceService();
