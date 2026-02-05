import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CircularProgress } from "@mui/material";

import Allocations from "./pages/Allocations.js";
import CloudCosts from "./pages/CloudCosts.js";
import ExternalCosts from "./pages/ExternalCosts.js";

const Assets = lazy(() => import("./pages/Assets.js"));

const basename = (process.env.UI_PATH || "").replace(/\/+$/, "");

const RouteSet = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route exact path="/" element={<Allocations />} />
          <Route exact path="/allocation" element={<Allocations />} />
          <Route exact path="/cloud" element={<CloudCosts />} />
          <Route exact path="/external-costs" element={<ExternalCosts />} />
          <Route
            exact
            path="/assets"
            element={
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}><CircularProgress /></div>}>
                <Assets />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </LocalizationProvider>
  );
};

export default RouteSet;
