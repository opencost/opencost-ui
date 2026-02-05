import "@carbon/styles/css/styles.css";
import { createRoot } from "react-dom/client";
import Routes from "./route";

const root = createRoot(document.getElementById("app"));
root.render(<Routes />);
