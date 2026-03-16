import { lazy, Suspense } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.scss";

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
  if (isLegacyMode) {
    return <Outlet />;
  }
  return (
    <Suspense fallback={null}>
      <DashboardApp />
    </Suspense>
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
    <main style={{ padding: "4rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "1rem" }}>
        {message}
      </h1>
      <p style={{ color: "#525252", marginBottom: "1rem" }}>{details}</p>
      {stack && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "1rem",
            overflowX: "auto",
            fontSize: "0.8rem",
          }}
        >
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
