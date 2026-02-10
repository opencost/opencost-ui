import { BrowserRouter, Routes, Route } from "react-router";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Theme } from "@carbon/react";
import { ThemeProvider, useThemeMode } from "./context/ThemeContext";

import Allocations from "./pages/Allocations.js";
import CloudCosts from "./pages/CloudCosts.js";
import ExternalCosts from "./pages/ExternalCosts.js";
import Assets from "./pages/Assets.js";

const basename = (process.env.UI_PATH || "").replace(/\/+$/, "");

const ThemedApp = () => {
  const { theme } = useThemeMode();

  return (
    <Theme
      theme={theme}
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: "100vh",
      }}
    >
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Allocations />} />
          <Route path="/allocation" element={<Allocations />} />
          <Route path="/cloud" element={<CloudCosts />} />
          <Route path="/external-costs" element={<ExternalCosts />} />
          <Route path="/assets" element={<Assets />} />
        </Routes>
      </BrowserRouter>
    </Theme>
  );
};

const RouteSet = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default RouteSet;
