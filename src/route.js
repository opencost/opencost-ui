import { BrowserRouter, Routes, Route } from "react-router";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Allocations from "./pages/Allocations.js";
import CloudCosts from "./pages/CloudCosts.js";
import ExternalCosts from "./pages/ExternalCosts.js";
import Assets from "./pages/Assets.js";

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
          <Route exact path="/assets" element={<Assets />} />
        </Routes>
      </BrowserRouter>
    </LocalizationProvider>
  );
};

export default RouteSet;
