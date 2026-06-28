import { rbacDelete, rbacGet, rbacPost, rbacPut } from "~/services/rbac-api";
import type { ScopedView } from "~/types/rbac";

const BASE = "/config/rbac/scopedViews";

export async function listScopedViews(): Promise<ScopedView[]> {
  return rbacGet<ScopedView[]>(BASE);
}

export async function getScopedView(id: string): Promise<ScopedView> {
  return rbacGet<ScopedView>(`${BASE}/${encodeURIComponent(id)}`);
}

export async function createScopedView(view: ScopedView): Promise<ScopedView> {
  return rbacPost<ScopedView>(BASE, view);
}

export async function createUserScopedView(
  userId: string,
  view: ScopedView,
): Promise<ScopedView> {
  return rbacPost<ScopedView>(
    `/config/rbac/users/${encodeURIComponent(userId)}/scopedViews`,
    view,
  );
}

export async function updateScopedView(
  id: string,
  view: Partial<ScopedView>,
): Promise<ScopedView> {
  return rbacPut<ScopedView>(`${BASE}/${encodeURIComponent(id)}`, view);
}

export async function deleteScopedView(id: string): Promise<void> {
  return rbacDelete(`${BASE}/${encodeURIComponent(id)}`);
}
