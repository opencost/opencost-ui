import { useEffect, useMemo, useRef, useState } from "react";
import {
  Close,
  InfoOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material";

import {
  DEFAULT_APPLY_NEW_USERS,
  FILTER_OPERATORS,
  emptyUserBuckets,
  newFilterRow,
  type ScopedViewApplyNewUsers,
  type ScopedViewFilterRow,
  type ScopedViewUserBuckets,
} from "~/lib/scoped-views-store";

type Props = {
  open: boolean;
  memberEmails: string[];
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    filters: ScopedViewFilterRow[];
    users: ScopedViewUserBuckets;
    applyToNewUsers: ScopedViewApplyNewUsers;
  }) => void;
};

const chipClass =
  "inline-flex max-w-full items-center gap-1 rounded-full border border-[#a6c8ff] bg-[#edf5ff] py-0.5 pl-2.5 pr-1 text-xs font-medium text-[#0043ce]";

function BucketMemberPicker({
  idSuffix,
  options,
  value,
  onChange,
}: {
  idSuffix: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchId = `scoped-bucket-search-${idSuffix}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((e) => e.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (email: string) => {
    if (value.includes(email)) {
      onChange(value.filter((e) => e !== email));
    } else {
      onChange([...value, email]);
    }
  };

  const remove = (email: string) => {
    onChange(value.filter((e) => e !== email));
  };

  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen]);

  if (options.length === 0) {
    return (
      <p className="m-0 text-xs text-[#6f6f6f]">
        No workspace members yet — add people on the{" "}
        <strong className="font-medium text-[#393939]">Users</strong> tab first.
      </p>
    );
  }

  const allSelected =
    options.length > 0 && value.length === options.length;

  return (
    <div className="space-y-2" ref={rootRef}>
      <div className="rounded-lg border border-[#e0e0e0] bg-[#fafafa] p-2.5">
        <div className="mb-2 flex min-h-[1.75rem] flex-wrap items-center gap-2">
          {value.length > 0 ? (
            value.map((email) => (
              <span key={email} className={chipClass} title={email}>
                <span className="max-w-[200px] truncate">{email}</span>
                <button
                  type="button"
                  className="flex shrink-0 rounded-full p-0.5 text-[#0043ce] hover:bg-[#d0e2ff]"
                  aria-label={`Remove ${email}`}
                  onClick={() => remove(email)}
                >
                  <Close sx={{ fontSize: 14 }} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs italic text-[#6f6f6f]">
              No members in this bucket yet.
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#e8e8e8] pt-2">
          <button
            type="button"
            className="rounded border border-transparent px-2 py-1 text-xs font-semibold text-[#0f62fe] hover:border-[#d0e2ff] hover:bg-white"
            onClick={() => onChange([...options])}
            disabled={allSelected}
          >
            All members
          </button>
          <button
            type="button"
            className="rounded border border-transparent px-2 py-1 text-xs font-semibold text-[#525252] hover:border-[#e0e0e0] hover:bg-white"
            onClick={() => onChange([])}
            disabled={value.length === 0}
          >
            Clear bucket
          </button>
          <div className="ml-auto flex items-center">
            <button
              type="button"
              aria-expanded={pickerOpen}
              aria-controls={`scoped-bucket-panel-${idSuffix}`}
              className="inline-flex items-center gap-1 rounded-md border border-[#0f62fe] bg-white px-3 py-1.5 text-sm font-semibold text-[#0f62fe] shadow-sm hover:bg-[#edf5ff]"
              onClick={() => {
                setPickerOpen((open) => {
                  const next = !open;
                  if (next) setQuery("");
                  return next;
                });
              }}
            >
              Add members
              <KeyboardArrowDown
                sx={{
                  fontSize: 20,
                  transition: "transform 0.15s",
                  transform: pickerOpen ? "rotate(180deg)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {pickerOpen ? (
        <div
          id={`scoped-bucket-panel-${idSuffix}`}
          className="mt-2 max-h-[min(320px,45vh)] overflow-hidden rounded-lg border border-[#c6c6c6] bg-white shadow-md ring-1 ring-black/5"
        >
          <div className="border-b border-[#e0e0e0] bg-[#f8f8f8] px-3 py-2">
            <label className="sr-only" htmlFor={searchId}>
              Filter members to add
            </label>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter…"
              autoFocus
              className="h-9 w-full rounded border border-[#d0d0d0] bg-white px-3 text-sm text-[#161616] placeholder:text-[#8d8d8d] focus:border-[#0f62fe] focus:outline-none"
            />
          </div>
          <ul
            className="max-h-[220px] overflow-y-auto py-1"
            aria-label="Add members"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-[#6f6f6f]">
                No matches.
              </li>
            ) : (
              filtered.map((email) => {
                const checked = value.includes(email);
                return (
                  <li
                    key={email}
                    className="border-b border-[#f4f4f4] last:border-b-0"
                  >
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-[#f4f4f4]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 accent-[#0f62fe]"
                        checked={checked}
                        onChange={() => toggle(email)}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-[#161616]">
                        {email}
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-t border-[#e0e0e0] bg-[#fafafa] px-3 py-2 text-center">
            <button
              type="button"
              className="text-xs font-medium text-[#0f62fe] hover:underline"
              onClick={() => setPickerOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CreateScopedViewDrawer({
  open,
  memberEmails,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [filters, setFilters] = useState<ScopedViewFilterRow[]>([]);
  const [users, setUsers] = useState<ScopedViewUserBuckets>(emptyUserBuckets);
  const [applyToNewUsers, setApplyToNewUsers] = useState<ScopedViewApplyNewUsers>(
    { ...DEFAULT_APPLY_NEW_USERS },
  );

  useEffect(() => {
    if (!open) return;
    setName("");
    setFilters([]);
    setUsers(emptyUserBuckets());
    setApplyToNewUsers({ ...DEFAULT_APPLY_NEW_USERS });
  }, [open]);

  const summary = useMemo(
    () =>
      `Available For (${users.availableFor.length}) / Enforced For (${users.enforcedFor.length}) / Enabled By Default For (${users.enabledByDefaultFor.length}) / Strictly Enabled For (${users.strictlyEnabledFor.length})`,
    [users],
  );

  const listedPeople = useMemo(() => {
    const m = new Map<string, string>();
    for (const k of Object.keys(users) as (keyof ScopedViewUserBuckets)[]) {
      for (const email of users[k]) {
        if (!m.has(email)) m.set(email, email.split("@")[0] || email);
      }
    }
    return Array.from(m.entries()).map(([email, display]) => ({
      email,
      name: display,
    }));
  }, [users]);

  const canSubmit = name.trim().length > 0;

  const updateFilter = (id: string, patch: Partial<ScopedViewFilterRow>) => {
    setFilters((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const removeFilter = (id: string) => {
    setFilters((rows) => rows.filter((r) => r.id !== id));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scoped-view-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#e0e0e0] bg-white px-5 py-4">
          <h2
            id="scoped-view-drawer-title"
            className="m-0 text-lg font-semibold text-[#161616]"
          >
            Create scoped view
          </h2>
          <button
            type="button"
            className="rounded p-1 text-[#525252] hover:bg-[#e0e0e0]"
            aria-label="Close"
            onClick={onClose}
          >
            <Close />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#161616]">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Team A"
                className="h-9 w-full rounded border border-[#d0d0d0] bg-white px-3 text-sm text-[#161616] focus:border-[#0f62fe] focus:outline-none"
              />
            </div>

            <div>
              <h3 className="m-0 mb-2 text-sm font-semibold text-[#161616]">
                Filters
              </h3>
              <div className="space-y-3">
                {filters.length === 0 ? (
                  <p className="text-sm text-[#6f6f6f]">
                    No filters yet. Add a filter or dataset row to scope data
                    (e.g. cluster, namespace, label).
                  </p>
                ) : null}
                {filters.map((row) => (
                  <div
                    key={row.id}
                    className="rounded border border-[#e0e0e0] bg-[#fafafa] p-3"
                  >
                    <div className="mb-2 grid gap-2 sm:grid-cols-2">
                      <div>
                        <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-[#6f6f6f]">
                          Dataset
                        </span>
                        <input
                          value={row.dataset}
                          onChange={(e) =>
                            updateFilter(row.id, { dataset: e.target.value })
                          }
                          className="h-8 w-full rounded border border-[#d0d0d0] bg-white px-2 text-sm"
                        />
                      </div>
                      <div>
                        <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-[#6f6f6f]">
                          Field
                        </span>
                        <input
                          value={row.field}
                          onChange={(e) =>
                            updateFilter(row.id, { field: e.target.value })
                          }
                          placeholder="namespace, label, …"
                          className="h-8 w-full rounded border border-[#d0d0d0] bg-white px-2 text-sm"
                        />
                      </div>
                      <div>
                        <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-[#6f6f6f]">
                          Operator
                        </span>
                        <select
                          value={row.operator}
                          onChange={(e) =>
                            updateFilter(row.id, { operator: e.target.value })
                          }
                          className="h-8 w-full rounded border border-[#d0d0d0] bg-white px-2 text-sm"
                        >
                          {FILTER_OPERATORS.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-[#6f6f6f]">
                          Value
                        </span>
                        <input
                          value={row.value}
                          onChange={(e) =>
                            updateFilter(row.id, { value: e.target.value })
                          }
                          placeholder="Value or list"
                          className="h-8 w-full rounded border border-[#d0d0d0] bg-white px-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-xs text-[#da1e28] hover:underline"
                        onClick={() => removeFilter(row.id)}
                      >
                        Remove filter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="text-sm font-medium text-[#0f62fe] hover:underline"
                  onClick={() => setFilters((f) => [...f, newFilterRow()])}
                >
                  + Add filter
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-[#0f62fe] hover:underline"
                  onClick={() =>
                    setFilters((f) => [
                      ...f,
                      { ...newFilterRow(), dataset: "Cost", field: "service" },
                    ])
                  }
                >
                  + Add dataset
                </button>
              </div>
            </div>

            <div>
              <h3 className="m-0 mb-3 text-sm font-semibold text-[#161616]">
                Users
              </h3>
              <p className="mb-3 text-xs text-[#525252]">
                Map each bucket to users or teams when backend enforcement is
                connected.
              </p>

              {(
                [
                  ["availableFor", "Available for", false],
                  ["enforcedFor", "Enforced for", true],
                  ["enabledByDefaultFor", "Enabled by default for", false],
                  ["strictlyEnabledFor", "Strictly enabled for", false],
                ] as const
              ).map(([key, title, showInfo]) => (
                <div
                  key={key}
                  className="mb-4 rounded border border-[#e0e0e0] bg-[#fafafa] p-3"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-[#161616]">
                      {title}: ({users[key].length})
                      {showInfo ? (
                        <span title="Users who must use this view.">
                          <InfoOutlined
                            sx={{ fontSize: 16 }}
                            className="text-[#6f6f6f]"
                          />
                        </span>
                      ) : null}
                    </div>
                    <label className="flex items-center gap-2 text-xs text-[#393939]">
                      <input
                        type="checkbox"
                        className="accent-[#0f62fe]"
                        checked={applyToNewUsers[key]}
                        onChange={() =>
                          setApplyToNewUsers((a) => ({
                            ...a,
                            [key]: !a[key],
                          }))
                        }
                      />
                      Apply to new users
                    </label>
                  </div>
                  <BucketMemberPicker
                    idSuffix={key}
                    options={memberEmails}
                    value={users[key]}
                    onChange={(next) =>
                      setUsers((u) => ({ ...u, [key]: next }))
                    }
                  />
                </div>
              ))}

              <p className="mb-2 text-xs text-[#393939]">{summary}</p>
              <button
                type="button"
                className="mb-4 text-sm font-medium text-[#0f62fe] hover:underline"
                onClick={() => {
                  const all = [...memberEmails];
                  setUsers({
                    availableFor: [...all],
                    enforcedFor: [...all],
                    enabledByDefaultFor: [...all],
                    strictlyEnabledFor: [...all],
                  });
                }}
                disabled={memberEmails.length === 0}
              >
                + Apply to all users
              </button>

              <div className="overflow-hidden rounded border border-[#e0e0e0]">
                <div className="grid grid-cols-2 border-b-2 border-[#e0e0e0] bg-[#f4f4f4] px-3 py-2 text-xs font-semibold text-[#161616]">
                  <span>Name</span>
                  <span>Email</span>
                </div>
                {listedPeople.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-[#6f6f6f]">
                    No users selected in any bucket yet.
                  </div>
                ) : (
                  listedPeople.map((p) => (
                    <div
                      key={p.email}
                      className="grid grid-cols-2 border-t border-[#e0e0e0] px-3 py-2 text-sm text-[#393939]"
                    >
                      <span>{p.name}</span>
                      <span className="truncate">{p.email}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-[#e0e0e0] bg-white px-5 py-4">
          <button
            type="button"
            className="h-9 rounded border border-[#8d8d8d] bg-white px-4 text-sm font-medium text-[#161616] hover:bg-[#f4f4f4]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            className="h-9 rounded bg-[#0f62fe] px-4 text-sm font-semibold text-white hover:bg-[#0353e9] disabled:cursor-not-allowed disabled:bg-[#c6c6c6]"
            onClick={() => {
              if (!canSubmit) return;
              onSubmit({
                name: name.trim(),
                filters,
                users,
                applyToNewUsers,
              });
              onClose();
            }}
          >
            Submit
          </button>
        </footer>
      </div>
    </div>
  );
}
