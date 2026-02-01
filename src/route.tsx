import { BrowserRouter, Routes, Route } from "react-router";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Allocations from "./pages/Allocations.js";
import Assets from "./pages/Assets.js";
import CloudCosts from "./pages/CloudCosts.js";
import ExternalCosts from "./pages/ExternalCosts.js";

const basename = (process.env.UI_PATH || "").replace(/\/+$/, "");

const RouteSet = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Allocations />} />
          <Route path="/allocation" element={<Allocations />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/cloud" element={<CloudCosts />} />
          <Route path="/external-costs" element={<ExternalCosts />} />
        </Routes>
      </BrowserRouter>
    </LocalizationProvider>
  );
};

export default RouteSet;

