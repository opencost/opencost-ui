import React, { useEffect } from "react";
import { useGlobalEvent } from "../services/eventBus";
import Page from "../components/Page";
import PageSkeleton from "../components/PageSkeleton";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button, Tile } from "@carbon/react";
import { Renew } from "@carbon/icons-react";
import { get, find } from "lodash";
import { useLocation, useNavigate } from "react-router";

import { checkCustomWindow, toVerboseTimeRange } from "../util";
import ExternalCostEditControls from "../components/externalCosts/externalCostsControls";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import ExternalCostService from "../services/externalCosts";

import { windowOptions, aggregationOptions } from "../components/externalCosts/tokens";

import { currencyCodes } from "../constants/currencyCodes";
import { ExternalCost } from "../components/externalCosts/externalCost";

const ExternalCosts = () => {
  const [title, setTitle] = React.useState("External Costs for last 7 days by category");
  const [window, setWindow] = React.useState(windowOptions[0].value);
  const [aggregateBy, setAggregateBy] = React.useState(aggregationOptions[0].value);
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
      ""
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
      const resp = await ExternalCostService.fetchExternalCostData(window, aggregateBy, filters);
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

  useEffect(() => {
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

  useGlobalEvent("refresh", fetchData);

  return (
    <Page>
      <Header headerTitle="External Costs">
        <div style={{ marginTop: "1rem" }}>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={() => <Renew size={20} />}
            iconDescription="Refresh (R)"
            onClick={() => setFetch(true)}
            hasIconOnly
            tooltipPosition="bottom"
          />
        </div>
      </Header>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <Warnings warnings={errors} />
        </div>
      )}

      {init && (
        <Tile>
          <div style={{ display: "flex", flexFlow: "row", padding: "1.5rem" }}>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{title}</h3>
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
            <div style={{ padding: "1rem" }}>
              <PageSkeleton type="chart" rows={6} />
            </div>
          )}

          {!loading && (
            <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
              <ExternalCost data={externalCostData} currency={currency} drilldown={drilldown} />
            </div>
          )}
        </Tile>
      )}
      <Footer />
    </Page>
  );
};

export default React.memo(ExternalCosts);
