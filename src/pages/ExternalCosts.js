import * as React from "react";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";
import { Button as CarbonButton, Heading, InlineLoading } from "@carbon/react";
import { Renew } from "@carbon/icons-react";
import { get, find } from "lodash";

import { useLocation, useNavigate } from "react-router";
import { checkCustomWindow, toVerboseTimeRange } from "../util";
import Warnings from "../components/Warnings";
import ExternalCostsService from "../services/externalCosts";
import Subtitle from "../components/Subtitle";

import {
  windowOptions,
  aggregationOptions,
  costTypeOptions,
} from "../components/externalCosts/tokens";
import ExternalCostsControls from "../components/externalCosts/externalCostsControls";
import ExternalCostsChart from "../components/externalCosts/externalCostsChart";
import ExternalCostsTable from "../components/externalCosts/externalCostsTable";
import { aggToKeyMapExternalCosts } from "../components/externalCosts/tokens";
import { ExternalCostDetails } from "../components/externalCosts/externalCostDetailModal";

const ExternalCosts = () => {
  const [title, setTitle] = React.useState("External costs for last 7 days by domain");
  const [window, setWindow] = React.useState(windowOptions[0].value);
  const [costType, setCostType] = React.useState(costTypeOptions[0].value);
  const [sortBy, setSortBy] = React.useState("cost");
  const [sortDirection, setSortDirection] = React.useState("desc");
  const [aggregateBy, setAggregateBy] = React.useState(
    aggregationOptions[0].value,
  );
  const [filters, setFilters] = React.useState([]);
  const [currency, setCurrency] = React.useState("USD");

  // page and settings state
  const [init, setInit] = React.useState(false);
  const [fetch, setFetch] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);

  // data
  const [externalCostData, setExternalCostData] = React.useState([]);
  const [externalCostTableData, setExternalCostTableData] = React.useState([]);

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

    return `External costs for ${windowName} by ${aggregationName}`;
  }

  // parse any context information from the URL
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  async function initialize() {
    setInit(true);
  }

  async function fetchChartData() {
    try {
      const resp = await ExternalCostsService.fetchExternalGraphCosts(
        window,
        aggregateBy,
        filters,
        costType,
        sortBy,
        sortDirection,
      );
      if (resp) {
        setExternalCostData(resp);
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
        setExternalCostData([]);
      }
    } catch (err) {
      console.log(err);
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
      setExternalCostData([]);
    }
  }
  async function fetchTableData() {
    try {
      const resp = await ExternalCostsService.fetchExternalTableCosts(
        window,
        aggregateBy,
        filters,
        costType,
        sortBy,
        sortDirection,
      );
      if (resp) {
        setExternalCostTableData(resp);
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
        setExternalCostTableData([]);
      }
    } catch (err) {
      console.log(err);
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
      setExternalCostTableData([]);
    }
  }

  async function fetchData() {
    setLoading(true);
    setErrors([]);
    // todo: come back and have inidividual loading
    await fetchChartData();
    await fetchTableData();
    setLoading(false);
  }

  function drilldown(row) {
    // Drilldown order: domain > account Name > resource type > resource name
    // We only want drilldown functionality on these items
    if (
      ["domain", "accountName", "resourceType", "resourceName"].includes(
        aggregateBy,
      )
    ) {
      setFilters([
        ...filters,
        {
          property: aggregateBy,
          value: row[aggToKeyMapExternalCosts[aggregateBy]],
        },
      ]);
      if (aggregateBy === "domain") {
        setAggregateBy("accountName");
      } else if (aggregateBy === "accountName") {
        setAggregateBy("resourceType");
      } else if (aggregateBy === "resourceType") {
        setAggregateBy("resourceName");
      } else {
        setShowModal(row);
      }
    }
  }

  React.useEffect(() => {
    setWindow(searchParams.get("window") || "7d");
    setAggregateBy(searchParams.get("agg") || "domain");
    setCurrency(searchParams.get("currency") || "USD");
    setCostType(searchParams.get("costType") || "blended");
    setSortBy(searchParams.get("sortBy") || "cost");
    setSortDirection(searchParams.get("sortDirection") || "desc");
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
    setTitle(generateTitle({ window, aggregateBy }));
  }, [window, aggregateBy, filters, costType, sortBy, sortDirection]);

  return (
    <Page active="cloud.html">
      {/* figure out if we need */}
      <PageHeader headerTitle="External Costs">
        <CarbonButton
          hasIconOnly
          renderIcon={Renew}
          iconDescription="Refresh"
          onClick={() => setFetch(true)}
          kind="ghost"
          size="md"
        />
      </PageHeader>
      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}
      {init && (
        <div
          id="cloud-cost"
          style={{
            backgroundColor: "var(--opencost-background)",
            padding: "2rem",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          <div style={{ padding: 0 }}>
            <div
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                flexFlow: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <Heading
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  {title}
                </Heading>
                <Subtitle report={{ window, aggregateBy }} />
              </div>
              <div style={{ flexShrink: 0 }}>
                <ExternalCostsControls
              costType={costType}
              setCostType={(type) => {
                searchParams.set("costType", type);
                navigate({
                  search: `?${searchParams.toString()}`,
                });
              }}
              window={window}
              setWindow={(win) => {
                searchParams.set("window", win);
                navigate({
                  search: `?${searchParams.toString()}`,
                });
              }}
              aggregateBy={aggregateBy}
              setAggregateBy={(agg) => {
                setFilters([]);
                searchParams.set("agg", agg);
                navigate({
                  search: `?${searchParams.toString()}`,
                });
              }}
                />
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ paddingTop: 100, paddingBottom: 100 }}>
                <InlineLoading description="Loading external costs..." status="active" />
              </div>
            </div>
          )}

          {!loading && (
            <>
              <ExternalCostsChart
                graphData={externalCostData}
                currency={"USD"}
                height={300}
                aggregateBy={aggregateBy}
              />
            </>
          )}
          <CarbonButton
            style={{ margin: ".5em" }}
            kind="secondary"
            onClick={() => setFilters([])}
          >
            Clear Filters
          </CarbonButton>
          {!loading && (
            <>
              <ExternalCostsTable
                tableData={externalCostTableData}
                aggregateBy={aggregateBy}
                drilldown={drilldown}
              />
            </>
          )}
          {showModal && (
            <ExternalCostDetails
              row={showModal}
              onClose={() => setShowModal(null)}
            />
          )}
        </div>
      )}
      <Footer />
    </Page>
  );
};

export default React.memo(ExternalCosts);
