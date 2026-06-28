export interface ScopedViewFilterRow {
  id: string;
  dataset: string;
  field: string;
  operator: string;
  value: string;
}

export interface ScopedViewUserBuckets {
  availableFor: string[];
  enforcedFor: string[];
  enabledByDefaultFor: string[];
  strictlyEnabledFor: string[];
}

export interface ScopedViewApplyFlags {
  availableFor: boolean;
  enforcedFor: boolean;
  enabledByDefaultFor: boolean;
  strictlyEnabledFor: boolean;
}

export interface ScopedView {
  id: string;
  name: string;
  filters: ScopedViewFilterRow[];
  users: ScopedViewUserBuckets;
  applyToNewUsers: ScopedViewApplyFlags;
  createdAt: string;
  updatedAt?: string;
}

export type PolicyViewMode =
  | "available"
  | "enabledByDefault"
  | "enforced"
  | "strictlyEnabled";

export interface PolicyResolvedView {
  id: string;
  name: string;
  mode: PolicyViewMode;
  filters: ScopedViewFilterRow[];
}

export interface PolicyResponse {
  userId: string;
  views: PolicyResolvedView[];
}

export interface AllocationFilter {
  property: string;
  value: string;
}
