import { BrowserRouter, Routes, Route } from "react-router";

import ErrorBoundary from "./components/ErrorBoundary";
import Allocations from "./pages/Allocations.js";
import Assets from "./pages/Assets.js";
import CloudCosts from "./pages/CloudCosts.js";
import ExternalCosts from "./pages/ExternalCosts.js";

const basename = (process.env.UI_PATH || "").replace(/\/+$/, "");

const RouteSet = () => {
  return (
    <BrowserRouter basename={basename}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Allocations />} />
          <Route path="/allocation" element={<Allocations />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/cloud" element={<CloudCosts />} />
          <Route path="/external-costs" element={<ExternalCosts />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default RouteSet;

