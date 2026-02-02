import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { get, find } from "lodash";
import { useGlobalEvent } from "../services/eventBus";
import { Button, Link, Tile } from "@carbon/react";
import { Renew } from "@carbon/icons-react";

import Page from "../components/Page";
import PageSkeleton from "../components/PageSkeleton";
import Header from "../components/Header";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import CloudCostEditControls from "../components/cloudCost/controls/cloudCostEditControls";
import CloudCostTopService from "../services/cloudCostTop";
import CloudCost from "../components/cloudCost/cloudCost";
import { CloudCostDetails } from "../components/cloudCost/cloudCostDetails";
import { checkCustomWindow, toVerboseTimeRange } from "../util";
import { currencyCodes } from "../constants/currencyCodes";
import {
  windowOptions,
  costMetricOptions,
  aggregationOptions,
} from "../components/cloudCost/tokens";
import {
  CloudCostData,
  CloudCostFilter,
  CloudCostErrorItem,
  TableRowItem,
  TitleParams,
} from "../types/cloudCost";

const CloudCosts: React.FC = () => {
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
  const [filters, setFilters] = React.useState<CloudCostFilter[]>([]);
  const [currency, setCurrency] = React.useState<string>("USD");
  const [selectedProviderId, setSelectedProviderId] = React.useState<string>("");
  const [selectedItemName, setSelectedItemName] = React.useState<string>("");
  const sampleData = aggregateBy.includes("item");
  const [init, setInit] = React.useState<boolean>(false);
  const [fetch, setFetch] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errors, setErrors] = React.useState<CloudCostErrorItem[]>([]);

  const [cloudCostData, setCloudCostData] = React.useState<CloudCostData>({});

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  function generateTitle({ window, aggregateBy, costMetric }: TitleParams): string {
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
      if (resp && (resp.tableRows || resp.graphData)) {
        setCloudCostData(resp);
      } else if (resp && resp.message) {
        if (resp.message.indexOf("boundary error") >= 0) {
          let match = resp.message.match(/(ETL is \d+\.\d+% complete)/);
          let secondary = "Try again after ETL build is complete";
          if (match && match.length > 0) {
            secondary = `${match[1]}. ${secondary}`;
          }
          setErrors([
            {
              primary: "Data unavailable while ETL is building",
              secondary: secondary,
            },
          ]);
        }
        setCloudCostData({});
      } else {
        // No data returned
        setCloudCostData({});
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.indexOf("404") === 0) {
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
        if (error.message && error.message.length > 0) {
          secondary = error.message;
        }
        setErrors([
          {
            primary: "Failed to load report data",
            secondary: secondary,
          },
        ]);
      }
      setCloudCostData({});
    }
    setLoading(false);
  }

  function drilldown(row: TableRowItem): void {
    if (aggregateBy.includes("item")) {
      try {
        setSelectedProviderId(row.providerID);
        setSelectedItemName(row.labelName ?? row.name);
      } catch (e) {
        console.error(e);
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

  useEffect(() => {
    if (!init) {
      initialize();
    }
    if (init || fetch) {
      fetchData();
    }
  }, [init, fetch]);

  useGlobalEvent("refresh", fetchData);

  React.useEffect(() => {
    setFetch(!fetch);
    setTitle(generateTitle({ window, aggregateBy, costMetric }));
  }, [window, aggregateBy, costMetric, filters]);

  const hasCloudCostEnabled = aggregateBy.includes("item")
    ? true
    : cloudCostData?.cloudCostStatus?.length > 0 ||
    cloudCostData?.tableRows?.length > 0 ||
    errors.length > 0;

  const enabledWarnings = [
    {
      primary: "There are no Cloud Cost integrations currently configured.",
      secondary: (
        <>
          Learn more about setting up Cloud Costs{" "}
          <Link href="https://www.opencost.io/docs/configuration/#cloud-costs">
            here
          </Link>
        </>
      ),
    },
  ];

  return (
    <Page>
      <Header headerTitle="Cloud Costs">
        <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
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

      {!loading && !hasCloudCostEnabled && (
        <div style={{ marginBottom: "1rem" }}>
          <Warnings warnings={enabledWarnings} />
        </div>
      )}

      {!loading && errors.length > 0 && hasCloudCostEnabled && (
        <div style={{ marginBottom: "1rem" }}>
          <Warnings warnings={errors} />
        </div>
      )}

      {init && hasCloudCostEnabled && (
        <Tile>
          <div style={{ display: "flex", flexFlow: "row", padding: "1.5rem" }}>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                {title}
              </h3>
              <Subtitle report={{ window, aggregateBy }} />
            </div>
          </div>

          {loading && (
            <div style={{ padding: "1rem" }}>
              <PageSkeleton type="chart" rows={6} />
            </div>
          )}

          {!loading && (
            <CloudCost
              cumulativeData={cloudCostData.tableRows}
              currency={currency}
              totalData={cloudCostData.tableTotal}
              drilldown={drilldown}
              sampleData={sampleData}
            />
          )}

          {selectedProviderId && selectedItemName && (
            <CloudCostDetails
              onClose={() => {
                setSelectedProviderId("");
                setSelectedItemName("");
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
        </Tile>
      )}
    </Page>
  );
};

export default React.memo(CloudCosts);
