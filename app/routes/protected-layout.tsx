import { Navigate, Outlet, useLocation } from "react-router";

import { AppBootLoader } from "~/components/app-boot-loader";
import { useAuth } from "~/components/auth-context";
import { hasClerkPublishableKey, isAuthDisabled } from "~/lib/clerk-config";

/** Layout route: requires Clerk session (unless auth is disabled / dev-no-key fallback). */
export default function ProtectedLayout() {
  const location = useLocation();
  const authBypass =
    isAuthDisabled() || (import.meta.env.DEV && !hasClerkPublishableKey());
  const { isLoading, isAuthenticated } = useAuth();

  if (authBypass) {
    return (
      <>
        {import.meta.env.DEV && !hasClerkPublishableKey() && !isAuthDisabled() ? (
          <div
            className="px-6 py-3 text-sm bg-[#fff8e1] text-[#684e00] border-b border-[#facc15]"
            role="status"
          >
            Set <code className="px-1">VITE_CLERK_PUBLISHABLE_KEY</code> — running
            without sign-in redirect (development only).
          </div>
        ) : null}
        <Outlet />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4]">
        <AppBootLoader message="Checking session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    const loginPath = `/login?returnTo=${encodeURIComponent(returnTo)}`;
    return <Navigate to={loginPath} replace />;
  }

  return <Outlet />;
}
