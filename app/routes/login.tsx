import { useEffect, useMemo } from "react";
import { Navigate, useLocation } from "react-router";
import { SignIn } from "@clerk/react";

import { AppBootLoader } from "~/components/app-boot-loader";
import { useAuth } from "~/components/auth-context";
import { hasClerkPublishableKey, isAuthDisabled } from "~/lib/clerk-config";
import { opencostClerkAppearance } from "~/lib/clerk-appearance";

export function meta() {
  return [{ title: "OpenCost — Login" }];
}

export default function LoginPage() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const canUseClerk = hasClerkPublishableKey() && !isAuthDisabled();

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get("returnTo");
    return requested && requested.startsWith("/") ? requested : "/";
  }, [location.search]);

  useEffect(() => {
    const setViewportUnit = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--app-vh", `${vh}px`);
    };
    setViewportUnit();
    window.addEventListener("resize", setViewportUnit);
    return () => window.removeEventListener("resize", setViewportUnit);
  }, []);

  if (isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  return (
    <main className="app-login-layout">
      <div className="app-login-center">
        {canUseClerk ? (
          <SignIn
            routing="hash"
            signUpUrl="/sign-up"
            signUpForceRedirectUrl={returnTo}
            forceRedirectUrl={returnTo}
            fallbackRedirectUrl={returnTo}
            appearance={opencostClerkAppearance}
          />
        ) : null}
      </div>

      {!canUseClerk ? (
        <p className="app-login-overlay-warning" role="status">
          Auth is disabled or Clerk is not configured. Set{" "}
          <code className="px-1">VITE_CLERK_PUBLISHABLE_KEY</code> (or{" "}
          <code className="px-1">VITE_AUTH_DISABLED=true</code> in development
          only).
        </p>
      ) : null}

      {canUseClerk && isLoading ? (
        <div className="app-login-session-gate" role="presentation">
          <AppBootLoader message="Loading…" compact />
        </div>
      ) : null}
    </main>
  );
}
