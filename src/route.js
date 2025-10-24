import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Allocations from "./pages/Allocations.js";
import CloudCosts from "./pages/CloudCosts.js";
import ExternalCosts from "./pages/ExternalCosts.js";

const basename = (process.env.UI_PATH || "").replace(/\/+$/, "");

const Routes = () => {
  return (
    <Router basename={basename}>
      <Switch>
        <Route exact path="/">
          <Allocations />
        </Route>
        <Route exact path="/allocation">
          <Allocations />
        </Route>
        <Route exact path="/cloud">
          <CloudCosts />
        </Route>
        <Route exact path="/external-costs">
          <ExternalCosts />
        </Route>
      </Switch>
    </Router>
  );
};

export default Routes;
