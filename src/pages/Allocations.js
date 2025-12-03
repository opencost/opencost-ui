import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import { find, get, sortBy, toArray } from "lodash";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import AllocationReport from "../components/allocationReport";
import Controls from "../components/Controls";
import FilterBreadcrumb from "../components/FilterBreadcrumb";
import Header from "../components/Header";
import Page from "../components/Page";
import Footer from "../components/Footer";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import AllocationService from "../services/allocation";
import {
  checkCustomWindow,
  cumulativeToTotals,
  parseFilters,
  parseFiltersFromUrl,
  rangeToCumulative,
  toVerboseTimeRange,
} from "../util";
import { currencyCodes } from "../constants/currencyCodes";

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

const aggregationOptions = [
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

const accumulateOptions = [
  { name: "Entire window", value: true },
  { name: "Daily", value: false },
];

// generateTitle generates a string title from a report object
function generateTitle({ window, aggregateBy, accumulate }) {
  let windowName = get(find(windowOptions, { value: window }), "name", "");
  if (windowName === "") {
    if (checkCustomWindow(window)) {
      windowName = toVerboseTimeRange(window);
    } else {
      console.warn(`unknown window: ${window}`);
    }
  }

  let aggregationName = get(
    find(aggregationOptions, { value: aggregateBy }),
    "name",
    "",
  ).toLowerCase();
  if (aggregationName === "") {
    console.warn(`unknown aggregation: ${aggregateBy}`);
  }

  let str = `${windowName} by ${aggregationName}`;

  if (!accumulate) {
    str = `${str} daily`;
  }

  return str;
}

const ReportsPage = () => {
  // Allocation data state
  const [allocationData, setAllocationData] = useState([]);
  const [cumulativeData, setCumulativeData] = useState({});
  const [totalData, setTotalData] = useState({});

  // Data fetching in-progress / error states
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  // When allocation data changes, create a cumulative version of it
  useEffect(() => {
    const cumulative = rangeToCumulative(allocationData, aggregateBy);
    setCumulativeData(toArray(cumulative));
    setTotalData(cumulativeToTotals(cumulative));
  }, [allocationData]);

  // State of controls on the page is generally derived from query parameters in the url.
  // Updates to these controls are pushed through the router using `searchParams.set()`.
  // Defaults are supplied in case of the absence of a query parameter.
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  const win = searchParams.get("window") || "7d";
  const aggregateBy = searchParams.get("agg") || "namespace";
  const accumulate = searchParams.get("acc") === "true";
  const currency = searchParams.get("currency") || "USD";
  const title =
    searchParams.get("title") ||
    generateTitle({ window: win, aggregateBy, accumulate });

  // Derive filters directly from URL - URL is the single source of truth
  const filterParam = searchParams.get("filter");
  const filters = filterParam ? parseFiltersFromUrl(filterParam) : [];

  // Validate and correct filters when URL or aggregateBy changes
  useEffect(() => {
    // Hierarchy for aggregateBy levels
    const aggregateHierarchy = ["namespace", "controllerKind", "controller", "pod", "container"];
    // Hierarchy for filter properties (matches backend API - uses "controllerName" not "controller")
    const filterHierarchy = ["namespace", "controllerKind", "controllerName", "pod", "container"];
    
    // Map aggregateBy to expected number of filters and expected filter properties
    const aggregateToFilterCount = {
      namespace: 0,
      controllerKind: 1,
      controller: 2,
      pod: 3,
      container: 4,
    };
    
    const currentIndex = aggregateHierarchy.indexOf(aggregateBy);
    const currentFilters = filterParam ? parseFiltersFromUrl(filterParam) : [];
    const expectedFilterCount = aggregateToFilterCount[aggregateBy] || 0;
    
    // If we're at namespace level, there should be no filters
    if (currentIndex === 0 && currentFilters.length > 0) {
      const newSearchParams = new URLSearchParams(routerLocation.search);
      newSearchParams.delete("filter");
      navigate({
        search: `?${newSearchParams.toString()}`,
      }, { replace: true });
      return;
    }
    
    // Validate that filter count matches expected level
    if (currentFilters.length > expectedFilterCount) {
      // Trim filters to match current aggregateBy level
      const trimmedFilters = currentFilters.slice(0, expectedFilterCount);
      const newSearchParams = new URLSearchParams(routerLocation.search);
      if (trimmedFilters.length > 0) {
        newSearchParams.set("filter", parseFilters(trimmedFilters));
      } else {
        newSearchParams.delete("filter");
      }
      navigate({
        search: `?${newSearchParams.toString()}`,
      }, { replace: true });
      return;
    }
    
    // Validate that filter properties match expected hierarchy
    for (let i = 0; i < currentFilters.length; i++) {
      const filter = currentFilters[i];
      const expectedProperty = filterHierarchy[i];
      if (filter.property !== expectedProperty) {
        // Trim filters at the first mismatch
        const trimmedFilters = currentFilters.slice(0, i);
        const newSearchParams = new URLSearchParams(routerLocation.search);
        if (trimmedFilters.length > 0) {
          newSearchParams.set("filter", parseFilters(trimmedFilters));
        } else {
          newSearchParams.delete("filter");
        }
        navigate({
          search: `?${newSearchParams.toString()}`,
        }, { replace: true });
        return;
      }
    }
  }, [routerLocation.search, aggregateBy, filterParam, navigate]);

  // When parameters which effect query results change, refetch the data.
  useEffect(() => {
    fetchData();
  }, [win, aggregateBy, accumulate, filters]);

  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      const resp = await AllocationService.fetchAllocation(win, aggregateBy, {
        accumulate,
        filters,
      });
      if (resp.data && resp.data.length > 0) {
        const allocationRange = resp.data;
        for (const i in allocationRange) {
          // update cluster aggregations to use clusterName/clusterId names
          allocationRange[i] = sortBy(allocationRange[i], (a) => a.totalCost);
        }
        setAllocationData(allocationRange);
      } else {
        if (resp.message && resp.message.indexOf("boundary error") >= 0) {
          let match = resp.message.match(/(ETL is \d+\.\d+% complete)/);
          let secondary = "Try again after ETL build is complete";
          if (match.length > 0) {
            secondary = `${match[1]}. ${secondary}`;
          }
          setErrors([
            {
              primary: "Data unavailable while ETL is building",
              secondary: secondary,
            },
          ]);
        }
        setAllocationData([]);
      }
    } catch (err) {
      if (err.message.indexOf("404") === 0) {
        setErrors([
          {
            primary: "Failed to load report data",
            secondary:
              "Please update OpenCost to the latest version, then open an Issue on GitHub if problems persist.",
          },
        ]);
      } else {
        let secondary = "Please open an Issue on GitHub if problems persist.";
        if (err.message.length > 0) {
          secondary = err.message;
        }
        setErrors([
          {
            primary: "Failed to load report data",
            secondary: secondary,
          },
        ]);
      }
      setAllocationData([]);
    }

    setLoading(false);
  }

  // Handle breadcrumb navigation - navigate back to a specific filter level
  function handleBreadcrumbNavigate(level) {
    // Hierarchy for aggregateBy levels
    const aggregateHierarchy = ["namespace", "controllerKind", "controller", "pod", "container"];

    if (level === -1) {
      // Navigate to "All Results" - namespace level with no filters
      const newSearchParams = new URLSearchParams(routerLocation.search);
      newSearchParams.set("agg", "namespace");
      newSearchParams.delete("filter");
      navigate({
        search: `?${newSearchParams.toString()}`,
      });
      return;
    }

    // Navigate to a specific filter level
    const trimmedFilters = filters.slice(0, level + 1);
    if (trimmedFilters.length === 0) {
      const newSearchParams = new URLSearchParams(routerLocation.search);
      newSearchParams.set("agg", "namespace");
      newSearchParams.delete("filter");
      navigate({
        search: `?${newSearchParams.toString()}`,
      });
      return;
    }

    // Determine the appropriate aggregateBy based on the number of filters
    // Number of filters corresponds to the next level in the hierarchy
    // 0 filters -> namespace, 1 filter -> controllerKind, 2 filters -> controller, etc.
    const targetAgg = aggregateHierarchy[trimmedFilters.length] || "namespace";

    const newSearchParams = new URLSearchParams(routerLocation.search);
    newSearchParams.set("agg", targetAgg);
    if (trimmedFilters.length > 0) {
      newSearchParams.set("filter", parseFilters(trimmedFilters));
    } else {
      newSearchParams.delete("filter");
    }
    navigate({
      search: `?${newSearchParams.toString()}`,
    });
  }

  // Drilldown function to navigate to next level of aggregation
  function drilldown(row) {
    // Define the hierarchy for drilldown
    const drilldownHierarchy = {
      namespace: "controllerKind",
      controllerKind: "controller",
      controller: "pod",
      pod: "container",
    };

    const nextAgg = drilldownHierarchy[aggregateBy];
    
    // If we're at the deepest level, don't allow further drilldown
    if (!nextAgg) {
      return;
    }

    // Create new filter for the current level
    // Ensure value is not empty and is a string
    if (!row.name || String(row.name).trim() === "") {
      return;
    }
    
    // Map aggregateBy to filter property name
    // Backend uses "controllerName" instead of "controller"
    const filterPropertyMap = {
      namespace: "namespace",
      controllerKind: "controllerKind",
      controller: "controllerName", // Backend expects "controllerName", not "controller"
      pod: "pod",
      container: "container",
    };
    
    const filterProperty = filterPropertyMap[aggregateBy] || aggregateBy;
    
    let filterValue = String(row.name).trim();
    let updatedFilters = [...filters];

    // Controller names may come through as "<kind>:<name>" (e.g. "deployment:foo").
    // Split these so controllerName filter matches backend expectations.
    if (aggregateBy === "controller" && filterValue.includes(":")) {
      const [maybeKind, ...nameParts] = filterValue.split(":");
      const trimmedName = nameParts.join(":").trim();
      if (trimmedName.length > 0) {
        filterValue = trimmedName;
      }

      const normalizedKind = maybeKind.trim();
      if (
        normalizedKind.length > 0 &&
        !updatedFilters.some((f) => f.property === "controllerKind")
      ) {
        updatedFilters = [
          ...updatedFilters,
          {
            property: "controllerKind",
            value: normalizedKind,
          },
        ];
      }
    }

    const newFilter = {
      property: filterProperty,
      value: filterValue,
    };

    // Add to existing filters and update aggregateBy
    const newFilters = [...updatedFilters, newFilter];
    
    // Update URL parameters with new aggregateBy and filters
    const newSearchParams = new URLSearchParams(routerLocation.search);
    newSearchParams.set("agg", nextAgg);
    if (newFilters.length > 0) {
      newSearchParams.set("filter", parseFilters(newFilters));
    } else {
      newSearchParams.delete("filter");
    }
    navigate({
      search: `?${newSearchParams.toString()}`,
    });
  }

  return (
    <Page active="reports.html">
      <Header headerTitle="Cost Allocation">
        <IconButton
          aria-label="refresh"
          onClick={() => fetchData()}
          style={{ padding: 12 }}
        >
          <RefreshIcon />
        </IconButton>
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
            setWindow={(win) => {
              searchParams.set("window", win);
              navigate({
                search: `?${searchParams.toString()}`,
              });
            }}
            aggregationOptions={aggregationOptions}
            aggregateBy={aggregateBy}
            setAggregateBy={(agg) => {
              const newSearchParams = new URLSearchParams(routerLocation.search);
              newSearchParams.set("agg", agg);
              // Reset filters when aggregateBy is changed manually
              newSearchParams.delete("filter");
              navigate({
                search: `?${newSearchParams.toString()}`,
              });
            }}
            accumulateOptions={accumulateOptions}
            accumulate={accumulate}
            setAccumulate={(acc) => {
              searchParams.set("acc", acc);
              navigate({
                search: `?${searchParams.toString()}`,
              });
            }}
            title={title}
            cumulativeData={cumulativeData}
            currency={currency}
            currencyOptions={currencyCodes}
            setCurrency={(curr) => {
              searchParams.set("currency", curr);
              navigate({
                search: `?${searchParams.toString()}`,
              });
            }}
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
