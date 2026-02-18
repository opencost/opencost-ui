import { createRoot } from "react-dom/client";
import Routes from "./route";
import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";
import "./css/global.scss";

const root = createRoot(document.getElementById("app"));
root.render(<Routes />);
