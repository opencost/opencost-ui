import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";

import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";

import AssetsService from "../services/assets";
import {
  transformAssetsData,
  computeAssetTypeSummary,
  computeGrandTotal,
  filterAssetsByType,
  filterAssetsByCategory,
} from "../components/assets/assetUtils";
import AssetsSummaryTiles from "../components/assets/AssetsSummaryTiles";
import AssetsControls from "../components/assets/AssetsControls";
import AssetsChart from "../components/assets/AssetsChart";
import AssetsTable from "../components/assets/AssetsTable";
import AssetDetailPanel from "../components/assets/AssetDetailPanel";

import "../components/assets/carbonStyles.css";

const Assets = () => {
  const [rawData, setRawData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  const win = searchParams.get("window") || "7d";
  const typeFilter = searchParams.get("type") || "all";
  const categoryFilter = searchParams.get("category") || "all";

  // Transform and filter data
  const allAssets = useMemo(() => transformAssetsData(rawData), [rawData]);
  const filteredAssets = useMemo(() => {
    let result = filterAssetsByType(allAssets, typeFilter);
    result = filterAssetsByCategory(result, categoryFilter);
    return result;
  }, [allAssets, typeFilter, categoryFilter]);
  const typeSummary = useMemo(
    () => computeAssetTypeSummary(allAssets),
    [allAssets],
  );
  const grandTotal = useMemo(() => computeGrandTotal(allAssets), [allAssets]);

  useEffect(() => {
    fetchData();
  }, [win]);

  async function fetchData() {
    setLoading(true);
    setErrors([]);
    try {
      const resp = await AssetsService.fetchAssets(win);
      if (resp && resp.data) {
        setRawData(resp.data);
      } else {
        setRawData({});
      }
    } catch (err) {
      setErrors([
        {
          title: "Failed to load asset data",
          subtitle: err.message || "Please check your OpenCost backend.",
        },
      ]);
      setRawData({});
    }
    setLoading(false);
  }

  const updateParam = (key, value) => {
    searchParams.set(key, value);
    navigate({ search: `?${searchParams.toString()}` });
  };

  return (
    <Page active="/assets">
      <Header headerTitle="Assets">
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton aria-label="refresh" onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </div>
      </Header>

      <div className="carbon-assets-scope" style={{ marginTop: 16 }}>
        {!loading &&
          errors.length > 0 &&
          errors.map((e, i) => (
            <div key={i} className="assets-error">
              <div className="assets-error-title">{e.title}</div>
              <div className="assets-error-subtitle">{e.subtitle}</div>
            </div>
          ))}

        <AssetsControls
          window={win}
          setWindow={(v) => updateParam("window", v)}
          assetType={typeFilter}
          setAssetType={(v) => updateParam("type", v)}
          category={categoryFilter}
          setCategory={(v) => updateParam("category", v)}
        />

        {loading && (
          <div className="assets-loading">
            <CircularProgress />
          </div>
        )}

        {!loading && allAssets.length === 0 && errors.length === 0 && (
          <div className="assets-empty">
            <div className="assets-empty-title">No assets found</div>
            <div>
              Try changing the time range or check that the OpenCost backend is
              running.
            </div>
          </div>
        )}

        {!loading && allAssets.length > 0 && (
          <>
            <AssetsSummaryTiles
              typeSummary={typeSummary}
              grandTotal={grandTotal}
              totalCount={allAssets.length}
              activeType={typeFilter}
              onTypeClick={(t) => updateParam("type", t)}
            />
            <AssetsChart assets={filteredAssets} />
            <AssetsTable
              assets={filteredAssets}
              onRowClick={setSelectedAsset}
            />
          </>
        )}

        {selectedAsset && (
          <AssetDetailPanel
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
          />
        )}
      </div>
      <Footer />
    </Page>
  );
};

export default React.memo(Assets);
