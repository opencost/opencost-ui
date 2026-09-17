import {
  Breadcrumbs,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Typography,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router';

import Footer from '../components/Footer';
import Header from '../components/Header';
import Page from '../components/Page';
import Warnings from '../components/Warnings';
import InferenceChart from '../components/inference/inferenceChart';
import InferenceControls from '../components/inference/inferenceControls';
import InferenceTable from '../components/inference/inferenceTable';
import { DRILLDOWN, dimensionToProperty, formatCost, sortRows } from '../components/inference/tokens';
import InferenceService, { FAILURE, serialiseFilters } from '../services/inference';

const DEFAULTS = {
  window: '7d',
  aggregateBy: 'model_name',
  costBasis: 'allocation',
  sortBy: 'idleCost',
  sortDirection: 'desc',
  currency: 'USD',
};

const useStyles = makeStyles({
  reportHeader: { display: 'flex', flexFlow: 'column', padding: 24, gap: 12 },
  summary: { display: 'flex', gap: 32, padding: '0 24px 16px', flexWrap: 'wrap' },
  metric: { display: 'flex', flexFlow: 'column' },
  metricLabel: { color: '#8a8a8a', fontSize: '0.75rem', textTransform: 'uppercase' },
  metricValue: { fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' },
});

/** Reads the option set the URL carries, falling back to the defaults. */
function readParams(search) {
  const p = new URLSearchParams(search);
  const filtersRaw = p.get('filters');

  let filters = [];
  if (filtersRaw) {
    try {
      filters = JSON.parse(filtersRaw);
      if (!Array.isArray(filters)) filters = [];
    } catch {
      // A hand-edited or truncated URL must not break the page.
      filters = [];
    }
  }

  return {
    window: p.get('window') || DEFAULTS.window,
    aggregateBy: p.get('agg') || DEFAULTS.aggregateBy,
    costBasis: p.get('costBasis') || DEFAULTS.costBasis,
    sortBy: p.get('sortBy') || DEFAULTS.sortBy,
    sortDirection: p.get('sortDirection') === 'asc' ? 'asc' : DEFAULTS.sortDirection,
    currency: p.get('currency') || DEFAULTS.currency,
    filters,
  };
}

const Inference = () => {
  const classes = useStyles();
  const routerLocation = useLocation();
  const routerHistory = useHistory();

  const state = readParams(routerLocation.search);

  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [timeseries, setTimeseries] = React.useState([]);
  const [diagnostics, setDiagnostics] = React.useState([]);
  const [reloadToken, setReloadToken] = React.useState(0);

  // Only the newest request may render. Without this a slow earlier response can
  // land after a faster later one and repaint the table with data that does not
  // match the controls.
  const requestSeq = React.useRef(0);

  function pushState(next) {
    const p = new URLSearchParams();
    const merged = { ...state, ...next };

    if (merged.window !== DEFAULTS.window) p.set('window', merged.window);
    if (merged.aggregateBy !== DEFAULTS.aggregateBy) p.set('agg', merged.aggregateBy);
    if (merged.costBasis !== DEFAULTS.costBasis) p.set('costBasis', merged.costBasis);
    if (merged.sortBy !== DEFAULTS.sortBy) p.set('sortBy', merged.sortBy);
    if (merged.sortDirection !== DEFAULTS.sortDirection) p.set('sortDirection', merged.sortDirection);
    if (merged.currency !== DEFAULTS.currency) p.set('currency', merged.currency);
    if (merged.filters.length > 0) p.set('filters', JSON.stringify(merged.filters));

    routerHistory.push({ search: p.toString() ? `?${p.toString()}` : '' });
  }

  React.useEffect(() => {
    const seq = ++requestSeq.current;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    async function load() {
      setLoading(true);
      setErrors([]);

      const options = {
        window: state.window,
        costBasis: state.costBasis,
        aggregate: state.aggregateBy,
        filter: serialiseFilters(state.filters),
      };

      try {
        const [total, series] = await Promise.all([
          InferenceService.fetchTotal(options, controller.signal),
          InferenceService.fetchTimeseries(options, controller.signal),
        ]);

        if (seq !== requestSeq.current) return; // superseded

        setRows(
          Object.entries(total.inferenceCosts || {}).map(([key, entry]) => ({ key, ...entry })),
        );
        setDiagnostics(total.diagnostics || []);
        setTimeseries(series.inferenceCostSets || []);
      } catch (err) {
        if (seq !== requestSeq.current) return;

        setRows([]);
        setTimeseries([]);
        setDiagnostics([]);
        setErrors([
          {
            primary:
              err.kind === FAILURE.DISABLED
                ? 'Inference cost tracking is unavailable'
                : err.kind === FAILURE.BAD_REQUEST
                  ? 'The request was rejected'
                  : 'Could not load inference data',
            secondary: err.message,
          },
        ]);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
        clearTimeout(timer);
      }
    }

    load();
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    state.window,
    state.aggregateBy,
    state.costBasis,
    JSON.stringify(state.filters),
    reloadToken,
  ]);

  const sorted = React.useMemo(
    () => sortRows(rows, state.sortBy, state.sortDirection, state.aggregateBy),
    [rows, state.sortBy, state.sortDirection, state.aggregateBy],
  );

  const totals = React.useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          total: acc.total + (r.totalCost || 0),
          idle: acc.idle + (r.efficiency?.idleCost || 0),
          unmeasured: acc.unmeasured + (r.efficiency?.idleCost == null ? 1 : 0),
        }),
        { total: 0, idle: 0, unmeasured: 0 },
      ),
    [rows],
  );

  const canDrilldown = Boolean(DRILLDOWN[state.aggregateBy]);

  function drilldown(row) {
    const next = DRILLDOWN[state.aggregateBy];
    if (!next) return;

    const value = row.properties?.[dimensionToProperty[state.aggregateBy]];
    if (!value) return;

    const filters = [
      ...state.filters.filter((f) => f.property !== state.aggregateBy),
      { property: state.aggregateBy, value },
    ];
    pushState({ aggregateBy: next, filters });
  }

  function sort(column) {
    const sortDirection =
      state.sortBy === column && state.sortDirection === 'desc' ? 'asc' : 'desc';
    pushState({ sortBy: column, sortDirection });
  }

  return (
    <Page active="/inference">
      <Header headerTitle="Inference Efficiency">
        <IconButton aria-label="refresh" onClick={() => setReloadToken((t) => t + 1)}>
          <RefreshIcon />
        </IconButton>
      </Header>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}

      {diagnostics.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings
            warnings={diagnostics.map((d) => ({
              primary: 'Telemetry gap',
              secondary: d.message,
            }))}
          />
        </div>
      )}

      <Paper id="inference">
        <div className={classes.reportHeader}>
          <InferenceControls
            window={state.window}
            setWindow={(window) => pushState({ window })}
            aggregateBy={state.aggregateBy}
            setAggregateBy={(aggregateBy) => pushState({ aggregateBy, filters: [] })}
            costBasis={state.costBasis}
            setCostBasis={(costBasis) => pushState({ costBasis })}
            filters={state.filters}
            clearFilters={() => pushState({ aggregateBy: DEFAULTS.aggregateBy, filters: [] })}
          />

          {state.filters.length > 0 && (
            <Breadcrumbs aria-label="drill-down path">
              <Link
                component="button"
                onClick={() => pushState({ aggregateBy: DEFAULTS.aggregateBy, filters: [] })}
              >
                All models
              </Link>
              {state.filters.map((f) => (
                <Typography key={`${f.property}:${f.value}`}>{f.value}</Typography>
              ))}
            </Breadcrumbs>
          )}
        </div>

        {/* Idle cost leads, because it is the number that prompts an action.
            Total cost alone does not tell anyone what to change. */}
        <div className={classes.summary}>
          <div className={classes.metric}>
            <span className={classes.metricLabel}>Idle cost this window</span>
            <span className={classes.metricValue}>{formatCost(totals.idle, state.currency)}</span>
          </div>
          <div className={classes.metric}>
            <span className={classes.metricLabel}>Total inference cost</span>
            <span className={classes.metricValue}>{formatCost(totals.total, state.currency)}</span>
          </div>
          {totals.unmeasured > 0 && (
            <div className={classes.metric}>
              <span className={classes.metricLabel}>Not measurable</span>
              <span className={classes.metricValue}>
                {totals.unmeasured} of {rows.length}
              </span>
            </div>
          )}
        </div>

        {loading && (
          <div
            style={{ display: 'flex', justifyContent: 'center' }}
            aria-busy="true"
            aria-live="polite"
          >
            <div style={{ paddingTop: 80, paddingBottom: 80 }}>
              <CircularProgress aria-label="Loading inference data" />
            </div>
          </div>
        )}

        {!loading && errors.length === 0 && (
          <>
            <InferenceChart data={timeseries} currency={state.currency} />
            <InferenceTable
              rows={sorted}
              dimension={state.aggregateBy}
              currency={state.currency}
              sortBy={state.sortBy}
              sortDirection={state.sortDirection}
              onSort={sort}
              onDrilldown={drilldown}
              canDrilldown={canDrilldown}
            />
          </>
        )}
      </Paper>
      <Footer />
    </Page>
  );
};

export default React.memo(Inference);
