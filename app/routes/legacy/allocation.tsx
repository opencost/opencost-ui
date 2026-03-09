// @ts-nocheck
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import { find, get, sortBy, toArray } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import AllocationReport from "~/components/legacy/allocationReport";
import Controls from "~/components/legacy/Controls/index";
import FilterBreadcrumb from "~/components/legacy/FilterBreadcrumb";
import Header from "~/components/legacy/Header";
import Page from "~/components/legacy/Page";
import Footer from "~/components/legacy/Footer";
import Subtitle from "~/components/legacy/Subtitle";
import Warnings from "~/components/legacy/Warnings";
import AllocationService from "~/services/allocation";
import {
  checkCustomWindow,
  cumulativeToTotals,
  parseFilters,
  parseFiltersFromUrl,
  rangeToCumulative,
  toVerboseTimeRange,
} from "~/lib/legacy-util";
import { currencyCodes } from "~/constants/currencyCodes";

export function meta() {
  return [{ title: "OpenCost — Cost Allocation" }];
}

const windowOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
];

const baseAggregationOptions = [
  { name: "Cluster", value: "cluster" },
  { name: "Node", value: "node" },
  { name: "Namespace", value: "namespace" },
  { name: "Controller Kind", value: "controllerKind" },
  { name: "Controller", value: "controller" },
  { name: "DaemonSet", value: "daemonset" },
  { name: "Deployment", value: "deployment" },
  { name: "Job", value: "job" },
  { name: "Service", value: "service" },
  { name: "StatefulSet", value: "statefulset" },
  { name: "Pod", value: "pod" },
  { name: "Container", value: "container" },
];

const aggregationOptions = baseAggregationOptions;

const accumulateOptions = [
  { name: "Entire window", value: true },
  { name: "Daily", value: false },
];

function generateTitle({ window, aggregateBy, accumulate }) {
  let windowName = get(find(windowOptions, { value: window }), "name", "");
  if (windowName === "") {
    if (checkCustomWindow(window)) windowName = toVerboseTimeRange(window);
    else console.warn(`unknown window: ${window}`);
  }
  let aggregationName = get(find(aggregationOptions, { value: aggregateBy }), "name", "").toLowerCase();
  if (aggregationName === "") console.warn(`unknown aggregation: ${aggregateBy}`);
  let str = `${windowName} by ${aggregationName}`;
  if (!accumulate) str = `${str} daily`;
  return str;
}

const ReportsPage = () => {
  const [allocationData, setAllocationData] = useState([]);
  const [cumulativeData, setCumulativeData] = useState({});
  const [totalData, setTotalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [includeIdle, setIncludeIdle] = useState();

  useEffect(() => {
    const cumulative = rangeToCumulative(allocationData, aggregateBy);
    setCumulativeData(toArray(cumulative));
    setTotalData(cumulativeToTotals(cumulative));
  }, [allocationData]);

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  const win = searchParams.get("window") || "7d";
  const aggregateBy = searchParams.get("agg") || "namespace";
  const accumulate = searchParams.get("acc") === "true";
  const currency = searchParams.get("currency") || "USD";
  const title = searchParams.get("title") || generateTitle({ window: win, aggregateBy, accumulate });

  const filterParam = searchParams.get("filter");
  const filters = useMemo(() => (filterParam ? parseFiltersFromUrl(filterParam) : []), [filterParam]);

  useEffect(() => {
    const aggregateHierarchy = ["namespace", "controllerKind", "controller", "pod", "container"];
    const filterHierarchy = ["namespace", "controllerKind", "controllerName", "pod", "container"];
    const aggregateToFilterCount = { namespace: 0, controllerKind: 1, controller: 2, pod: 3, container: 4 };
    const currentIndex = aggregateHierarchy.indexOf(aggregateBy);
    const currentFilters = filterParam ? parseFiltersFromUrl(filterParam) : [];
    const expectedFilterCount = aggregateToFilterCount[aggregateBy] || 0;

    if (currentIndex === 0 && currentFilters.length > 0) {
      const np = new URLSearchParams(routerLocation.search);
      np.delete("filter");
      const ns = `?${np.toString()}`;
      if (routerLocation.search !== ns) navigate({ search: ns }, { replace: true });
      return;
    }
    if (currentFilters.length > expectedFilterCount) {
      const trimmed = currentFilters.slice(0, expectedFilterCount);
      const np = new URLSearchParams(routerLocation.search);
      trimmed.length > 0 ? np.set("filter", parseFilters(trimmed)) : np.delete("filter");
      const ns = `?${np.toString()}`;
      if (routerLocation.search !== ns) navigate({ search: ns }, { replace: true });
      return;
    }
    for (let i = 0; i < currentFilters.length; i++) {
      if (currentFilters[i].property !== filterHierarchy[i]) {
        const trimmed = currentFilters.slice(0, i);
        const np = new URLSearchParams(routerLocation.search);
        trimmed.length > 0 ? np.set("filter", parseFilters(trimmed)) : np.delete("filter");
        const ns = `?${np.toString()}`;
        if (routerLocation.search !== ns) navigate({ search: ns }, { replace: true });
        return;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerLocation.search, aggregateBy]);

  useEffect(() => { fetchData(); }, [win, aggregateBy, accumulate, filters, includeIdle]);

  useEffect(() => {
    if (currency !== "USD") {
      setErrors([{ primary: "Currency Conversion in Use", secondary: "Forex rates may differ between the API and your cloud provider, potentially causing cost discrepancies. Always verify with your actual cloud bill." }]);
    } else {
      setErrors([]);
    }
  }, [currency]);

  async function fetchData() {
    setLoading(true);
    setErrors([]);
    try {
      const resp = await AllocationService.fetchAllocation(win, aggregateBy, { accumulate, filters, includeIdle });
      if (resp.data && resp.data.length > 0) {
        const allocationRange = resp.data;
        for (const i in allocationRange) {
          allocationRange[i] = sortBy(allocationRange[i], (a) => a.totalCost);
        }
        setAllocationData(allocationRange);
      } else {
        if (resp.message && resp.message.indexOf("boundary error") >= 0) {
          let match = resp.message.match(/(ETL is \d+\.\d+% complete)/);
          let secondary = "Try again after ETL build is complete";
          if (match && match.length > 0) secondary = `${match[1]}. ${secondary}`;
          setErrors([{ primary: "Data unavailable while ETL is building", secondary }]);
        }
        setAllocationData([]);
      }
    } catch (err) {
      if (err.message.indexOf("404") === 0) {
        setErrors([{ primary: "Failed to load report data", secondary: "Please update OpenCost to the latest version, then open an Issue on GitHub if problems persist." }]);
      } else {
        setErrors([{ primary: "Failed to load report data", secondary: err.message || "Please open an Issue on GitHub if problems persist." }]);
      }
      setAllocationData([]);
    }
    setLoading(false);
  }

  function handleBreadcrumbNavigate(level) {
    const aggregateHierarchy = ["namespace", "controllerKind", "controller", "pod", "container"];
    if (level === -1) {
      const np = new URLSearchParams(routerLocation.search);
      np.set("agg", "namespace"); np.delete("filter");
      navigate({ search: `?${np.toString()}` });
      return;
    }
    const trimmedFilters = filters.slice(0, level + 1);
    if (trimmedFilters.length === 0) {
      const np = new URLSearchParams(routerLocation.search);
      np.set("agg", "namespace"); np.delete("filter");
      navigate({ search: `?${np.toString()}` });
      return;
    }
    const targetAgg = aggregateHierarchy[trimmedFilters.length] || "namespace";
    const np = new URLSearchParams(routerLocation.search);
    np.set("agg", targetAgg);
    trimmedFilters.length > 0 ? np.set("filter", parseFilters(trimmedFilters)) : np.delete("filter");
    navigate({ search: `?${np.toString()}` });
  }

  function drilldown(row) {
    const drilldownHierarchy = { namespace: "controllerKind", controllerKind: "controller", controller: "pod", pod: "container" };
    const nextAgg = drilldownHierarchy[aggregateBy];
    if (!nextAgg) return;
    if (!row.name || String(row.name).trim() === "") return;
    const filterPropertyMap = { namespace: "namespace", controllerKind: "controllerKind", controller: "controllerName", pod: "pod", container: "container" };
    const filterProperty = filterPropertyMap[aggregateBy] || aggregateBy;
    let filterValue = String(row.name).trim();
    let updatedFilters = [...filters];
    if (aggregateBy === "controller" && filterValue.includes(":")) {
      const [maybeKind, ...nameParts] = filterValue.split(":");
      const trimmedName = nameParts.join(":").trim();
      if (trimmedName.length > 0) filterValue = trimmedName;
      const normalizedKind = maybeKind.trim();
      if (normalizedKind.length > 0 && !updatedFilters.some((f) => f.property === "controllerKind")) {
        updatedFilters = [...updatedFilters, { property: "controllerKind", value: normalizedKind }];
      }
    }
    const newFilters = [...updatedFilters, { property: filterProperty, value: filterValue }];
    const np = new URLSearchParams(routerLocation.search);
    np.set("agg", nextAgg);
    newFilters.length > 0 ? np.set("filter", parseFilters(newFilters)) : np.delete("filter");
    navigate({ search: `?${np.toString()}` });
  }

  return (
    <Page active="reports.html">
      <Header headerTitle="Cost Allocation">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={includeIdle ?? true} onChange={(e) => setIncludeIdle(e.target.checked)} />
            Include idle costs
          </label>
          <IconButton aria-label="refresh" onClick={() => fetchData()} style={{ padding: 12 }}>
            <RefreshIcon />
          </IconButton>
        </div>
      </Header>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}
      <Paper id="report">
        <div style={{ display: "flex", flexFlow: "row", padding: 24 }}>
          <div style={{ flexGrow: 1 }}>
            <Typography variant="h5">{title}</Typography>
            <FilterBreadcrumb filters={filters} onNavigate={handleBreadcrumbNavigate} />
            <Subtitle report={{ window: win, aggregateBy, accumulate }} />
          </div>
          <Controls
            windowOptions={windowOptions}
            window={win}
            setWindow={(win) => { searchParams.set("window", win); navigate({ search: `?${searchParams.toString()}` }); }}
            aggregationOptions={aggregationOptions}
            aggregateBy={aggregateBy}
            setAggregateBy={(agg) => { const np = new URLSearchParams(routerLocation.search); np.set("agg", agg); np.delete("filter"); navigate({ search: `?${np.toString()}` }); }}
            accumulateOptions={accumulateOptions}
            accumulate={accumulate}
            setAccumulate={(acc) => { searchParams.set("acc", acc); navigate({ search: `?${searchParams.toString()}` }); }}
            title={title}
            cumulativeData={cumulativeData}
            currency={currency}
            currencyOptions={currencyCodes}
            setCurrency={(curr) => { searchParams.set("currency", curr); navigate({ search: `?${searchParams.toString()}` }); }}
          />
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ paddingTop: 100, paddingBottom: 100 }}>
              <CircularProgress />
            </div>
          </div>
        )}
        {!loading && (
          <AllocationReport
            allocationData={allocationData}
            cumulativeData={cumulativeData}
            totalData={totalData}
            currency={currency}
            aggregateBy={aggregateBy}
            drilldown={drilldown}
          />
        )}
      </Paper>
      <Footer />
    </Page>
  );
};

export default React.memo(ReportsPage);
