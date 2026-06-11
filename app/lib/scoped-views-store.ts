import { createId } from "~/lib/settings-users-store";

export type ScopedViewFilterRow = {
  id: string;
  dataset: string;
  field: string;
  operator: string;
  value: string;
};

export type ScopedViewUserBuckets = {
  availableFor: string[];
  enforcedFor: string[];
  enabledByDefaultFor: string[];
  strictlyEnabledFor: string[];
};

export type ScopedViewApplyNewUsers = {
  availableFor: boolean;
  enforcedFor: boolean;
  enabledByDefaultFor: boolean;
  strictlyEnabledFor: boolean;
};

export type StoredScopedView = {
  id: string;
  name: string;
  filters: ScopedViewFilterRow[];
  users: ScopedViewUserBuckets;
  applyToNewUsers: ScopedViewApplyNewUsers;
  createdAt: string;
};

const STORAGE_KEY = "opencost.settings.scopedViews.v1";

export const DEFAULT_APPLY_NEW_USERS: ScopedViewApplyNewUsers = {
  availableFor: false,
  enforcedFor: false,
  enabledByDefaultFor: false,
  strictlyEnabledFor: false,
};

export const FILTER_OPERATORS = [
  "Equals",
  "Not equals",
  "Contains",
  "Starts with",
] as const;

function safeParse(raw: string | null): StoredScopedView[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter(
      (row): row is StoredScopedView =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as StoredScopedView).id === "string" &&
        typeof (row as StoredScopedView).name === "string",
    );
  } catch {
    return [];
  }
}

export function loadScopedViews(): StoredScopedView[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveScopedViews(views: StoredScopedView[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}

export function newFilterRow(): ScopedViewFilterRow {
  return {
    id: createId("filter"),
    dataset: "Billing",
    field: "projectName",
    operator: "Equals",
    value: "",
  };
}

export function emptyUserBuckets(): ScopedViewUserBuckets {
  return {
    availableFor: [],
    enforcedFor: [],
    enabledByDefaultFor: [],
    strictlyEnabledFor: [],
  };
}

export function countDistinctUsers(b: ScopedViewUserBuckets): number {
  const s = new Set<string>();
  for (const k of Object.keys(b) as (keyof ScopedViewUserBuckets)[]) {
    for (const email of b[k]) s.add(email.toLowerCase());
  }
  return s.size;
}
