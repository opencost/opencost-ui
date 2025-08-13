import * as React from "react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import IconButton from "@material-ui/core/IconButton";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/styles";
import { Paper, Button } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

import { useLocation, useHistory } from "react-router";
import Warnings from "../components/Warnings";
import ExternalCostsService from "../services/externalCosts";

import {
  windowOptions,
  aggregationOptions,
  costTypeOptions,
} from "../components/externalCosts/tokens";
import { DEFAULT_CURRENCY } from "../constants/defaults";
import ExternalCostsControls from "../components/externalCosts/externalCostsControls";
import ExternalCostsChart from "../components/externalCosts/externalCostsChart";
import ExternalCostsTable from "../components/externalCosts/externalCostsTable";
import { aggToKeyMapExternalCosts } from "../components/externalCosts/tokens";
import { ExternalCostDetails } from "../components/externalCosts/externalCostDetailModal";

const ExternalCosts = () => {
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
  const [window, setWindow] = React.useState(windowOptions[0].value);
  const [costType, setCostType] = React.useState(costTypeOptions[0].value);
  const [sortBy, setSortBy] = React.useState("cost");
  const [sortDirection, setSortDirection] = React.useState("desc");
  const [aggregateBy, setAggregateBy] = React.useState(
    aggregationOptions[0].value
  );
  const [filters, setFilters] = React.useState([]);
  const [currency, setCurrency] = React.useState(DEFAULT_CURRENCY);

  // page and settings state
  const [init, setInit] = React.useState(false);
  const [fetch, setFetch] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);

  // data
  const [externalCostData, setExternalCostData] = React.useState([]);
  const [externalCostTableData, setExternalCostTableData] = React.useState([]);

  // parse any context information from the URL
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const routerHistory = useHistory();

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
        sortDirection
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
        sortDirection
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
        aggregateBy
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
    setCurrency(searchParams.get("currency") || DEFAULT_CURRENCY);
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
  }, [window, aggregateBy, filters, costType, sortBy, sortDirection]);

  return (
    <Page active="cloud.html">
      {/* figure out if we need */}
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
        <Paper id="cloud-cost">
          <div className={classes.reportHeader}>
            <ExternalCostsControls
              costType={costType}
              setCostType={(type) => {
                searchParams.set("costType", type);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
              window={window}
              setWindow={(win) => {
                searchParams.set("window", win);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
              aggregateBy={aggregateBy}
              setAggregateBy={(agg) => {
                setFilters([]);
                searchParams.set("agg", agg);
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
            <>
              <ExternalCostsChart
                graphData={externalCostData}
                currency={"USD"}
                height={300}
                aggregateBy={aggregateBy}
              />
            </>
          )}
          <Button
            style={{ margin: ".5em" }}
            variant="outlined"
            onClick={() => setFilters([])}
          >
            Clear Filters
          </Button>
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
        </Paper>
      )}
      <Footer />
    </Page>
  );
};

export default React.memo(ExternalCosts);
