import * as React from "react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Paper, Typography } from "@mui/material";

const Assets = () => {
  return (
    <Page active="assets.html">
      <Header headerTitle="Assets" />
      <Paper style={{ padding: 24 }}>
        <Typography variant="h5">Assets</Typography>
        <Typography variant="body2" style={{ marginTop: 8 }}>
          Infrastructure assets and their associated costs.
        </Typography>
        <Typography variant="body1" style={{ marginTop: 24 }}>
          Assets page placeholder. Assets API integration will be added next.
        </Typography>
      </Paper>
      <Footer />
    </Page>
  );
};

export default React.memo(Assets);
