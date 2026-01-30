import { createRoot } from "react-dom/client";
import Routes from "./route";
import { ThemeProvider } from "./context/ThemeContext";

const root = createRoot(document.getElementById("app"));
root.render(
  <ThemeProvider>
    <Routes />
  </ThemeProvider>,
);
