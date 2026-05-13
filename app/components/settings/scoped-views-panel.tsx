import { useCallback, useEffect, useMemo, useState } from "react";
import { Add, Search } from "@mui/icons-material";

import CreateScopedViewDrawer from "~/components/settings/create-scoped-view-drawer";
import { useAuth } from "~/components/auth-context";
import { createId, loadStoredInvites } from "~/lib/settings-users-store";
import {
  countDistinctUsers,
  loadScopedViews,
  saveScopedViews,
  type ScopedViewApplyNewUsers,
  type ScopedViewFilterRow,
  type ScopedViewUserBuckets,
  type StoredScopedView,
} from "~/lib/scoped-views-store";

export default function ScopedViewsPanel() {
  const { user, isAuthenticated } = useAuth();
  const [views, setViews] = useState<StoredScopedView[]>([]);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const reload = useCallback(() => {
    setViews(loadScopedViews());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const memberEmails = useMemo(() => {
    const emails = new Set<string>();
    if (isAuthenticated && user?.email) emails.add(user.email);
    for (const inv of loadStoredInvites()) emails.add(inv.email);
    return Array.from(emails).sort((a, b) => a.localeCompare(b));
  }, [isAuthenticated, user?.email]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return views;
    return views.filter((v) => v.name.toLowerCase().includes(q));
  }, [search, views]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [filtered],
  );

  const handleCreate = useCallback(
    (payload: {
      name: string;
      filters: ScopedViewFilterRow[];
      users: ScopedViewUserBuckets;
      applyToNewUsers: ScopedViewApplyNewUsers;
    }) => {
      const next: StoredScopedView = {
        ...payload,
        id: createId("scoped"),
        createdAt: new Date().toISOString(),
      };
      const list = [...loadScopedViews(), next];
      saveScopedViews(list);
      reload();
    },
    [reload],
  );

  return (
    <>
      <section className="overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 border-b border-[#e0e0e0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="m-0 text-base font-semibold text-[#161616]">
            Scoped views
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
                className="h-9 w-full rounded border border-[#d0d0d0] bg-white pl-9 pr-3 text-sm text-[#161616] placeholder:text-[#8d8d8d] focus:border-[#0f62fe] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded bg-[#0f62fe] px-3 text-sm font-semibold text-white hover:bg-[#0353e9]"
            >
              <Add sx={{ fontSize: 18 }} />
              Create scoped view
            </button>
          </div>
        </div>

        <p className="m-0 border-b border-[#e0e0e0] bg-[#f8f8f8] px-5 py-2 text-xs text-[#525252]">
          Scoped views restrict which cost rows a user sees. Persisted locally
          until you connect backend enforcement.
        </p>

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
                  Total users
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-16 text-center text-[#6f6f6f]">
                    No data to display
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
                      {v.filters.length}
                    </td>
                    <td className="px-4 py-3 text-[#393939]">
                      {countDistinctUsers(v.users)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CreateScopedViewDrawer
        open={createOpen}
        memberEmails={memberEmails}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
