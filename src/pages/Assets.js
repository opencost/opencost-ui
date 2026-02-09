import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import IconButton from "@mui/material/IconButton";
import { Renew } from "@carbon/icons-react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Warnings from "../components/Warnings";
import AssetsService from "../services/assets";

import {
  AssetsSummaryTiles,
  AssetsCostBreakdown,
  AssetsFilters,
  AssetsDataTable,
  AssetsSkeleton,
} from "../components/assets";

import "../components/assets/assets.css";

const Assets = () => {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [rawAssets, setRawAssets] = useState({});
  const [assetTypeOptions, setAssetTypeOptions] = useState([]);

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  const window = searchParams.get("window") || "7d";
  const assetType = searchParams.get("type") || "all";
  const currency = searchParams.get("currency") || "USD";

  const setWindow = (win) => {
    searchParams.set("window", win);
    navigate({ search: `?${searchParams.toString()}` });
  };

  const setAssetType = (type) => {
    searchParams.set("type", type);
    navigate({ search: `?${searchParams.toString()}` });
  };

  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      const resp = await AssetsService.fetchAssets(window);

      if (resp && resp.data) {
        const assetsData = resp.data;
        setRawAssets(assetsData);

        const types = new Set();
        Object.values(assetsData).forEach((asset) => {
          if (asset.type) {
            types.add(asset.type);
          }
        });
        setAssetTypeOptions(Array.from(types).sort());
      } else {
        setRawAssets({});
        setAssetTypeOptions([]);
      }
    } catch (err) {
      if (err.message && err.message.indexOf("404") === 0) {
        setErrors([
          {
            primary: "Assets API not available",
            secondary:
              "Please ensure your OpenCost instance supports the Assets API.",
          },
        ]);
      } else {
        setErrors([
          {
            primary: "Failed to load assets data",
            secondary: err.message || "Please try again later.",
          },
        ]);
      }
      setRawAssets({});
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [window]);

  const processedAssets = useMemo(() => {
    const assets = [];

    Object.entries(rawAssets).forEach(([key, asset]) => {
      if (!asset || !asset.properties) return;

      const props = asset.properties;
      assets.push({
        key,
        name: props.name || key,
        type: asset.type || "Unknown",
        provider: props.provider || "-",
        cluster: props.cluster || "-",
        category: props.category || "-",
        cpuCores: asset.cpuCores || null,
        ramBytes: asset.ramBytes || null,
        totalCost: asset.totalCost || 0,
      });
    });

    if (assetType !== "all") {
      return assets.filter((a) => a.type === assetType);
    }
    return assets;
  }, [rawAssets, assetType]);

  const summaryMetrics = useMemo(() => {
    const totalAssets = processedAssets.length;
    const totalCost = processedAssets.reduce((sum, a) => sum + a.totalCost, 0);
    const types = new Set(processedAssets.map((a) => a.type));
    const assetTypesCount = types.size;
    const avgCost = totalAssets > 0 ? totalCost / totalAssets : 0;

    return { totalAssets, totalCost, assetTypesCount, avgCost };
  }, [processedAssets]);

  const costByType = useMemo(() => {
    const costs = {};
    processedAssets.forEach((asset) => {
      costs[asset.type] = (costs[asset.type] || 0) + asset.totalCost;
    });
    return costs;
  }, [processedAssets]);

  return (
    <Page active="/assets" className="assets-page-zoom">
      <Header headerTitle="Assets">
        <IconButton
          aria-label="refresh"
          className="assets-refresh-btn"
          onClick={() => fetchData()}
          style={{ padding: 12 }}
        >
          <Renew size={20} />
        </IconButton>
      </Header>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}

      <Paper id="assets" style={{ padding: 24, backgroundColor: "#f5f5f5" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <Typography variant="h5">Infrastructure Assets</Typography>
            <Typography variant="body2" color="textSecondary">
              {window === "7d"
                ? "Last 7 days"
                : window === "14d"
                  ? "Last 14 days"
                  : window === "30d"
                    ? "Last 30 days"
                    : window}
            </Typography>
          </div>
          <AssetsFilters
            window={window}
            setWindow={setWindow}
            assetType={assetType}
            setAssetType={setAssetType}
            assetTypeOptions={assetTypeOptions}
          />
        </div>

        {loading && <AssetsSkeleton />}

        {!loading && processedAssets.length === 0 && errors.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Typography variant="h6" color="textSecondary">
              No assets found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              No infrastructure assets were found for the selected time window.
            </Typography>
          </div>
        )}

        {!loading && processedAssets.length > 0 && (
          <>
            <AssetsSummaryTiles
              assets={summaryMetrics.totalAssets}
              totalCost={summaryMetrics.totalCost}
              assetTypes={summaryMetrics.assetTypesCount}
              avgCost={summaryMetrics.avgCost}
              currency={currency}
            />

            <div className="assets-cost-section">
              <Typography variant="h6" style={{ marginBottom: 16 }}>
                Cost by asset type
              </Typography>
              <AssetsCostBreakdown
                costByType={costByType}
                totalCost={summaryMetrics.totalCost}
                currency={currency}
              />
            </div>

            <div style={{ marginTop: 32 }}>
              <AssetsDataTable assets={processedAssets} currency={currency} />
            </div>
          </>
        )}
      </Paper>

      <Footer />
    </Page>
  );
};

export default React.memo(Assets);
