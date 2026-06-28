import { rbacGet } from "~/services/rbac-api";
import type {
  AllocationFilter,
  PolicyResponse,
  PolicyResolvedView,
} from "~/types/rbac";

export async function fetchUserPolicy(
  clerkUserId: string,
): Promise<PolicyResponse | null> {
  if (!clerkUserId) {
    return null;
  }
  try {
    return await rbacGet<PolicyResponse>(
      `/config/rbac/policy/users/${encodeURIComponent(clerkUserId)}`,
    );
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 501 || status === 404) {
      return null;
    }
    throw err;
  }
}

/** Maps RBAC scoped view filter rows to OpenCost allocation filter params. */
export function policyViewsToAllocationFilters(
  views: PolicyResolvedView[],
): AllocationFilter[] {
  const out: AllocationFilter[] = [];
  const seen = new Set<string>();
  for (const view of views) {
    for (const row of view.filters ?? []) {
      const property = row.field?.trim();
      const value = row.value?.trim();
      if (!property || value === undefined) {
        continue;
      }
      const key = `${property}\0${value}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      out.push({ property, value });
    }
  }
  return out;
}

/** Policy filters are applied first; user drilldown filters may narrow further. */
export function mergeAllocationFilters(
  userFilters: AllocationFilter[],
  policyFilters: AllocationFilter[],
): AllocationFilter[] {
  const seen = new Set<string>();
  const out: AllocationFilter[] = [];
  for (const f of [...policyFilters, ...userFilters]) {
    const key = `${f.property}\0${f.value}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(f);
  }
  return out;
}

export function isPolicyLocked(mode: string): boolean {
  return mode === "enforced" || mode === "strictlyEnabled";
}
