import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { get, find } from "lodash";
import { Loading, Button, Tile } from "@carbon/react";
import { Renew } from "@carbon/icons-react";
import { Box, Typography, Divider } from "@mui/material";
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
import { checkCustomWindow, toVerboseTimeRange, toCurrency } from "../util";

interface AssetData {
  name?: string;
  type?: string;
  cpuCost?: number;
  gpuCost?: number;
  ramCost?: number;
  adjustment?: number;
  totalCost?: number;
}

interface TotalData {
  cpuCost: number;
  gpuCost: number;
  ramCost: number;
  totalCost: number;
  adjustment: number;
}

interface ErrorItem {
  primary: string;
  secondary: string;
}

// Generate title from report parameters
function generateTitle({
  window,
  aggregateBy,
  accumulate,
}: {
  window: string;
  aggregateBy: string;
  accumulate: boolean;
}): string {
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
function processAssetsData(response: any): {
  assets: AssetData[];
  totals: TotalData;
} {
  console.log("Processing assets response:", response);

  if (!response) {
    console.warn("No response received");
    return {
      assets: [],
      totals: {
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 0,
        adjustment: 0,
      },
    };
  }

  const data = response.data || response;
  const assets: AssetData[] = [];
  const totals: TotalData = {
    cpuCost: 0,
    gpuCost: 0,
    ramCost: 0,
    totalCost: 0,
    adjustment: 0,
  };

  const processAsset = (key: string, asset: any) => {
    if (asset && typeof asset === "object") {
      const assetWithName: AssetData = {
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
  };

  if (Array.isArray(data)) {
    data.forEach((period: any) => {
      if (period && typeof period === "object") {
        Object.entries(period).forEach(([key, asset]) =>
          processAsset(key, asset),
        );
      }
    });
  } else if (typeof data === "object" && data !== null) {
    Object.entries(data).forEach(([key, asset]) => processAsset(key, asset));
  }

  console.log("Processed assets:", assets.length, "items, totals:", totals);
  return { assets, totals };
}

const Assets: React.FC = () => {
  // Data state
  const [assetData, setAssetData] = useState<AssetData[]>([]);
  const [totalData, setTotalData] = useState<TotalData>({
    cpuCost: 0,
    gpuCost: 0,
    ramCost: 0,
    totalCost: 0,
    adjustment: 0,
  });

  // Loading/error states
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ErrorItem[]>([]);

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
  const setWindow = (value: string) => {
    searchParams.set("window", value);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const setAggregateBy = (value: string) => {
    searchParams.set("agg", value);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const setAccumulate = (value: boolean) => {
    searchParams.set("acc", String(value));
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const setCurrency = (value: string) => {
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
    } catch (err: any) {
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
      setTotalData({
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 0,
        adjustment: 0,
      });
    }

    setLoading(false);
  };

  // Fetch on mount and when params change
  useEffect(() => {
    fetchData();
  }, [win, aggregateBy, accumulate]);

  // Drilldown handler
  const drilldown = (row: AssetData) => {
    const drilldownMap: Record<string, string> = {
      cluster: "node",
      category: "type",
      type: "node",
      provider: "account",
      account: "project",
    };

    const nextAgg = drilldownMap[aggregateBy];
    if (nextAgg) {
      searchParams.set("agg", nextAgg);
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  };

  return (
    <Page>
      <Header headerTitle="Assets">
        <div style={{ display: "flex", alignItems: "center" }}>
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
          <Button
            kind="ghost"
            renderIcon={() => <Renew size={24} />}
            iconDescription="Refresh"
            onClick={fetchData}
            hasIconOnly
            tooltipPosition="bottom"
          />
        </div>
      </Header>

      {errors.length > 0 && <Warnings warnings={errors} />}

      {/* Main Content */}
      <Box sx={{ mt: 3 }}>
        {loading ? (
          <Tile>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
                gap: 2,
              }}
            >
              <Loading
                description="Loading assets data..."
                withOverlay={false}
              />
              <Typography variant="body2" color="text.secondary">
                Fetching asset information...
              </Typography>
            </Box>
          </Tile>
        ) : (
          <>
            {/* Summary Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
                mb: 3,
              }}
            >
              <Tile>
                <Box sx={{ textAlign: "center", py: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 600, color: "var(--cds-text-primary)" }}
                  >
                    {toCurrency(totalData.totalCost, currency, 2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Total Cost
                  </Typography>
                </Box>
              </Tile>
              <Tile>
                <Box sx={{ textAlign: "center", py: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 600, color: "#0f62fe" }}
                  >
                    {toCurrency(totalData.cpuCost, currency, 2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    CPU Cost
                  </Typography>
                </Box>
              </Tile>
              <Tile>
                <Box sx={{ textAlign: "center", py: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 600, color: "#8a3ffc" }}
                  >
                    {toCurrency(totalData.ramCost, currency, 2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    RAM Cost
                  </Typography>
                </Box>
              </Tile>
              <Tile>
                <Box sx={{ textAlign: "center", py: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 600, color: "#009d9a" }}
                  >
                    {toCurrency(totalData.gpuCost, currency, 2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    GPU Cost
                  </Typography>
                </Box>
              </Tile>
              <Tile>
                <Box sx={{ textAlign: "center", py: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 600, color: "var(--cds-text-primary)" }}
                  >
                    {assetData.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Total Assets
                  </Typography>
                </Box>
              </Tile>
            </Box>

            {/* Chart Section */}
            <Tile style={{ marginBottom: "1.5rem" }}>
              <Box sx={{ p: 2 }}>
                <AssetsChart
                  assetData={assetData}
                  currency={currency}
                  height={350}
                  n={10}
                />
              </Box>
            </Tile>

            {/* Table Section */}
            <Tile>
              <Box sx={{ p: 2 }}>
                <AssetsTable
                  assetData={assetData}
                  totalData={totalData}
                  currency={currency}
                  drilldown={drilldown}
                />
              </Box>
            </Tile>
          </>
        )}
      </Box>

      <Footer />
    </Page>
  );
};

export default Assets;
