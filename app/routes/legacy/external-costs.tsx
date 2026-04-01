import * as React from "react";
import Page from "~/components/legacy/Page";
import Header from "~/components/legacy/Header";
import Footer from "~/components/legacy/Footer";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Paper, Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

import { useLocation, useNavigate } from "react-router";
import Warnings from "~/components/legacy/Warnings";
import ExternalCostsService from "~/services/external-costs";

import {
  windowOptions,
  aggregationOptions,
  costTypeOptions,
} from "~/components/legacy/externalCosts/tokens";
import ExternalCostsControls from "~/components/legacy/externalCosts/externalCostsControls";
import ExternalCostsChart from "~/components/legacy/externalCosts/externalCostsChart";
import ExternalCostsTable from "~/components/legacy/externalCosts/externalCostsTable";
import { aggToKeyMapExternalCosts } from "~/components/legacy/externalCosts/tokens";
import { ExternalCostDetails } from "~/components/legacy/externalCosts/externalCostDetailModal";

export function meta() {
  return [{ title: "OpenCost — External Costs" }];
}

const ExternalCosts = () => {
  const [window, setWindow] = React.useState(windowOptions[0].value);
  const [costType, setCostType] = React.useState(costTypeOptions[0].value);
  const [sortBy, setSortBy] = React.useState("cost");
  const [sortDirection, setSortDirection] = React.useState("desc");
  const [aggregateBy, setAggregateBy] = React.useState(
    aggregationOptions[0].value,
  );
  const [filters, setFilters] = React.useState([]);
  const [currency, setCurrency] = React.useState("USD");

  const [init, setInit] = React.useState(false);
  const [fetch, setFetch] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);

  const [externalCostData, setExternalCostData] = React.useState([]);
  const [externalCostTableData, setExternalCostTableData] = React.useState([]);

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
      if (resp) setExternalCostData(resp);
      else setExternalCostData([]);
    } catch (err) {
      console.log(err);
      setErrors([
        {
          primary: "Failed to load report data",
          secondary:
            err.message ||
            "Please open an Issue with OpenCost if problems persist.",
        },
      ]);
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
      if (resp) setExternalCostTableData(resp);
      else setExternalCostTableData([]);
    } catch (err) {
      console.log(err);
      setErrors([
        {
          primary: "Failed to load report data",
          secondary:
            err.message ||
            "Please open an Issue with OpenCost if problems persist.",
        },
      ]);
      setExternalCostTableData([]);
    }
  }

  async function fetchData() {
    setLoading(true);
    setErrors([]);
    await fetchChartData();
    await fetchTableData();
    setLoading(false);
  }

  function drilldown(row) {
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
      if (aggregateBy === "domain") setAggregateBy("accountName");
      else if (aggregateBy === "accountName") setAggregateBy("resourceType");
      else if (aggregateBy === "resourceType") setAggregateBy("resourceName");
      else setShowModal(row);
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

  React.useEffect(() => {
    if (!init) initialize();
    if (init || fetch) fetchData();
  }, [init, fetch]);

  React.useEffect(() => {
    setFetch(!fetch);
  }, [window, aggregateBy, filters, costType, sortBy, sortDirection]);

  return (
    <Page active="cloud.html">
      <Header headerTitle="External Costs">
        <IconButton
          aria-label="refresh"
          onClick={() => setFetch(true)}
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
      {init && (
        <Paper id="cloud-cost">
          <div style={{ display: "flex", flexFlow: "row", padding: 24 }}>
            <ExternalCostsControls
              costType={costType}
              setCostType={(type) => {
                searchParams.set("costType", type);
                navigate({ search: `?${searchParams.toString()}` });
              }}
              window={window}
              setWindow={(win) => {
                searchParams.set("window", win);
                navigate({ search: `?${searchParams.toString()}` });
              }}
              aggregateBy={aggregateBy}
              setAggregateBy={(agg) => {
                setFilters([]);
                searchParams.set("agg", agg);
                navigate({ search: `?${searchParams.toString()}` });
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
            <ExternalCostsChart
              graphData={externalCostData}
              currency={"USD"}
              height={300}
              aggregateBy={aggregateBy}
            />
          )}
          <Button
            style={{ margin: ".5em" }}
            variant="outlined"
            onClick={() => setFilters([])}
          >
            Clear Filters
          </Button>
          {!loading && (
            <ExternalCostsTable
              tableData={externalCostTableData}
              aggregateBy={aggregateBy}
              drilldown={drilldown}
            />
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
