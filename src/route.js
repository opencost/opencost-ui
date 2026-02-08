import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Content } from "@carbon/react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Allocations from "./pages/Allocations.js";
import CloudCosts from "./pages/CloudCosts.js";
import ExternalCosts from "./pages/ExternalCosts.js";
// Import your new Assets Page
import AssetsPage from "./components/Assets/AssetsPage";
import { SidebarNav } from "./components/Nav/SidebarNav";

import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";
import "./css/index.css"; 

const basename = (process.env.UI_PATH || "").replace(/\/+$/, "");

const RouteSet = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <BrowserRouter basename={basename}>
        
        {/* 1. Sidebar sits alone (It has fixed position by default) */}
        <SidebarNav />

        {/* 2. Content handles its own padding/margins automatically */}
        <Content id="main-content">
          <Routes>
            <Route exact path="/" element={<Allocations />} />
            <Route exact path="/allocation" element={<Allocations />} />
            <Route exact path="/cloud" element={<CloudCosts />} />
            <Route exact path="/external-costs" element={<ExternalCosts />} />
            
            {/* Your Asset Route */}
            <Route exact path="/assets" element={<AssetsPage />} />
          </Routes>
        </Content>

      </BrowserRouter>
    </LocalizationProvider>
  );
};

export default RouteSet;