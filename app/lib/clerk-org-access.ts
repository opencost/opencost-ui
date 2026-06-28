import { getClerkOrgRoleAdmin } from "~/lib/clerk-config";

type MembershipLike = {
  role?: string | null;
  publicUserData?: {
    userId?: string | null;
  } | null;
};

export function isClerkOrgAdminRole(role: string | null | undefined): boolean {
  return role === getClerkOrgRoleAdmin();
}

export function currentUserOrgRole(
  memberships: readonly MembershipLike[] | undefined,
  userId: string | null | undefined,
): string | null {
  if (!memberships?.length || !userId) return null;
  return (
    memberships.find((m) => m.publicUserData?.userId === userId)?.role ?? null
  );
}

export function currentUserIsOrgAdmin(
  memberships: readonly MembershipLike[] | undefined,
  userId: string | null | undefined,
): boolean {
  return isClerkOrgAdminRole(currentUserOrgRole(memberships, userId));
}
