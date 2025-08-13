import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/styles";
import {
  find,
  get,
  sortBy,
  toArray
} from "lodash";
import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { useLocation, useHistory } from "react-router";

import AllocationReport from "../components/allocationReport";
import Controls from "../components/Controls";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Page from "../components/Page";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import { getCurrencyConversionRate } from "../services/currency";
import AllocationService from "../services/allocation";
import { currencyCodes } from "../constants/currencyCodes";
import {
  checkCustomWindow,
  cumulativeToTotals,
  rangeToCumulative,
  toVerboseTimeRange,
  applyConversionRate,
} from "../util";
import { DEFAULT_CURRENCY, DEFAULT_CONVERSION_RATE } from "../constants/defaults";

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

const useStyles = makeStyles({
  reportHeader: {
    display: "flex",
    flexFlow: "row",
    padding: 24,
  },
  titles: {
    flexGrow: 1,
  },
});

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

  let aggregationName = "";
  if (Array.isArray(aggregateBy) && aggregateBy.length > 0) {
    // If aggregateBy is an array, get names for all selected values
    const selectedAggregationNames = aggregateBy.map(val =>
      get(find(aggregationOptions, { value: val }), "name", val).toLowerCase()
    );

    if (selectedAggregationNames.length === 1) {
      aggregationName = selectedAggregationNames[0];
    } else if (selectedAggregationNames.length === 2) {
      aggregationName = selectedAggregationNames.join(" and "); // "namespace and cluster"
    } else {
      // For three or more, use commas with "and" before the last item
      const last = selectedAggregationNames.pop();
      aggregationName = `${selectedAggregationNames.join(", ")} and ${last}`; // "namespace, cluster, and node"
    }

  } else {
    // Fallback for single string (if it ever occurs or for initial default)
    aggregationName = get(
      find(aggregationOptions, { value: aggregateBy }),
      "name",
      ""
    ).toLowerCase();
    if (aggregationName === "") {
      console.warn(`unknown aggregation: ${aggregateBy}`);
    } 
  }

  let str = `${windowName} by ${aggregationName}`;

  if (!accumulate) {
    str = `${str} daily`;
  }
  return str;
}

const ReportsPage = () => {
  const classes = useStyles();

  // Raw data state which will set allocationData when changed
  const [rawData, setRawData] = useState([])
  const [cumulativeData, setCumulativeData] = useState({});
  const [totalData, setTotalData] = useState({});
  

  const [baseCurrency, setBaseCurrency] = useState(DEFAULT_CURRENCY);
  const [targetCurrency, setTargetCurrency] = useState(DEFAULT_CURRENCY);
  const [conversionRate, setConversionRate] = useState(DEFAULT_CONVERSION_RATE);

  const allocationData = useMemo(() => {
    return applyConversionRate(rawData, conversionRate);
  }, [rawData, conversionRate]);

  // When allocation data changes, create a cumulative version of it
  useEffect(() =>  {
    const cumulative = rangeToCumulative(allocationData, aggregateBy);
    setCumulativeData(toArray(cumulative));
    setTotalData(cumulativeToTotals(cumulative));
  }, [allocationData]);

  // Form state, which controls form elements, but not the report itself. On
  // certain actions, the form state may flow into the report state.
  const [window, setWindow] = useState(windowOptions[0].value);
  const [aggregateBy, setAggregateBy] = useState([aggregationOptions[0].value]);
  const [accumulate, setAccumulate] = useState(accumulateOptions[0].value);
  
  // Report state, including current report and saved options
  const [title, setTitle] = useState("Last 7 days by namespace daily");

  // When parameters changes, fetch data. This should be the
  // only mechanism used to fetch data. Also generate a sensible title from the paramters.
  useEffect(() => {
    setFetch(true);
    setTitle(generateTitle({ window, aggregateBy, accumulate }));
  }, [window, aggregateBy, accumulate]);

  // page and settings state
  const [init, setInit] = useState(false);
  const [fetch, setFetch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  // Initialize once, then fetch report each time setFetch(true) is called
  useEffect(() => {
    if (!init) {
      initialize();
    }
    if (init || fetch) {
      fetchData();
    }
  }, [init, fetch]);

  // parse any context information from the URL
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const routerHistory = useHistory();
  useEffect(() => {
    setWindow(searchParams.get("window") || "7d");
    const aggParam = searchParams.get("agg");
    setAggregateBy(aggParam ? aggParam.split(",") : [aggregationOptions[0].value]);
    setAccumulate(searchParams.get("acc") === "true" || false);
    setTargetCurrency(searchParams.get("currency") || DEFAULT_CURRENCY);
  }, [routerLocation]);
  
  // NEW: Effect to fetch conversion rate whenever targetCurrency changes
  useEffect(() => {
    const fetchRate = async () => {
      if (targetCurrency === baseCurrency || !targetCurrency) {
        setConversionRate(1);
        return;
      }
      const rate = await getCurrencyConversionRate(baseCurrency, targetCurrency);
      console.log(rate)
      if (rate) {
        setConversionRate(rate);
        setBaseCurrency(targetCurrency); // Update base to new currency after successful conversion
      }
    };
    fetchRate();
  }, [targetCurrency]);

  async function initialize() {
    setInit(true);
  }

  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      const resp = await AllocationService.fetchAllocation(
        window,
        aggregateBy,
        { accumulate }
      );
      if (resp.data && resp.data.length > 0) {
        const allocationRange = resp.data;
        for (const i in allocationRange) {
          // update cluster aggregations to use clusterName/clusterId names
          allocationRange[i] = sortBy(allocationRange[i], (a) => a.totalCost);
        }
        setRawData(allocationRange);
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
        setRawData([]);
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
        let secondary =
          "Please open an Issue on GitHub if problems persist.";
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
      setRawData([]);
    }

    setLoading(false);
    setFetch(false);
  }
  return (
    <Page active="allocations.html">
      <Header headerTitle='Allocations'>
        <IconButton aria-label="refresh" onClick={() => setFetch(true)}>
          <RefreshIcon />
        </IconButton>
      </Header>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}

      {init && (
        <Paper id="report">
          <div className={classes.reportHeader}>
            <div className={classes.titles}>
              <Typography variant="h5">{title}</Typography>
              <Subtitle report={{ window, aggregateBy, accumulate }} />
            </div>

            <Controls
              windowOptions={windowOptions}
              window={window}
              setWindow={(win) => {
                searchParams.set("window", win);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
              aggregationOptions={aggregationOptions}
              aggregateBy={aggregateBy}
              setAggregateBy={(agg) => {
                searchParams.set("agg", Array.isArray(agg) ? agg.join(",") : agg);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
              accumulateOptions={accumulateOptions}
              accumulate={accumulate}
              setAccumulate={(acc) => {
                searchParams.set("acc", acc);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
              title={title}
              cumulativeData={cumulativeData}
              currency={targetCurrency}
              currencyOptions={currencyCodes}
              setCurrency={(curr) => {
                searchParams.set("currency", curr);
                routerHistory.push({
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
              currency={targetCurrency}
            />
          )}
        </Paper>
      )}
      <Footer />
    </Page>
  );
};

export default React.memo(ReportsPage);
