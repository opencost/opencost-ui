import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Reports from "./pages/Allocations.js";
import CloudCosts from "./pages/CloudCosts.js";
import ExternalCosts from "./pages/ExternalCosts.js";
import Inference from "./pages/Inference.js";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Reports />
        </Route>
        <Route exact path="/allocation">
          <Reports />
        </Route>
        <Route exact path="/cloud">
          <CloudCosts />
        </Route>
        <Route exact path="/external-costs">
          <ExternalCosts />
        </Route>
        <Route exact path="/inference">
          <Inference />
        </Route>
      </Switch>
    </Router>
  );
};

export default Routes;
