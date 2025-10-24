import * as React from "react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import IconButton from "@material-ui/core/IconButton";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/styles";
import { Box, Link, Paper, Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { get, find } from "lodash";
import { useLocation, useHistory } from "react-router";

import { checkCustomWindow, toVerboseTimeRange } from "../util";
import CloudCostEditControls from "../components/cloudCost/controls/cloudCostEditControls";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import CloudCostTopService from "../services/cloudCostTop";

import {
  windowOptions,
  costMetricOptions,
  aggregationOptions,
  aggMap,
} from "../components/cloudCost/tokens";

import { currencyCodes } from "../constants/currencyCodes";
import CloudCost from "../components/cloudCost/cloudCost";
import { CloudCostDetails } from "../components/cloudCost/cloudCostDetails";

const CloudCosts = () => {
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
  const classes = useStyles();

  // Form state, which controls form elements, but not the report itself. On
  // certain actions, the form state may flow into the report state.
  const [title, setTitle] = React.useState(
    "Cumulative cost for last 7 days by account",
  );
  const [window, setWindow] = React.useState(windowOptions[0].value);
  const [aggregateBy, setAggregateBy] = React.useState(
    aggregationOptions[0].value,
  );
  const [costMetric, setCostMetric] = React.useState(
    costMetricOptions[0].value,
  );
  const [filters, setFilters] = React.useState([]);
  const [currency, setCurrency] = React.useState("USD");
  const [selectedProviderId, setSelectedProviderId] = React.useState("");
  const [selectedItemName, setselectedItemName] = React.useState("");
  const sampleData = aggregateBy.includes("item");
  // page and settings state
  const [init, setInit] = React.useState(false);
  const [fetch, setFetch] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);

  // data
  const [cloudCostData, setCloudCostData] = React.useState([]);

  function generateTitle({ window, aggregateBy, costMetric }) {
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

    let str = `Cumulative cost for ${windowName} by ${aggregationName}`;

    if (!costMetric) {
      str = `${str} amoritizedNetCost`;
    }

    return str;
  }

  // parse any context information from the URL
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const routerHistory = useHistory();

  async function initialize() {
    setInit(true);
  }

  async function fetchData() {
    setLoading(true);
    setErrors([]);
    try {
      const resp = await CloudCostTopService.fetchCloudCostData(
        window,
        aggregateBy,
        costMetric,
        filters,
      );
      if (resp) {
        setCloudCostData(resp);
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
        setCloudCostData([]);
      }
    } catch (err) {
      if (err.message.indexOf("404") === 0) {
        setErrors([
          {
            primary: "Failed to load report data",
            secondary:
              "Please update OpenCost to the latest version, and open an Issue if problems persist.",
          },
        ]);
      } else {
        let secondary =
          "Please open an Issue with OpenCost if problems persist.";
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
      setCloudCostData([]);
    }
    setLoading(false);
  }

  function drilldown(row) {
    if (aggregateBy.includes("item")) {
      try {
        setSelectedProviderId(row.providerID);
        setselectedItemName(row.labelName ?? row.name);
      } catch (e) {
        logger.error(e);
      }

      return;
    }
    const nameParts = row.name.split("/");
    const nextAgg = aggregateBy.includes("service") ? "item" : "service";
    const aggToString = [aggregateBy];
    const newFilters = aggToString.map((property, i) => {
      const value = nameParts[i];
      return {
        property,
        value,
      };
    });
    setFilters(newFilters);
    setAggregateBy(nextAgg);
  }

  React.useEffect(() => {
    setWindow(searchParams.get("window") || "7d");
    setAggregateBy(searchParams.get("agg") || "provider");
    setCostMetric(searchParams.get("costMetric") || "AmortizedNetCost");
    setCurrency(searchParams.get("currency") || "USD");
  }, [routerLocation]);

  // Initialize once, then fetch report each time setFetch(true) is called
  React.useEffect(() => {
    if (!init) {
      initialize();
    }
    if (init || fetch) {
      fetchData();
    }
  }, [init, fetch]);

  React.useEffect(() => {
    setFetch(!fetch);
    setTitle(generateTitle({ window, aggregateBy, costMetric }));
  }, [window, aggregateBy, costMetric, filters]);

  const hasCloudCostEnabled = aggregateBy.includes("item")
    ? true // this is kind of hacky but something weird is happening
    : // when drilling down will address in a later PR - @jjarrett21
      !!cloudCostData.cloudCostStatus?.length;

  const enabledWarnings = [
    {
      primary: "There are no Cloud Cost integrations currently configured.",
      secondary: (
        <>
          Learn more about setting up Cloud Costs{" "}
          <Link
            href={"https://www.opencost.io/docs/configuration/#cloud-costs"}
            target="_blank"
          >
            here
          </Link>
        </>
      ),
    },
  ];

  return (
    <Page active="cloud.html">
      <Header headerTitle="Cloud Costs">
        <IconButton aria-label="refresh" onClick={() => setFetch(true)}>
          <RefreshIcon />
        </IconButton>
      </Header>

      {!loading && !hasCloudCostEnabled && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={enabledWarnings} />
        </div>
      )}

      {!loading && errors.length > 0 && hasCloudCostEnabled && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}

      {init && hasCloudCostEnabled && (
        <Paper id="cloud-cost">
          <div className={classes.reportHeader}>
            <div className={classes.titles}>
              <Typography variant="h5">{title}</Typography>
              <Subtitle report={{ window, aggregateBy }} />
            </div>
            <CloudCostEditControls
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
                setFilters([]);
                searchParams.set("agg", agg);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
              costMetricOptions={costMetricOptions}
              costMetric={costMetric}
              setCostMetric={(c) => {
                searchParams.set("costMetric", c);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
              title={title}
              // cumulativeData={cumulativeData}
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
            <CloudCost
              cumulativeData={cloudCostData.tableRows}
              currency={currency}
              graphData={cloudCostData.graphData}
              totalData={cloudCostData.tableTotal}
              drilldown={drilldown}
              sampleData={sampleData}
            />
          )}
          {selectedProviderId && selectedItemName && (
            <CloudCostDetails
              onClose={() => {
                setSelectedProviderId("");
                setselectedItemName("");
              }}
              selectedProviderId={selectedProviderId}
              selectedItem={selectedItemName}
              agg={aggregateBy}
              filters={filters}
              costMetric={costMetric}
              window={window}
              currency={currency}
            />
          )}
        </Paper>
      )}
      <Footer />
    </Page>
  );
};

export default React.memo(CloudCosts);
