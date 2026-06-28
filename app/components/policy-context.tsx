import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchUserPolicy,
  mergeAllocationFilters,
  policyViewsToAllocationFilters,
} from "~/services/policy";
import type { AllocationFilter, PolicyResponse } from "~/types/rbac";

interface PolicyContextValue {
  clerkUserId: string | null;
  policy: PolicyResponse | null;
  policyLoading: boolean;
  policyAllocationFilters: AllocationFilter[];
  mergeWithUserFilters: (userFilters: AllocationFilter[]) => AllocationFilter[];
  refreshPolicy: () => Promise<void>;
}

const PolicyContext = createContext<PolicyContextValue | null>(null);

interface PolicyProviderProps {
  clerkUserId: string | null | undefined;
  children: ReactNode;
}

export function PolicyProvider({
  clerkUserId,
  children,
}: PolicyProviderProps) {
  const userId = clerkUserId ?? null;
  const [policy, setPolicy] = useState<PolicyResponse | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  const refreshPolicy = useCallback(async () => {
    if (!userId) {
      setPolicy(null);
      return;
    }
    setPolicyLoading(true);
    try {
      const next = await fetchUserPolicy(userId);
      setPolicy(next);
    } catch {
      setPolicy(null);
    } finally {
      setPolicyLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refreshPolicy();
  }, [refreshPolicy]);

  const policyAllocationFilters = useMemo(
    () => policyViewsToAllocationFilters(policy?.views ?? []),
    [policy],
  );

  const mergeWithUserFilters = useCallback(
    (userFilters: AllocationFilter[]) =>
      mergeAllocationFilters(userFilters, policyAllocationFilters),
    [policyAllocationFilters],
  );

  const value = useMemo(
    () => ({
      clerkUserId: userId,
      policy,
      policyLoading,
      policyAllocationFilters,
      mergeWithUserFilters,
      refreshPolicy,
    }),
    [
      userId,
      policy,
      policyLoading,
      policyAllocationFilters,
      mergeWithUserFilters,
      refreshPolicy,
    ],
  );

  return (
    <PolicyContext.Provider value={value}>{children}</PolicyContext.Provider>
  );
}

export function usePolicy(): PolicyContextValue {
  const ctx = useContext(PolicyContext);
  if (!ctx) {
    return {
      clerkUserId: null,
      policy: null,
      policyLoading: false,
      policyAllocationFilters: [],
      mergeWithUserFilters: (userFilters) => userFilters,
      refreshPolicy: async () => {},
    };
  }
  return ctx;
}

/** Merges RBAC policy filters with widget drilldown filters for allocation queries. */
export function usePolicyMergedAllocationFilters(
  drilldownFilters: AllocationFilter[],
): AllocationFilter[] {
  const { mergeWithUserFilters } = usePolicy();
  return useMemo(
    () => mergeWithUserFilters(drilldownFilters),
    [drilldownFilters, mergeWithUserFilters],
  );
}
