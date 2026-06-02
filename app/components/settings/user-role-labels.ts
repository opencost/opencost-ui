import type { SettingsUserRole } from "~/lib/settings-users-store";

export const ROLE_OPTIONS: { value: SettingsUserRole; label: string }[] = [
  { value: "system_admin", label: "System Admin" },
  { value: "tenant_admin", label: "Tenant Admin" },
  { value: "basic_user", label: "Basic User" },
];

export function roleLabel(role: SettingsUserRole): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

export function rolesSearchText(roles: SettingsUserRole[]): string {
  return roles.map(roleLabel).join(" ").toLowerCase();
}
