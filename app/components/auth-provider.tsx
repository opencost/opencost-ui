import { useEffect, useCallback, useMemo } from "react";
import {
  ClerkProvider,
  useAuth as useClerkSession,
  useClerk,
  useUser,
} from "@clerk/react";

import {
  AuthContextProvider,
  buildBypassAuthValue,
  useAuth,
  type AuthContextValue,
} from "~/components/auth-context";
import { opencostClerkAppearance } from "~/lib/clerk-appearance";
import {
  getClerkJwtTemplate,
  getClerkPublishableKey,
  hasClerkPublishableKey,
  isAuthDisabled,
} from "~/lib/clerk-config";
import { registerApiAuthGetter } from "~/services/api-client";

function ApiAuthRegistrar() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth();

  useEffect(() => {
    registerApiAuthGetter(async () => {
      if (!isAuthenticated) return undefined;
      try {
        return await getAccessTokenSilently();
      } catch {
        return undefined;
      }
    });
    return () => registerApiAuthGetter(null);
  }, [getAccessTokenSilently, isAuthenticated]);

  return null;
}

function useClerkAuthContextValue(): AuthContextValue {
  const { isLoaded, isSignedIn, getToken } = useClerkSession();
  const { user } = useUser();
  const clerk = useClerk();
  const jwtTemplate = getClerkJwtTemplate();

  const getAccessTokenSilently = useCallback(async () => {
    if (!isSignedIn) return undefined;
    try {
      const raw = await getToken(
        jwtTemplate ? { template: jwtTemplate } : undefined,
      );
      return raw ?? undefined;
    } catch {
      return undefined;
    }
  }, [getToken, isSignedIn, jwtTemplate]);

  const authUser = useMemo(() => {
    if (!user) return null;
    const email = user.primaryEmailAddress?.emailAddress;
    return {
      sub: user.id,
      name: user.fullName ?? undefined,
      email: email ?? undefined,
    };
  }, [user]);

  const logout = useCallback(() => {
    const origin = window.location.origin;
    void clerk.signOut({ redirectUrl: `${origin}/login` });
  }, [clerk]);

  const showLogin = useCallback((opts?: { returnTo?: string }) => {
    const path =
      opts?.returnTo && opts.returnTo.startsWith("/")
        ? `/login?returnTo=${encodeURIComponent(opts.returnTo)}`
        : "/login";
    window.location.assign(path);
  }, []);

  const hideLogin = useCallback(() => {}, []);

  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: Boolean(isSignedIn),
      user: authUser,
      error: null,
      showLogin,
      hideLogin,
      logout,
      getAccessTokenSilently,
    }),
    [
      authUser,
      getAccessTokenSilently,
      hideLogin,
      isLoaded,
      isSignedIn,
      logout,
      showLogin,
    ],
  );
}

function ClerkSessionProvider({ children }: { children: React.ReactNode }) {
  const value = useClerkAuthContextValue();
  return (
    <AuthContextProvider value={value}>
      <ApiAuthRegistrar />
      {children}
    </AuthContextProvider>
  );
}

function BypassSessionProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => buildBypassAuthValue(), []);
  return (
    <AuthContextProvider value={value}>
      <ApiAuthRegistrar />
      {children}
    </AuthContextProvider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const disabled = isAuthDisabled();
  const key = getClerkPublishableKey();
  const devBypass =
    import.meta.env.DEV && !hasClerkPublishableKey() && !disabled;

  if (disabled || devBypass) {
    return <BypassSessionProvider>{children}</BypassSessionProvider>;
  }

  return (
    <ClerkProvider
      publishableKey={key}
      appearance={opencostClerkAppearance}
      signInUrl="/login"
      signUpUrl="/sign-up"
    >
      <ClerkSessionProvider>{children}</ClerkSessionProvider>
    </ClerkProvider>
  );
}
