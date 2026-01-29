import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import Routes from "./route";

const root = createRoot(document.getElementById("app"));
root.render(
    <ThemeProvider>
        <Routes />
    </ThemeProvider>
);
