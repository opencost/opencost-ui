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

const isLegacyMode = import.meta.env.VITE_LEGACY_MODE === "true";

const DashboardApp = lazy(() =>
  import("~/components/dashboard-context").then((m) => ({
    default: () => (
      <m.DashboardProvider>
        <Outlet />
      </m.DashboardProvider>
    ),
  }))
);

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
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
  const content = isLegacyMode ? <Outlet /> : (
    <Suspense fallback={null}>
      <DashboardApp />
    </Suspense>
  );
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {content}
    </LocalizationProvider>
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
      <h1 className="text-[2rem] font-bold mb-4">
        {message}
      </h1>
      <p className="text-[#525252] mb-4">{details}</p>
      {stack && (
        <pre className="bg-[#f4f4f4] p-4 overflow-x-auto text-[0.8rem]">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
