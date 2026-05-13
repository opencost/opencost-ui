import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOrganization, useOrganizationList } from "@clerk/react";
import {
  Close,
  ExpandMore,
  MoreHoriz,
  PersonAdd,
  Search,
} from "@mui/icons-material";

import { useAuth } from "~/components/auth-context";
import {
  ROLE_OPTIONS,
  roleLabel,
  rolesSearchText,
} from "~/components/settings/user-role-labels";
import {
  createId,
  DEFAULT_NOTIFICATION_PREFS,
  loadStoredInvites,
  saveStoredInvites,
  type SettingsUserRole,
  type StoredSettingsUser,
  type UserNotificationPrefs,
} from "~/lib/settings-users-store";
import {
  getClerkOrgRoleAdmin,
  getClerkOrgRoleMember,
  hasClerkPublishableKey,
  isAuthDisabled,
} from "~/lib/clerk-config";
type ClerkOrganizationHook = ReturnType<typeof useOrganization>;

const badgeEmail =
  "inline-flex max-w-[min(280px,100%)] truncate rounded-full border border-[#a6c8ff] bg-[#edf5ff] px-2.5 py-0.5 text-xs font-medium text-[#0043ce]";
const badgeRole =
  "inline-flex shrink-0 rounded-full border border-[#c6d1cc] bg-[#f4f4f4] px-2 py-0.5 text-xs font-medium text-[#161616]";

type DisplayUser = {
  id: string;
  name: string;
  email: string;
  roles: SettingsUserRole[];
  status: "pending" | "active";
  source: StoredSettingsUser["source"];
  removable: boolean;
};

function parseEmailList(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

function initials(name: string, email: string): string {
  const n = name.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}

function toggleRole(list: SettingsUserRole[], r: SettingsUserRole) {
  if (list.includes(r)) {
    const next = list.filter((x) => x !== r);
    return next.length ? next : list;
  }
  return [...list, r];
}

function mapAppRolesToClerkRole(roles: SettingsUserRole[]): string {
  if (roles.includes("system_admin") || roles.includes("tenant_admin")) {
    return getClerkOrgRoleAdmin();
  }
  return getClerkOrgRoleMember();
}

function mapClerkRoleToDisplayRoles(clerkRole: string): SettingsUserRole[] {
  const admin = getClerkOrgRoleAdmin().toLowerCase();
  const r = (clerkRole ?? "").toLowerCase();
  if (r === admin || r === "org:admin") return ["tenant_admin"];
  return ["basic_user"];
}

function UsersManagementPanelBody({
  clerkOrg,
}: {
  clerkOrg?: ClerkOrganizationHook;
}) {
  const { user, isAuthenticated } = useAuth();
  const [invites, setInvites] = useState<StoredSettingsUser[]>([]);
  const [search, setSearch] = useState("");
  const [sortNameAsc, setSortNameAsc] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<SettingsUserRole[]>([
    "basic_user",
  ]);
  const [notifExpanded, setNotifExpanded] = useState(false);
  const [notif, setNotif] = useState<UserNotificationPrefs>({
    ...DEFAULT_NOTIFICATION_PREFS,
  });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    setInvites(loadStoredInvites());
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpenId(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const selfRow: DisplayUser | null = useMemo(() => {
    if (!isAuthenticated || !user?.email) return null;
    const name =
      (typeof user.name === "string" && user.name.trim()) ||
      user.email.split("@")[0];
    return {
      id: user.sub ?? `self_${user.email}`,
      name,
      email: user.email,
      roles: ["tenant_admin"],
      status: "active",
      source: "self",
      removable: false,
    };
  }, [isAuthenticated, user]);

  const clerkOrgActive = Boolean(
    clerkOrg?.isLoaded && clerkOrg.organization,
  );

  const rows: DisplayUser[] = useMemo(() => {
    let merged: DisplayUser[];

    if (clerkOrgActive && clerkOrg) {
      const memberRows: DisplayUser[] = [];
      const memberEmails = new Set<string>();
      for (const m of clerkOrg.memberships?.data ?? []) {
        const email = (m.publicUserData?.identifier ?? "").trim();
        if (!email) continue;
        const lower = email.toLowerCase();
        if (selfRow && selfRow.email.toLowerCase() === lower) continue;
        memberEmails.add(lower);
        const fn = m.publicUserData?.firstName?.trim() ?? "";
        const ln = m.publicUserData?.lastName?.trim() ?? "";
        const nameFromProfile = [fn, ln].filter(Boolean).join(" ");
        memberRows.push({
          id: m.id,
          name: nameFromProfile || email.split("@")[0],
          email,
          roles: mapClerkRoleToDisplayRoles(m.role),
          status: "active",
          source: "organization",
          removable: false,
        });
      }

      const inviteRows: DisplayUser[] = [];
      for (const inv of clerkOrg.invitations?.data ?? []) {
        const lower = inv.emailAddress.toLowerCase();
        if (memberEmails.has(lower)) continue;
        if (selfRow && selfRow.email.toLowerCase() === lower) continue;
        inviteRows.push({
          id: inv.id,
          name: inv.emailAddress.split("@")[0],
          email: inv.emailAddress,
          roles: mapClerkRoleToDisplayRoles(inv.role),
          status: "pending",
          source: "organization",
          removable: true,
        });
      }

      merged = [...(selfRow ? [selfRow] : []), ...memberRows, ...inviteRows];
    } else {
      const fromInvites: DisplayUser[] = invites.map((u) => ({
        id: u.id,
        name: u.name || u.email.split("@")[0],
        email: u.email,
        roles: u.roles,
        status: u.status,
        source: u.source,
        removable: true,
      }));
      merged = selfRow ? [selfRow, ...fromInvites] : fromInvites;
    }

    const q = search.trim().toLowerCase();
    const filtered = q
      ? merged.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            rolesSearchText(r.roles).includes(q),
        )
      : merged;
    return [...filtered].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
      return sortNameAsc ? cmp : -cmp;
    });
  }, [
    clerkOrg,
    clerkOrgActive,
    invites,
    search,
    selfRow,
    sortNameAsc,
  ]);

  const totalUserCount = rows.length;

  const persistInvites = useCallback((next: StoredSettingsUser[]) => {
    setInvites(next);
    saveStoredInvites(next);
  }, []);

  const removeInvite = useCallback(
    async (row: DisplayUser) => {
      if (
        row.source === "organization" &&
        row.status === "pending" &&
        clerkOrg?.invitations?.data
      ) {
        const inv = clerkOrg.invitations.data.find((i) => i.id === row.id);
        if (inv) {
          try {
            await inv.revoke();
            await clerkOrg.invitations?.revalidate?.();
          } catch (e) {
            console.error(e);
          }
        }
        setMenuOpenId(null);
        return;
      }
      persistInvites(invites.filter((u) => u.id !== row.id));
      setMenuOpenId(null);
    },
    [clerkOrg, invites, persistInvites],
  );

  const openModal = () => {
    setEmailInput("");
    setSelectedRoles(["basic_user"]);
    setNotif({ ...DEFAULT_NOTIFICATION_PREFS });
    setNotifExpanded(false);
    setInviteError(null);
    setModalOpen(true);
  };

  const submitInvite = async () => {
    const emails = parseEmailList(emailInput);
    if (!emails.length || selectedRoles.length === 0) return;

    if (clerkOrg !== undefined) {
      if (!clerkOrg.isLoaded || !clerkOrg.organization) {
        setInviteError(
          "No active Clerk organization for this session. Use the Clerk user menu to join or switch teams, then try again.",
        );
        return;
      }
    }

    if (clerkOrgActive && clerkOrg?.organization) {
      setInviteSubmitting(true);
      setInviteError(null);
      const clerkRole = mapAppRolesToClerkRole(selectedRoles);
      const taken = new Set<string>();
      clerkOrg.invitations?.data?.forEach((i) =>
        taken.add(i.emailAddress.toLowerCase()),
      );
      clerkOrg.memberships?.data?.forEach((m) => {
        const id = m.publicUserData?.identifier?.trim().toLowerCase();
        if (id) taken.add(id);
      });
      const errors: string[] = [];
      try {
        for (const email of emails) {
          if (taken.has(email)) continue;
          if (selfRow && selfRow.email.toLowerCase() === email) continue;
          try {
            await clerkOrg.organization.inviteMember({
              emailAddress: email,
              role: clerkRole,
            });
            taken.add(email);
          } catch (e: unknown) {
            const msg =
              e &&
              typeof e === "object" &&
              "errors" in e &&
              Array.isArray((e as { errors: { message?: string }[] }).errors)
                ? (e as { errors: { message?: string }[] }).errors
                    .map((x) => x.message)
                    .filter(Boolean)
                    .join("; ")
                : e instanceof Error
                  ? e.message
                  : String(e);
            errors.push(`${email}: ${msg || "invite failed"}`);
          }
        }
        if (errors.length) {
          setInviteError(errors.join("\n"));
        } else {
          setModalOpen(false);
        }
        await clerkOrg.invitations?.revalidate?.();
      } finally {
        setInviteSubmitting(false);
      }
      return;
    }

    const next: StoredSettingsUser[] = [...invites];
    for (const email of emails) {
      if (next.some((u) => u.email.toLowerCase() === email)) continue;
      if (selfRow && selfRow.email.toLowerCase() === email) continue;
      next.push({
        id: createId("invite"),
        email,
        name: email.split("@")[0],
        roles: [...selectedRoles],
        status: "pending",
        source: "invite",
        notifications: { ...notif },
      });
    }
    persistInvites(next);
    setModalOpen(false);
  };

  const canSubmit =
    parseEmailList(emailInput).length > 0 &&
    selectedRoles.length > 0 &&
    (clerkOrg === undefined ||
      (clerkOrg.isLoaded && !!clerkOrg.organization));

  return (
    <section className="overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-4 border-b border-[#e0e0e0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="m-0 text-base font-semibold text-[#161616]">
          Users ({totalUserCount})
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {clerkOrg !== undefined ? (
            <div className="flex min-w-[200px] max-w-[min(100%,320px)] shrink-0 flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#525252]">
                Organization
              </span>
              <div
                className="flex min-h-9 items-center gap-2 rounded border border-[#8d8d8d] bg-[#f4f4f4] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                aria-live="polite"
              >
                {!clerkOrg.isLoaded ? (
                  <span className="text-sm text-[#6f6f6f]">Loading…</span>
                ) : clerkOrg.organization ? (
                  <>
                    {clerkOrg.organization.imageUrl ? (
                      <img
                        src={clerkOrg.organization.imageUrl}
                        alt=""
                        className="h-7 w-7 shrink-0 rounded-full object-cover"
                      />
                    ) : null}
                    <span
                      className="truncate text-sm font-semibold text-[#161616]"
                      title={clerkOrg.organization.name ?? undefined}
                    >
                      {clerkOrg.organization.name}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-[#a2191f]">
                    None active
                  </span>
                )}
              </div>
            </div>
          ) : null}
          <div className="relative min-w-[200px] flex-1 sm:max-w-[280px]">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6f6f6f]"
              sx={{ fontSize: 18 }}
            />
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded border border-[#d0d0d0] bg-white pl-9 pr-3 text-sm text-[#161616] placeholder:text-[#8d8d8d] focus:border-[#0f62fe] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded bg-[#0f62fe] px-3 text-sm font-semibold text-white hover:bg-[#0353e9]"
          >
            <PersonAdd sx={{ fontSize: 18 }} />
            Add users
          </button>
        </div>
      </div>

      <p className="m-0 border-b border-[#e0e0e0] bg-[#f8f8f8] px-5 py-2 text-xs text-[#525252]">
        {clerkOrg !== undefined &&
        clerkOrg.isLoaded &&
        !clerkOrg.organization ? (
          <>
            <strong className="font-medium text-[#161616]">Clerk:</strong>{" "}
            no organization is active for this session. Use the Clerk user menu
            to join or switch teams, then reload if members do not appear.{" "}
          </>
        ) : null}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[#e0e0e0] bg-[#f4f4f4]">
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-semibold text-[#161616] hover:text-[#0f62fe] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f62fe] focus-visible:ring-offset-2"
                  onClick={() => setSortNameAsc((v) => !v)}
                >
                  Name
                  <span className="text-[#0f62fe]" aria-hidden>
                    {sortNameAsc ? "↑" : "↓"}
                  </span>
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#161616]">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#161616]">
                Roles
              </th>
              <th className="w-12 px-2 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center text-[#6f6f6f]">
                  <div className="mx-auto flex max-w-[280px] flex-col items-center gap-2">
                    <span className="text-4xl text-[#c6c6c6]" aria-hidden>
                      —
                    </span>
                    <span>No users to display</span>
                    {!isAuthenticated ? (
                      <span className="text-xs">
                        Sign in to see your account, or add pending invites.
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const hue = hashHue(row.id);
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[#e0e0e0] last:border-0 hover:bg-[#f4f4f4]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{
                            background: `hsl(${hue} 42% 42%)`,
                          }}
                        >
                          {initials(row.name, row.email)}
                        </span>
                        <span className="font-medium text-[#161616]">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={badgeEmail} title={row.email}>
                        {row.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {row.roles.map((r) => (
                          <span key={r} className={badgeRole}>
                            {roleLabel(r)}
                          </span>
                        ))}
                        {row.status === "pending" ? (
                          <span className="rounded-full border border-[#e8daff] bg-[#f6f2ff] px-2 py-0.5 text-xs font-medium text-[#6929c4]">
                            Pending
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="relative px-2 py-3 text-right">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-[#525252] hover:bg-[#e0e0e0]"
                        aria-label="Row actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId((id) =>
                            id === row.id ? null : row.id,
                          );
                        }}
                      >
                        <MoreHoriz />
                      </button>
                      {menuOpenId === row.id ? (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded border border-[#e0e0e0] bg-white py-1 shadow-lg"
                          role="menu"
                        >
                          {row.removable ? (
                            <button
                              type="button"
                              role="menuitem"
                              className="block w-full px-3 py-2 text-left text-sm text-[#da1e28] hover:bg-[#fff1f1]"
                              onClick={() => void removeInvite(row)}
                            >
                              Remove
                            </button>
                          ) : (
                            <div className="px-3 py-2 text-xs text-[#6f6f6f]">
                              Signed-in user
                            </div>
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-lg bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-users-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e0e0e0] px-5 py-4">
              <h2
                id="add-users-title"
                className="m-0 text-lg font-semibold text-[#161616]"
              >
                Add new users
              </h2>
              <button
                type="button"
                className="rounded p-1 text-[#525252] hover:bg-[#e0e0e0]"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
              >
                <Close />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {inviteError ? (
                <div
                  className="rounded border border-[#ffd7d9] bg-[#fff1f1] px-3 py-2 text-xs text-[#a2191f] whitespace-pre-wrap"
                  role="alert"
                >
                  {inviteError}
                </div>
              ) : null}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#161616]">
                  Email(s)
                </label>
                <textarea
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  rows={3}
                  placeholder="colleague@company.com"
                  className="w-full resize-y rounded border border-[#d0d0d0] bg-white px-3 py-2 text-sm text-[#161616] focus:border-[#0f62fe] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#161616]">
                  Roles
                </label>
                <div className="flex flex-wrap gap-2 rounded border border-[#e0e0e0] bg-[#fafafa] p-3">
                  {ROLE_OPTIONS.map((o) => {
                    const on = selectedRoles.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() =>
                          setSelectedRoles((list) => toggleRole(list, o.value))
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          on
                            ? "border-[#0f62fe] bg-[#edf5ff] text-[#0043ce]"
                            : "border-[#c6c6c6] bg-white text-[#393939] hover:border-[#8d8d8d]"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded border border-[#e0e0e0] bg-white px-3 py-2.5 text-left text-sm font-semibold text-[#161616] hover:bg-[#f4f4f4]"
                  onClick={() => setNotifExpanded((v) => !v)}
                  aria-expanded={notifExpanded}
                >
                  <span>Notification settings</span>
                  <ExpandMore
                    sx={{
                      transition: "transform 0.2s",
                      transform: notifExpanded ? "rotate(180deg)" : "none",
                    }}
                  />
                </button>
                {notifExpanded ? (
                  <div className="mt-2 rounded border border-[#e0e0e0] bg-[#f8f8f8] p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-sm text-[#393939]">Disable all</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#0f62fe]"
                        checked={notif.disableAll}
                        onChange={() =>
                          setNotif((n) => ({ ...n, disableAll: !n.disableAll }))
                        }
                      />
                    </div>
                    {(
                      [
                        ["alerts", "Alerts"],
                        ["budgets", "Budgets"],
                        ["recommendations", "Recommendations"],
                      ] as const
                    ).map(([key, label]) => (
                      <div
                        key={key}
                        className="mb-2 flex items-center justify-between gap-2"
                      >
                        <span className="text-sm text-[#393939]">{label}</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#0f62fe]"
                          checked={notif.disableAll ? false : notif[key]}
                          disabled={notif.disableAll}
                          onChange={() =>
                            setNotif((n) => ({
                              ...n,
                              [key]: !n[key],
                            }))
                          }
                        />
                      </div>
                    ))}
                    <div className="mt-3 border-t border-[#e0e0e0] pt-3">
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[#6f6f6f]">
                        Reports
                      </div>
                      {(
                        [
                          ["reportsDaily", "Daily"],
                          ["reportsWeekly", "Weekly"],
                          ["reportsMonthly", "Monthly"],
                        ] as const
                      ).map(([key, label]) => (
                        <div
                          key={key}
                          className="mb-2 flex items-center justify-between gap-2"
                        >
                          <span className="text-sm text-[#393939]">
                            {label}
                          </span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[#0f62fe]"
                            checked={notif.disableAll ? false : notif[key]}
                            disabled={notif.disableAll}
                            onChange={() =>
                              setNotif((n) => ({
                                ...n,
                                [key]: !n[key],
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#e0e0e0] px-5 py-4">
              <button
                type="button"
                className="h-9 rounded border border-[#8d8d8d] bg-white px-4 text-sm font-medium text-[#161616] hover:bg-[#f4f4f4]"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSubmit || inviteSubmitting}
                className="h-9 rounded bg-[#0f62fe] px-4 text-sm font-semibold text-white hover:bg-[#0353e9] disabled:cursor-not-allowed disabled:bg-[#c6c6c6]"
                onClick={() => void submitInvite()}
              >
                {inviteSubmitting ? "Sending…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function UsersManagementPanelWithClerkOrg() {
  const clerkOrg = useOrganization({
    invitations: { pageSize: 50 },
    memberships: { pageSize: 50 },
  });
  const { isLoaded: orgListLoaded, userMemberships, setActive } =
    useOrganizationList({
      userMemberships: { pageSize: 20 },
    });

  const autoOrgRef = useRef(false);
  useEffect(() => {
    if (autoOrgRef.current) return;
    if (!clerkOrg.isLoaded || !orgListLoaded) return;
    if (clerkOrg.organization) return;
    const rows = userMemberships?.data;
    if (!rows?.length || rows.length !== 1) return;
    autoOrgRef.current = true;
    const orgId = rows[0].organization.id;
    void setActive({ organization: orgId }).catch(() => {
      autoOrgRef.current = false;
    });
  }, [
    clerkOrg.isLoaded,
    clerkOrg.organization,
    orgListLoaded,
    setActive,
    userMemberships?.data,
  ]);

  return <UsersManagementPanelBody clerkOrg={clerkOrg} />;
}

export default function UsersManagementPanel() {
  if (!hasClerkPublishableKey() || isAuthDisabled()) {
    return <UsersManagementPanelBody />;
  }
  return <UsersManagementPanelWithClerkOrg />;
}
