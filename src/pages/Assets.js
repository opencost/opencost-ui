import React, { useEffect, useState } from "react";
import { CircularProgress, Paper, Typography } from "@mui/material";
import Header from "../components/Header";
import Page from "../components/Page";
import Footer from "../components/Footer";
import AssetService from "../services/assets";
import AssetReport from "../components/AssetReport";

const Assets = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    AssetService.fetchAssets("7d", false)
      .then((res) => setData(res.data || res || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page active="assets">
      <Header headerTitle="Assets" />
      <Paper sx={{ p: 3, m: 2, minHeight: 400 }}>
        <Typography variant="h5" gutterBottom>
          Asset Costs
        </Typography>
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 40 }}
          >
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <AssetReport assets={data} />
        )}
      </Paper>
      <Footer />
    </Page>
  );
};

export default Assets;
