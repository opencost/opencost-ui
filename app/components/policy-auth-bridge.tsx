import type { ReactNode } from "react";
import { useAuth } from "~/components/auth-context";
import { PolicyProvider } from "~/components/policy-context";

/**
 * Connects OpenCost RBAC policy resolution to the app AuthProvider (Clerk session).
 * Must render inside AuthProvider — do not wrap another ClerkProvider here.
 */
export function PolicyAuthBridge({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const clerkUserId =
    !isLoading && isAuthenticated && user?.sub ? user.sub : null;

  return (
    <PolicyProvider clerkUserId={clerkUserId}>{children}</PolicyProvider>
  );
}
