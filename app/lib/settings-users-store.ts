export type UserNotificationPrefs = {
  disableAll: boolean;
  alerts: boolean;
  budgets: boolean;
  recommendations: boolean;
  reportsDaily: boolean;
  reportsWeekly: boolean;
  reportsMonthly: boolean;
};

export type StoredSettingsUser = {
  id: string;
  email: string;
  name: string;
  status: "pending" | "active";
  source: "invite" | "self" | "organization";
  notifications?: UserNotificationPrefs;
};

const STORAGE_KEY = "opencost.settings.users.v1";

export const DEFAULT_NOTIFICATION_PREFS: UserNotificationPrefs = {
  disableAll: false,
  alerts: true,
  budgets: true,
  recommendations: true,
  reportsDaily: false,
  reportsWeekly: true,
  reportsMonthly: false,
};

function migrateStoredUser(row: unknown): StoredSettingsUser | null {
  if (typeof row !== "object" || row === null) return null;
  const o = row as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.email !== "string") return null;

  const status =
    o.status === "pending" || o.status === "active" ? o.status : "pending";
  const source =
    o.source === "invite" || o.source === "self" || o.source === "organization"
      ? o.source
      : "invite";

  return {
    id: o.id,
    email: o.email,
    name: typeof o.name === "string" ? o.name : o.email.split("@")[0],
    status,
    source,
    notifications:
      typeof o.notifications === "object" &&
      o.notifications !== null &&
      !Array.isArray(o.notifications)
        ? (o.notifications as UserNotificationPrefs)
        : undefined,
  };
}

function safeParse(raw: string | null): StoredSettingsUser[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .map(migrateStoredUser)
      .filter((x): x is StoredSettingsUser => x !== null);
  } catch {
    return [];
  }
}

export function loadStoredInvites(): StoredSettingsUser[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveStoredInvites(users: StoredSettingsUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}
