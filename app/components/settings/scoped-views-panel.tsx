import { useMemo, useState } from "react";
import { useOrganization } from "@clerk/react";
import { Add, Search } from "@mui/icons-material";

import { useAuth } from "~/components/auth-context";
import CreateScopedViewDrawer from "~/components/settings/create-scoped-view-drawer";
import { usePolicy } from "~/components/policy-context";
import {
  currentUserIsOrgAdmin,
} from "~/lib/clerk-org-access";
import { hasClerkPublishableKey, isAuthDisabled } from "~/lib/clerk-config";
import {
  createUserScopedViewFromPanel,
  rbacApiErrorMessage,
  type ScopedViewPanelPayload,
} from "~/lib/scoped-views-repository";
import type { PolicyResolvedView } from "~/types/rbac";

type ClerkOrganizationHook = ReturnType<typeof useOrganization>;

function ScopedViewsAccessNotice({ message }: { message: string }) {
  return (
    <section className="rounded border border-[#e0e0e0] bg-white px-5 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <h3 className="m-0 text-base font-semibold text-[#161616]">
        Scoped views
      </h3>
      <p className="m-0 mt-2 text-sm text-[#525252]">{message}</p>
    </section>
  );
}

function modeLabel(mode: PolicyResolvedView["mode"]): string {
  switch (mode) {
    case "available":
      return "Available";
    case "enabledByDefault":
      return "Enabled by default";
    case "enforced":
      return "Enforced";
    case "strictlyEnabled":
      return "Strictly enabled";
    default:
      return mode;
  }
}

function ScopedViewsPanelBody({
  clerkOrg,
}: {
  clerkOrg?: ClerkOrganizationHook;
}) {
  const { user } = useAuth();
  const { policy, policyLoading, clerkUserId, refreshPolicy } = usePolicy();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const views = policy?.views ?? [];
    if (!q) return views;
    return views.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        modeLabel(v.mode).toLowerCase().includes(q),
    );
  }, [policy?.views, search]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [filtered],
  );

  const isOrgAdmin = currentUserIsOrgAdmin(
    clerkOrg?.memberships?.data,
    clerkUserId,
  );
  const orgAccessLoading = Boolean(clerkOrg && !clerkOrg.isLoaded);

  const memberOptions = useMemo(() => {
    const byId = new Map<string, { id: string; email: string }>();
    if (clerkUserId) {
      byId.set(clerkUserId, {
        id: clerkUserId,
        email: user?.email ?? clerkUserId,
      });
    }
    if (isOrgAdmin) {
      for (const membership of clerkOrg?.memberships?.data ?? []) {
        const id = membership.publicUserData?.userId?.trim();
        const email = membership.publicUserData?.identifier?.trim();
        if (!id || !email) continue;
        byId.set(id, { id, email });
      }
    }
    return [...byId.values()].sort((a, b) =>
      a.email.localeCompare(b.email, undefined, { sensitivity: "base" }),
    );
  }, [clerkOrg?.memberships?.data, clerkUserId, isOrgAdmin, user?.email]);

  const handleCreate = async (payload: ScopedViewPanelPayload) => {
    if (!clerkUserId) return;
    setSaving(true);
    setError(null);
    try {
      await createUserScopedViewFromPanel(payload, clerkUserId, {
        personalOnly: !isOrgAdmin,
      });
      await refreshPolicy();
      setDrawerOpen(false);
    } catch (err) {
      setError(rbacApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!clerkUserId) {
    return <ScopedViewsAccessNotice message="Sign in to view your scoped views." />;
  }

  return (
    <>
      <section className="overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 border-b border-[#e0e0e0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="m-0 text-base font-semibold text-[#161616]">
            My scoped views
          </h3>
          <div className="flex flex-wrap items-center gap-2">
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
                className="h-9 w-full rounded border border-[#d0d0d0] bg-white pl-9 pr-3 text-sm text-[#161616] placeholder:text-[#8d8d8d] focus:border-[var(--oc-accent)] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (orgAccessLoading) return;
                setError(null);
                setDrawerOpen(true);
              }}
              disabled={saving || orgAccessLoading}
              className="oc-btn-primary inline-flex h-9 items-center gap-2 rounded bg-[var(--oc-accent)] px-3 text-sm font-medium text-white hover:bg-[var(--oc-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Add sx={{ fontSize: 18 }} />
              {orgAccessLoading ? "Loading access…" : "Create scoped view"}
            </button>
          </div>
        </div>
        <p className="m-0 border-b border-[#e0e0e0] bg-[#f8f8f8] px-5 py-2 text-xs text-[#525252]">
          {isOrgAdmin
            ? "Showing scoped views resolved for your signed-in user. New scoped views created here are assigned to the selected active Clerk users."
            : "Showing scoped views resolved for your signed-in user. New scoped views created here are personal to your account."}
        </p>
        {error ? (
          <div className="border-b border-[#ffd7d9] bg-[#fff1f1] px-5 py-3 text-sm text-[#da1e28]">
            {error}
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-[#e0e0e0] bg-[#f4f4f4]">
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#161616]">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#161616]">
                  Total filters
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#161616]">
                  Mode
                </th>
              </tr>
            </thead>
            <tbody>
              {policyLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-16 text-center text-[#6f6f6f]"
                  >
                    Loading your scoped views…
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-16 text-center text-[#6f6f6f]"
                  >
                    No scoped views assigned to your user
                  </td>
                </tr>
              ) : (
                sorted.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-[#e0e0e0] last:border-0 hover:bg-[#f4f4f4]"
                  >
                    <td className="px-4 py-3 font-medium text-[#161616]">
                      {v.name}
                    </td>
                    <td className="px-4 py-3 text-[#393939]">
                      {v.filters?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-[#393939]">
                      {modeLabel(v.mode)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <CreateScopedViewDrawer
        open={drawerOpen}
        memberOptions={memberOptions}
        personalOnly={!isOrgAdmin}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}

function ScopedViewsPanelWithClerkOrg() {
  const clerkOrg = useOrganization({ memberships: { pageSize: 50 } });
  return <ScopedViewsPanelBody clerkOrg={clerkOrg} />;
}

export default function ScopedViewsPanel() {
  if (!hasClerkPublishableKey() || isAuthDisabled()) {
    return <ScopedViewsPanelBody />;
  }
  return <ScopedViewsPanelWithClerkOrg />;
}
