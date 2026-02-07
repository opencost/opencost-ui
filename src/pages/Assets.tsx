import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { get, find } from "lodash";
import { Button, Tile, InlineNotification, Toggle, Dropdown } from "@carbon/react";
import { Renew, Download } from "@carbon/icons-react";
import Page from "../components/Page";
import PageSkeleton from "../components/PageSkeleton";
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
import { useGlobalEvent } from "../services/eventBus";
import { AssetData, TotalData, ErrorItem } from "../types/assets";

interface AssetsAPIResponse {
  data?: AssetRecord[] | AssetRecord;
  isMock?: boolean;
}

interface AssetRecord {
  [key: string]: AssetData;
}

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
    ""
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

function processAssetsData(response: AssetsAPIResponse | AssetRecord[] | null): {
  assets: AssetData[];
  totals: TotalData;
  isMock: boolean;
} {
  if (!response) {
    return {
      assets: [],
      totals: {
        cpuCost: 0,
        gpuCost: 0,
        ramCost: 0,
        totalCost: 0,
        adjustment: 0,
      },
      isMock: false,
    };
  }

  const isMock = (response as AssetsAPIResponse).isMock || false;
  const data = (response as AssetsAPIResponse).data || response;
  const assets: AssetData[] = [];
  const totals: TotalData = {
    cpuCost: 0,
    gpuCost: 0,
    ramCost: 0,
    totalCost: 0,
    adjustment: 0,
  };

  const processAsset = (key: string, asset: AssetData) => {
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
    (data as AssetRecord[]).forEach((period: AssetRecord) => {
      if (period && typeof period === "object") {
        Object.entries(period).forEach(([key, asset]) => processAsset(key, asset));
      }
    });
  } else if (typeof data === "object" && data !== null) {
    Object.entries(data).forEach(([key, asset]) => processAsset(key, asset));
  }

  return { assets, totals, isMock };
}

const Assets: React.FC = () => {
  const [assetData, setAssetData] = useState<AssetData[]>([]);
  const [totalData, setTotalData] = useState<TotalData>({
    cpuCost: 0,
    gpuCost: 0,
    ramCost: 0,
    totalCost: 0,
    adjustment: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [isMockData, setIsMockData] = useState(false);
  const [showVisualizations, setShowVisualizations] = useState(true);

  // URL-based state
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  const win = searchParams.get("window") || "7d";
  const aggregateBy = searchParams.get("agg") || "type";
  const accumulate = searchParams.get("acc") !== "false";
  const currency = searchParams.get("currency") || "USD";
  const title =
    searchParams.get("title") || generateTitle({ window: win, aggregateBy, accumulate });

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

  const fetchData = async () => {
    setLoading(true);
    setErrors([]);
    setIsMockData(false);

    try {
      const response = await AssetsService.fetchAssets(win, aggregateBy, {
        accumulate,
        filters: [],
      });

      const { assets, totals, isMock } = processAssetsData(response);
      setAssetData(assets);
      setTotalData(totals);
      setIsMockData(isMock || false);

      if (assets.length === 0) {
        setErrors([
          {
            primary: "No assets data available",
            secondary:
              "The OpenCost backend returned no assets. This may be because no assets have been recorded yet, or the backend does not support the /assets endpoint.",
          },
        ]);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to fetch assets:", error);

      let errorMessage = "Please open an Issue with OpenCost if problems persist.";
      if (error.message) {
        if (error.message.includes("404")) {
          errorMessage = "Assets data is not available. Please check your OpenCost configuration.";
        } else if (error.message.includes("Network Error")) {
          errorMessage = "Unable to connect to OpenCost backend. Please check your connection.";
        } else {
          errorMessage = error.message;
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

  useEffect(() => {
    fetchData();
  }, [win, aggregateBy, accumulate]);

  useGlobalEvent("refresh", fetchData);

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

  const exportToCSV = () => {
    const headers = ["Name", "Type", "CPU Cost", "GPU Cost", "RAM Cost", "Total Cost"];
    const rows = assetData.map((asset) => [
      asset.name || "",
      asset.type || "",
      asset.cpuCost || 0,
      asset.gpuCost || 0,
      asset.ramCost || 0,
      asset.totalCost || 0,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const today = new Date().toISOString().split("T")[0];
    link.download = `assets_${aggregateBy}_${win}_${today}.csv`;
    link.click();
  };

  return (
    <Page>
      <Header headerTitle="Assets">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              height: "100%",
              cursor: "pointer",
              padding: "0.5rem 0.5rem",
              borderRadius: "var(--radius-xs)",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onClick={() => setShowVisualizations(!showVisualizations)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowVisualizations(!showVisualizations);
              }
            }}
          >
            <span
              style={{
                fontSize: "1rem",
                paddingLeft: "0.25rem",
                userSelect: "none",
              }}
            >
              {" "}
              Visualization
            </span>
            <div style={{ marginTop: "0.25rem" }}>
              <Toggle
                id="show-visualizations-toggle"
                size="sm"
                labelA="Charts Off"
                labelB="Charts On"
                toggled={showVisualizations}
                onToggle={(checked) => {
                  setShowVisualizations(checked);
                }}
                hideLabel
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={() => <Download size={20} />}
            iconDescription="Export as CSV"
            onClick={exportToCSV}
            hasIconOnly
            tooltipPosition="bottom"
          />
          <Button
            kind="ghost"
            size="sm"
            renderIcon={() => <Renew size={20} />}
            iconDescription="Refresh (R)"
            onClick={fetchData}
            hasIconOnly
            tooltipPosition="bottom"
          />
        </div>
      </Header>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{title}</h3>
          <Subtitle report={{ window: win, aggregateBy }} />
        </div>
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
      </div>

      {errors.length > 0 && <Warnings warnings={errors} />}

      {isMockData && (
        <InlineNotification
          kind="info"
          title="Demo Mode"
          subtitle="Displaying sample data. The OpenCost backend is unavailable or returned an error."
          lowContrast
          style={{ marginBottom: "1rem" }}
        />
      )}

      <div style={{}}>
        {loading ? (
          <PageSkeleton type="dashboard" rows={8} />
        ) : (
          <>
            {showVisualizations && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <Tile>
                    <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                      <h3
                        style={{
                          fontWeight: 700,
                          color: "#ff0044",
                          margin: 0,
                        }}
                      >
                        {toCurrency(totalData.totalCost, currency, 2)}
                      </h3>
                      <p
                        style={{
                          color: "var(--cds-text-secondary)",
                          fontSize: "1rem",
                          fontWeight: 600,
                          marginTop: "0.25rem",
                        }}
                      >
                        Total Cost
                      </p>
                    </div>
                  </Tile>
                  <Tile>
                    <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                      <h3 style={{ fontWeight: 700, color: "#0f62fe", margin: 0 }}>
                        {toCurrency(totalData.cpuCost, currency, 2)}
                      </h3>
                      <p
                        style={{
                          color: "var(--cds-text-secondary)",
                          fontSize: "1rem",
                          marginTop: "0.25rem",
                          fontWeight: 600,
                        }}
                      >
                        CPU Cost
                      </p>
                    </div>
                  </Tile>
                  <Tile>
                    <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                      <h3 style={{ fontWeight: 700, color: "#8a3ffc", margin: 0 }}>
                        {toCurrency(totalData.ramCost, currency, 2)}
                      </h3>
                      <p
                        style={{
                          color: "var(--cds-text-secondary)",
                          fontSize: "1rem",
                          marginTop: "0.25rem",
                          fontWeight: 600,
                        }}
                      >
                        RAM Cost
                      </p>
                    </div>
                  </Tile>
                  <Tile>
                    <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                      <h3 style={{ fontWeight: 700, color: "#00cc00", margin: 0 }}>
                        {toCurrency(totalData.gpuCost, currency, 2)}
                      </h3>
                      <p
                        style={{
                          color: "var(--cds-text-secondary)",
                          fontSize: "1rem",
                          marginTop: "0.25rem",
                          fontWeight: 600,
                        }}
                      >
                        GPU Cost
                      </p>
                    </div>
                  </Tile>
                  <Tile>
                    <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                      <h3
                        style={{
                          fontWeight: 700,
                          color: "var(--cds-text-primary)",
                          margin: 0,
                        }}
                      >
                        {assetData.length}
                      </h3>
                      <p
                        style={{
                          color: "var(--cds-text-secondary)",
                          fontSize: "1rem",
                          marginTop: "0.25rem",
                          fontWeight: 600,
                        }}
                      >
                        Total Assets
                      </p>
                    </div>
                  </Tile>
                </div>

                <Tile style={{ marginBottom: "1.5rem" }}>
                  <div style={{ padding: "1rem" }}>
                    <AssetsChart assetData={assetData} currency={currency} height={350} n={10} />
                  </div>
                </Tile>
              </>
            )}

            <Tile>
              <div style={{ padding: "0.5rem" }}>
                <AssetsTable
                  assetData={assetData}
                  totalData={totalData}
                  currency={currency}
                  drilldown={drilldown}
                />
              </div>
            </Tile>
          </>
        )}
      </div>

      <Footer />
    </Page>
  );
};

export default Assets;
