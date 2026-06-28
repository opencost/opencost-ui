/** Clerk publishable key (safe in the browser; never put the secret key in Vite). */
export function getClerkPublishableKey(): string {
  return import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
}

/** Optional JWT template name when APIs expect a custom `aud` or claims. */
export function getClerkJwtTemplate(): string | undefined {
  const t = import.meta.env.VITE_CLERK_JWT_TEMPLATE;
  return t && t.trim() ? t.trim() : undefined;
}

/** Dev-only escape hatch — permissions become permissive; no tokens sent. */
export function isAuthDisabled(): boolean {
  return (
    import.meta.env.DEV && import.meta.env.VITE_AUTH_DISABLED === "true"
  );
}

export function hasClerkPublishableKey(): boolean {
  const k = getClerkPublishableKey();
  return k.startsWith("pk_test_") || k.startsWith("pk_live_");
}

/** Clerk organization role keys (Dashboard → Organizations → Roles). Defaults match Clerk presets. */
export function getClerkOrgRoleAdmin(): string {
  const v = import.meta.env.VITE_CLERK_ORG_ROLE_ADMIN;
  return v && String(v).trim() ? String(v).trim() : "org:admin";
}

export function getClerkOrgRoleMember(): string {
  const v = import.meta.env.VITE_CLERK_ORG_ROLE_MEMBER;
  return v && String(v).trim() ? String(v).trim() : "org:member";
}
