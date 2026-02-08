import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";

import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Warnings from "../components/Warnings";
import AssetsService from "../services/assets";
import AssetsControls from "../components/assets/AssetsControls";
import AssetsChart from "../components/assets/AssetsChart";
import AssetsTable from "../components/assets/AssetsTable";
import { windowOptions, aggregationOptions } from "../components/assets/tokens";
import { currencyCodes } from "../constants/currencyCodes";

const Assets = () => {
  const [window, setWindow] = useState(windowOptions[0].value);
  const [aggregateBy, setAggregateBy] = useState(aggregationOptions[0].value);
  const [currency, setCurrency] = useState("USD");
  const [accumulate, setAccumulate] = useState(true);

  const [init, setInit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [assetsData, setAssetsData] = useState([]);

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  async function initialize() {
    const urlWindow = searchParams.get("window");
    const urlAggregate = searchParams.get("aggregate");
    const urlCurrency = searchParams.get("currency");

    if (urlWindow) setWindow(urlWindow);
    if (urlAggregate) setAggregateBy(urlAggregate);
    if (urlCurrency) setCurrency(urlCurrency);

    setInit(true);
  }

  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      const resp = await AssetsService.fetchAssets(
        window,
        aggregateBy,
        accumulate
      );

      if (resp && resp.data) {
        setAssetsData(resp.data);
      } else {
        setErrors([
          {
            primary: "No data available",
            secondary: "The Assets API returned no data for the selected window",
          },
        ]);
      }
    } catch (error) {
      setErrors([
        {
          primary: "Failed to fetch assets data",
          secondary: error.message || "An unknown error occurred",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!init) {
      initialize();
    }
  }, [init]);

  useEffect(() => {
    if (init) {
      const params = new URLSearchParams();
      params.set("window", window);
      params.set("aggregate", aggregateBy);
      params.set("currency", currency);
      navigate(`?${params.toString()}`, { replace: true });
      fetchData();
    }
  }, [init, window, aggregateBy, currency]);

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <Page>
      <Header headerTitle="Assets">
        <IconButton
          aria-label="refresh"
          onClick={handleRefresh}
          disabled={loading}
          style={{ padding: 12 }}
        >
          <RefreshIcon />
        </IconButton>
      </Header>

      <div style={{ padding: "1.5rem" }}>
        <AssetsControls
          window={window}
          setWindow={setWindow}
          aggregateBy={aggregateBy}
          setAggregateBy={setAggregateBy}
        />

        {errors.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <Warnings warnings={errors} />
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <AssetsChart assetsData={assetsData} currency={currency} aggregateBy={aggregateBy} />
            
            <AssetsTable
              assetsData={assetsData}
              currency={currency}
              aggregateBy={aggregateBy}
            />
          </>
        )}
      </div>

      <Footer />
    </Page>
  );
};

export default Assets;
