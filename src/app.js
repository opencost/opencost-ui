import { createRoot } from "react-dom/client";
import Routes from "./route";
import "@carbon/styles/css/styles.css";

const root = createRoot(document.getElementById("app"));
root.render(<Routes />);
