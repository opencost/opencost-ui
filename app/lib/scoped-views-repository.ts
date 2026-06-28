import {
  createScopedView,
  createUserScopedView,
  deleteScopedView,
  listScopedViews,
  updateScopedView,
} from "~/services/scoped-views-api";
import { createId } from "~/lib/settings-users-store";
import type {
  ScopedView,
  ScopedViewUserBuckets,
} from "~/types/rbac";
import type {
  ScopedViewApplyNewUsers,
  ScopedViewFilterRow,
} from "~/lib/scoped-views-store";

let cache: ScopedView[] | null = null;
let loadPromise: Promise<ScopedView[]> | null = null;

export type ScopedViewPanelPayload = {
  name: string;
  filters: ScopedViewFilterRow[];
  users: ScopedViewUserBuckets;
  applyToNewUsers: ScopedViewApplyNewUsers;
};

export function buildScopedViewForApi(
  payload: ScopedViewPanelPayload,
  id: string,
): ScopedView {
  return {
    id,
    name: payload.name,
    filters: payload.filters,
    users: payload.users,
    applyToNewUsers: payload.applyToNewUsers,
    createdAt: new Date().toISOString(),
  };
}

export async function loadScopedViewsFromApi(
  force = false,
): Promise<ScopedView[]> {
  if (!force && cache) {
    return cache;
  }
  if (!force && loadPromise) {
    return loadPromise;
  }
  loadPromise = listScopedViews()
    .then((views) => {
      cache = views;
      return views;
    })
    .finally(() => {
      loadPromise = null;
    });
  return loadPromise;
}

export function invalidateScopedViewsCache(): void {
  cache = null;
  loadPromise = null;
}

export async function saveScopedView(view: ScopedView): Promise<ScopedView> {
  const existing = cache?.some((v) => v.id === view.id);
  const saved = existing
    ? await updateScopedView(view.id, view)
    : await createScopedView(view);
  invalidateScopedViewsCache();
  return saved;
}

export async function createScopedViewFromPanel(
  payload: ScopedViewPanelPayload,
  id: string,
): Promise<ScopedView> {
  const saved = await createScopedView(buildScopedViewForApi(payload, id));
  invalidateScopedViewsCache();
  return saved;
}

export async function createUserScopedViewFromPanel(
  payload: ScopedViewPanelPayload,
  userId: string,
  options?: { personalOnly?: boolean },
): Promise<ScopedView> {
  const view = buildScopedViewForApi(
    options?.personalOnly
      ? {
          ...payload,
          users: {
            availableFor: [userId],
            enforcedFor: [],
            enabledByDefaultFor: [],
            strictlyEnabledFor: [],
          },
          applyToNewUsers: {
            availableFor: false,
            enforcedFor: false,
            enabledByDefaultFor: false,
            strictlyEnabledFor: false,
          },
        }
      : payload,
    createId("sv"),
  );
  const saved = await createUserScopedView(userId, view);
  invalidateScopedViewsCache();
  return saved;
}

export async function removeScopedView(id: string): Promise<void> {
  await deleteScopedView(id);
  invalidateScopedViewsCache();
}

export function isRbacApiDisabledError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 501;
}

export function rbacApiErrorMessage(err: unknown): string {
  if (isRbacApiDisabledError(err)) {
    return "Scoped views API is disabled. Set rbac.scopedViews.enabled to true in OpenCost config.json.";
  }
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 401 || status === 403) {
    return "Scoped view access requires a valid signed-in Clerk user.";
  }
  const msg = (err as { response?: { data?: { message?: string } } })?.response
    ?.data?.message;
  if (typeof msg === "string" && msg.length > 0) return msg;
  if (err instanceof Error) return err.message;
  return "Request failed";
}
