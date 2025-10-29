import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/styles";
import { find, get, sortBy, toArray } from "lodash";
import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router";

import AllocationReport from "../components/allocationReport";
import Controls from "../components/Controls";
import Header from "../components/Header";
import Page from "../components/Page";
import Footer from "../components/Footer";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import AllocationService from "../services/allocation";
import {
  checkCustomWindow,
  cumulativeToTotals,
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

  let aggregationName = get(
    find(aggregationOptions, { value: aggregateBy }),
    "name",
    ""
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
  const classes = useStyles();

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
  const routerHistory = useHistory();

  const win = searchParams.get("window") || "7d";
  const aggregateBy = searchParams.get("agg") || "namespace";
  const accumulate = searchParams.get("acc") === "true";
  const currency = searchParams.get("currency") || "USD";
  const title =
    searchParams.get("title") ||
    generateTitle({ window: win, aggregateBy, accumulate });

  // When parameters which effect query results change, refetch the data.
  useEffect(() => {
    fetchData();
  }, [win, aggregateBy, accumulate]);

  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      const resp = await AllocationService.fetchAllocation(win, aggregateBy, {
        accumulate,
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
  return (
    <Page active="reports.html">
      <Header headerTitle="Cost Allocation">
        <IconButton aria-label="refresh" onClick={() => fetchData()}>
          <RefreshIcon />
        </IconButton>
      </Header>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}
      <Paper id="report">
        <div className={classes.reportHeader}>
          <div className={classes.titles}>
            <Typography variant="h5">{title}</Typography>
            <Subtitle report={{ window: win, aggregateBy, accumulate }} />
          </div>

          <Controls
            windowOptions={windowOptions}
            window={win}
            setWindow={(win) => {
              searchParams.set("window", win);
              routerHistory.push({
                search: `?${searchParams.toString()}`,
              });
            }}
            aggregationOptions={aggregationOptions}
            aggregateBy={aggregateBy}
            setAggregateBy={(agg) => {
              searchParams.set("agg", agg);
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
            currency={currency}
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
            currency={currency}
          />
        )}
      </Paper>
      <Footer />
    </Page>
  );
};

export default React.memo(ReportsPage);
