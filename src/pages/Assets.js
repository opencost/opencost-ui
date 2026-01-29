import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { get, find } from "lodash";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import RefreshIcon from "@mui/icons-material/Refresh";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import AssetsService from "../services/assets";
import AssetsChart from "../components/assets/AssetsChart";
import AssetsTable from "../components/assets/AssetsTable";
import AssetsControls from "../components/assets/AssetsControls";
import { windowOptions, aggregationOptions } from "../components/assets/tokens";
import { checkCustomWindow, toVerboseTimeRange } from "../util";

// Generate title from report parameters
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
    "",
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

// Process assets response into array format
// OpenCost assets API returns: { code: 200, data: [ { "key": { name, type, cpuCost, ... }, ... } ] }
function processAssetsData(response) {
  console.log("Processing assets response:", response);

  if (!response) {
    console.warn("No response received");
    return { assets: [], totals: {} };
  }

  // Handle the OpenCost API response format
  // response = { code: 200, data: [...] } or just the data array
  let data = response.data || response;

  let assets = [];
  let totals = {
    cpuCost: 0,
    gpuCost: 0,
    ramCost: 0,
    totalCost: 0,
    adjustment: 0,
  };

  // Handle different response formats
  if (Array.isArray(data)) {
    // Each element in the array is a time period with assets as key-value pairs
    data.forEach((period) => {
      if (period && typeof period === "object") {
        Object.entries(period).forEach(([key, asset]) => {
          if (asset && typeof asset === "object") {
            // Use the key as name if name not present
            const assetWithName = {
              ...asset,
              name: asset.name || key.split("/").pop() || key,
            };
            assets.push(assetWithName);
            totals.cpuCost += asset.cpuCost || 0;
            totals.gpuCost += asset.gpuCost || 0;
            totals.ramCost += asset.ramCost || 0;
            totals.totalCost += asset.totalCost || 0;
            totals.adjustment += asset.adjustment || 0;
          }
        });
      }
    });
  } else if (typeof data === "object" && data !== null) {
    // Single period or accumulated data as object
    Object.entries(data).forEach(([key, asset]) => {
      if (asset && typeof asset === "object") {
        const assetWithName = {
          ...asset,
          name: asset.name || key.split("/").pop() || key,
        };
        assets.push(assetWithName);
        totals.cpuCost += asset.cpuCost || 0;
        totals.gpuCost += asset.gpuCost || 0;
        totals.ramCost += asset.ramCost || 0;
        totals.totalCost += asset.totalCost || 0;
        totals.adjustment += asset.adjustment || 0;
      }
    });
  }

  console.log("Processed assets:", assets.length, "items, totals:", totals);
  return { assets, totals };
}

const Assets = () => {
  // Data state
  const [assetData, setAssetData] = useState([]);
  const [totalData, setTotalData] = useState({});

  // Loading/error states
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  // URL-based state
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  const win = searchParams.get("window") || "7d";
  const aggregateBy = searchParams.get("agg") || "type";
  const accumulate = searchParams.get("acc") !== "false";
  const currency = searchParams.get("currency") || "USD";
  const title =
    searchParams.get("title") ||
    generateTitle({ window: win, aggregateBy, accumulate });

  // Update URL params
  const setWindow = (value) => {
    searchParams.set("window", value);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const setAggregateBy = (value) => {
    searchParams.set("agg", value);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const setAccumulate = (value) => {
    searchParams.set("acc", String(value));
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const setCurrency = (value) => {
    searchParams.set("currency", value);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const response = await AssetsService.fetchAssets(win, aggregateBy, {
        accumulate,
        filters: [],
      });

      const { assets, totals } = processAssetsData(response);
      setAssetData(assets);
      setTotalData(totals);

      if (assets.length === 0) {
        setErrors([
          {
            primary: "No assets data available",
            secondary:
              "The OpenCost backend returned no assets. This may be because no assets have been recorded yet, or the backend does not support the /assets endpoint.",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);

      let errorMessage =
        "Please open an Issue with OpenCost if problems persist.";
      if (err.message) {
        if (err.message.includes("404")) {
          errorMessage =
            "Assets data is not available. Please check your OpenCost configuration.";
        } else if (err.message.includes("Network Error")) {
          errorMessage =
            "Unable to connect to OpenCost backend. Please check your connection.";
        } else {
          errorMessage = err.message;
        }
      }

      setErrors([
        {
          primary: "Failed to load assets data",
          secondary: errorMessage,
        },
      ]);
      setAssetData([]);
      setTotalData({});
    }

    setLoading(false);
  };

  // Fetch on mount and when params change
  useEffect(() => {
    fetchData();
  }, [win, aggregateBy, accumulate]);

  // Drilldown handler
  const drilldown = (row) => {
    // Navigate to more specific aggregation based on current
    const drilldownMap = {
      cluster: "node",
      category: "type",
      type: "node",
      provider: "account",
      account: "project",
    };

    const nextAgg = drilldownMap[aggregateBy];
    if (nextAgg) {
      searchParams.set("agg", nextAgg);
      // Could add filter here based on row.name
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  };

  return (
    <Page>
      <Header headerTitle="Assets">
        <AssetsControls
          window={win}
          setWindow={setWindow}
          aggregateBy={aggregateBy}
          setAggregateBy={setAggregateBy}
          accumulate={accumulate}
          setAccumulate={setAccumulate}
          currency={currency}
          setCurrency={setCurrency}
        />
        <IconButton onClick={fetchData} aria-label="refresh">
          <RefreshIcon />
        </IconButton>
      </Header>

        <Subtitle report={{ window: win, aggregateBy }} />

        {errors.length > 0 && <Warnings warnings={errors} />}

        <Paper
          elevation={2}
          sx={{
            marginTop: 2,
            padding: 2,
            display: "flex",
            flexFlow: "column",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <CircularProgress />
            </div>
          ) : (
            <>
              <AssetsChart
                assetData={assetData}
                currency={currency}
                height={300}
                n={10}
              />
              <AssetsTable
                assetData={assetData}
                totalData={totalData}
                currency={currency}
                drilldown={drilldown}
              />
            </>
          )}
        </Paper>

        <Footer />
    </Page>
  );
};

export default Assets;
