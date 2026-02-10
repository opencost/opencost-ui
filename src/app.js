import { createRoot } from "react-dom/client";
import Routes from "./route";

// ✅ Carbon styles (correct packages)
import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";

// ✅ Your app styles
import "./css/global.scss";

const root = createRoot(document.getElementById("app"));
root.render(<Routes />);
