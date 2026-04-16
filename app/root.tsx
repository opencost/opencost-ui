import { lazy, Suspense } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import type { Route } from "./+types/root";
import "./app.scss";
import "./tailwind.css";
import { ThemeProvider, THEME_STORAGE_KEY } from "~/components/theme-context";
import AppMuiThemeBridge from "~/components/app-mui-theme-bridge";

const isLegacyMode = import.meta.env.VITE_LEGACY_MODE === "true";

const DashboardApp = lazy(() =>
  import("~/components/dashboard-context").then((m) => ({
    default: () => (
      <m.DashboardProvider>
        <Outlet />
      </m.DashboardProvider>
    ),
  })),
);

// Applies the persisted / preferred theme before React hydrates so the first
// paint matches the user's choice (avoids a light-to-dark flash).
const themeBootstrap = `(function(){try{var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var t=(s==='white'||s==='g100')?s:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'g100':'white');var r=document.documentElement;r.setAttribute('data-carbon-theme',t);r.classList.remove('cds--white','cds--g100');r.classList.add(t==='g100'?'cds--g100':'cds--white');r.style.colorScheme=t==='g100'?'dark':'light';}catch(e){}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {!isLegacyMode && (
          <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        )}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  if (isLegacyMode) {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Outlet />
      </LocalizationProvider>
    );
  }
  return (
    <ThemeProvider>
      <AppMuiThemeBridge>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Suspense fallback={null}>
            <DashboardApp />
          </Suspense>
        </LocalizationProvider>
      </AppMuiThemeBridge>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
    stack = import.meta.env.DEV ? error.stack : undefined;
  }

  return (
    <main className="p-[4rem_2rem] max-w-[600px] mx-auto">
      <h1 className="text-[2rem] font-bold mb-4">{message}</h1>
      <p className="text-[var(--cds-text-secondary)] mb-4">{details}</p>
      {stack && (
        <pre className="bg-[var(--cds-layer)] p-4 overflow-x-auto text-[0.8rem]">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
