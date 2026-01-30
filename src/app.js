import '../node_modules/@carbon/styles/css/styles.css';
import './index.scss';
import { createRoot } from "react-dom/client";
import Routes from "./route";

const root = createRoot(document.getElementById("app"));
root.render(<Routes />);
