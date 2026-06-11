import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type AuthUser = {
  sub?: string;
  name?: string;
  email?: string;
  [k: string]: unknown;
};

export type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: Error | null;

  showLogin: (opts?: { container?: string; returnTo?: string }) => void;
  hideLogin: () => void;

  logout: () => void;

  getAccessTokenSilently: () => Promise<string | undefined>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth requires AuthProvider");
  return ctx;
}

export type AuthContextProviderProps = {
  value: AuthContextValue;
  children: ReactNode;
};

export function AuthContextProvider({
  value,
  children,
}: AuthContextProviderProps) {
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

const noop = () => {};

export function buildBypassAuthValue(): AuthContextValue {
  return {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    error: null,
    showLogin: noop,
    hideLogin: noop,
    logout: noop,
    getAccessTokenSilently: async () => undefined,
  };
}
