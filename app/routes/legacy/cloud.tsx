// @ts-nocheck
import * as React from "react";
import Page from "~/components/legacy/Page";
import Header from "~/components/legacy/Header";
import Footer from "~/components/legacy/Footer";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Link, Paper, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { get, find } from "lodash";
import { useLocation, useNavigate } from "react-router";

import { checkCustomWindow, toVerboseTimeRange } from "~/lib/legacy-util";
import CloudCostEditControls from "~/components/legacy/cloudCost/controls/cloudCostEditControls";
import Subtitle from "~/components/legacy/Subtitle";
import Warnings from "~/components/legacy/Warnings";
import CloudCostService from "~/services/cloud-cost";

import {
  windowOptions,
  costMetricOptions,
  aggregationOptions,
} from "~/components/legacy/cloudCost/tokens";

import { currencyCodes } from "~/constants/currencyCodes";
import CloudCost from "~/components/legacy/cloudCost/cloudCost";
import { CloudCostDetails } from "~/components/legacy/cloudCost/cloudCostDetails";

export function meta() {
  return [{ title: "OpenCost — Cloud Costs" }];
}

const CloudCosts = () => {
  const [title, setTitle] = React.useState("Cumulative cost for last 7 days by account");
  const [window, setWindow] = React.useState(windowOptions[0].value);
  const [aggregateBy, setAggregateBy] = React.useState(aggregationOptions[0].value);
  const [costMetric, setCostMetric] = React.useState(costMetricOptions[0].value);
  const [filters, setFilters] = React.useState([]);
  const [currency, setCurrency] = React.useState("USD");
  const [selectedProviderId, setSelectedProviderId] = React.useState("");
  const [selectedItemName, setselectedItemName] = React.useState("");
  const sampleData = aggregateBy.includes("item");

  const [init, setInit] = React.useState(false);
  const [fetch, setFetch] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);
  const [cloudCostData, setCloudCostData] = React.useState([]);

  function generateTitle({ window, aggregateBy, costMetric }) {
    let windowName = get(find(windowOptions, { value: window }), "name", "");
    if (windowName === "") {
      if (checkCustomWindow(window)) windowName = toVerboseTimeRange(window);
      else console.warn(`unknown window: ${window}`);
    }
    let aggregationName = get(find(aggregationOptions, { value: aggregateBy }), "name", "").toLowerCase();
    if (aggregationName === "") console.warn(`unknown aggregation: ${aggregateBy}`);
    let str = `Cumulative cost for ${windowName} by ${aggregationName}`;
    if (!costMetric) str = `${str} amoritizedNetCost`;
    return str;
  }

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  async function initialize() { setInit(true); }

  async function fetchData() {
    setLoading(true);
    setErrors([]);
    try {
      const resp = await CloudCostService.fetchCloudCostData(window, aggregateBy, costMetric, filters);
      if (resp) {
        setCloudCostData(resp);
      } else {
        if (resp.message && resp.message.indexOf("boundary error") >= 0) {
          let match = resp.message.match(/(ETL is \d+\.\d+% complete)/);
          let secondary = "Try again after ETL build is complete";
          if (match && match.length > 0) secondary = `${match[1]}. ${secondary}`;
          setErrors([{ primary: "Data unavailable while ETL is building", secondary }]);
        }
        setCloudCostData([]);
      }
    } catch (err) {
      if (err.message.indexOf("404") === 0) {
        setErrors([{ primary: "Failed to load report data", secondary: "Please update OpenCost to the latest version, and open an Issue if problems persist." }]);
      } else {
        setErrors([{ primary: "Failed to load report data", secondary: err.message || "Please open an Issue with OpenCost if problems persist." }]);
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
      } catch (e) { console.error(e); }
      return;
    }
    const nameParts = row.name.split("/");
    const nextAgg = aggregateBy.includes("service") ? "item" : "service";
    const aggToString = [aggregateBy];
    const newFilters = aggToString.map((property, i) => ({ property, value: nameParts[i] }));
    setFilters(newFilters);
    setAggregateBy(nextAgg);
  }

  React.useEffect(() => {
    setWindow(searchParams.get("window") || "7d");
    setAggregateBy(searchParams.get("agg") || "provider");
    setCostMetric(searchParams.get("costMetric") || "AmortizedNetCost");
    setCurrency(searchParams.get("currency") || "USD");
  }, [routerLocation]);

  React.useEffect(() => {
    if (!init) initialize();
    if (init || fetch) fetchData();
  }, [init, fetch]);

  React.useEffect(() => {
    setFetch(!fetch);
    setTitle(generateTitle({ window, aggregateBy, costMetric }));
  }, [window, aggregateBy, costMetric, filters]);

  React.useEffect(() => {
    if (currency !== "USD") {
      setErrors([{ primary: "Currency Conversion in Use", secondary: "Forex rates may differ between the API and your cloud provider, potentially causing cost discrepancies. Always verify with your actual cloud bill." }]);
    } else {
      setErrors([]);
    }
  }, [currency]);

  const hasCloudCostEnabled = aggregateBy.includes("item") ? true : !!cloudCostData.cloudCostStatus?.length;

  const enabledWarnings = [
    {
      primary: "There are no Cloud Cost integrations currently configured.",
      secondary: (
        <>
          Learn more about setting up Cloud Costs{" "}
          <Link href={"https://www.opencost.io/docs/configuration/#cloud-costs"} target="_blank">
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
          <div style={{ display: "flex", flexFlow: "row", padding: 24 }}>
            <div style={{ flexGrow: 1 }}>
              <Typography variant="h5">{title}</Typography>
              <Subtitle report={{ window, aggregateBy }} />
            </div>
            <CloudCostEditControls
              windowOptions={windowOptions}
              window={window}
              setWindow={(win) => { searchParams.set("window", win); navigate({ search: `?${searchParams.toString()}` }); }}
              aggregationOptions={aggregationOptions}
              aggregateBy={aggregateBy}
              setAggregateBy={(agg) => { setFilters([]); searchParams.set("agg", agg); navigate({ search: `?${searchParams.toString()}` }); }}
              costMetricOptions={costMetricOptions}
              costMetric={costMetric}
              setCostMetric={(c) => { searchParams.set("costMetric", c); navigate({ search: `?${searchParams.toString()}` }); }}
              title={title}
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
              onClose={() => { setSelectedProviderId(""); setselectedItemName(""); }}
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
