import * as React from "react";
import PageLayout from "../components/PageLayout";
import Header from "../components/Header";
import Footer from "../components/Footer";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Paper, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { get, find } from "lodash";
import { useLocation, useNavigate } from "react-router";

import { checkCustomWindow, toVerboseTimeRange } from "../util";
import ExternalCostEditControls from "../components/externalCosts/controls/externalCostEditControls";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import ExternalCostService from "../services/externalCosts";

import {
  windowOptions,
  aggregationOptions,
} from "../components/externalCosts/tokens";

import { currencyCodes } from "../constants/currencyCodes";
import ExternalCost from "../components/externalCosts/externalCost";

const ExternalCosts = () => {
  const [title, setTitle] = React.useState(
    "External Costs for last 7 days by category",
  );
  const [window, setWindow] = React.useState(windowOptions[0].value);
  const [aggregateBy, setAggregateBy] = React.useState(
    aggregationOptions[0].value,
  );
  const [filters, setFilters] = React.useState([]);
  const [currency, setCurrency] = React.useState("USD");
  const [init, setInit] = React.useState(false);
  const [fetch, setFetch] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);

  const [externalCostData, setExternalCostData] = React.useState([]);

  function generateTitle({ window, aggregateBy }) {
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

    return `External Costs for ${windowName} by ${aggregationName}`;
  }

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  async function initialize() {
    setInit(true);
  }

  async function fetchData() {
    setLoading(true);
    setErrors([]);
    try {
      const resp = await ExternalCostService.fetchExternalCostData(
        window,
        aggregateBy,
        filters,
      );
      if (resp) {
        setExternalCostData(resp);
      } else {
        setErrors([
          {
            primary: "Failed to load external cost data",
            secondary: "Please try again later.",
          },
        ]);
        setExternalCostData([]);
      }
    } catch (err) {
      setErrors([
        {
          primary: "Failed to load report data",
          secondary:
            "Please update OpenCost to the latest version, and open an Issue if problems persist.",
        },
      ]);
      setExternalCostData([]);
    }
    setLoading(false);
  }

  function drilldown(row) {
    const nextAgg = aggregateBy === "category" ? "subcategory" : "item";
    const newFilters = [
      ...filters,
      {
        property: aggregateBy,
        value: row.name,
      },
    ];
    setFilters(newFilters);
    setAggregateBy(nextAgg);
  }

  React.useEffect(() => {
    setWindow(searchParams.get("window") || "7d");
    setAggregateBy(searchParams.get("agg") || "category");
    setCurrency(searchParams.get("currency") || "USD");
  }, [routerLocation]);

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
    setTitle(generateTitle({ window, aggregateBy }));
  }, [window, aggregateBy, filters]);

  return (
    <PageLayout>
      <Header headerTitle="External Costs">
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
        <Paper id="external-cost">
          <div style={{ display: "flex", flexFlow: "row", padding: 24 }}>
            <div style={{ flexGrow: 1 }}>
              <Typography variant="h5">{title}</Typography>
              <Subtitle report={{ window, aggregateBy }} />
            </div>
            <ExternalCostEditControls
              windowOptions={windowOptions}
              window={window}
              setWindow={(win) => {
                searchParams.set("window", win);
                navigate({
                  search: `?${searchParams.toString()}`,
                });
              }}
              aggregationOptions={aggregationOptions}
              aggregateBy={aggregateBy}
              setAggregateBy={(agg) => {
                setFilters([]);
                searchParams.set("agg", agg);
                navigate({
                  search: `?${searchParams.toString()}`,
                });
              }}
              title={title}
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
            <ExternalCost
              data={externalCostData}
              currency={currency}
              drilldown={drilldown}
            />
          )}
        </Paper>
      )}
      <Footer />
    </PageLayout>
  );
};

export default React.memo(ExternalCosts);
