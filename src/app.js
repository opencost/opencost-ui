import { createRoot } from "react-dom/client";
import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";
import Routes from "./route";

const root = createRoot(document.getElementById("app"));
root.render(<Routes />);
