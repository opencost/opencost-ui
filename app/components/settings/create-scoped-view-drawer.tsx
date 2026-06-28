import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Close, InfoOutlined } from "@mui/icons-material";

import {
  DEFAULT_APPLY_NEW_USERS,
  FILTER_OPERATORS,
  emptyUserBuckets,
  newFilterRow,
  type ScopedViewApplyNewUsers,
  type ScopedViewFilterRow,
  type ScopedViewUserBuckets,
} from "~/lib/scoped-views-store";

import "./create-scoped-view-modal.scss";

const STEPS = [
  { id: 1, label: "Name & filters" },
  { id: 2, label: "Users" },
] as const;

type BucketKey =
  | "availableFor"
  | "enforcedFor"
  | "enabledByDefaultFor"
  | "strictlyEnabledFor";

const USER_BUCKETS: {
  key: BucketKey;
  title: string;
  info?: boolean;
}[] = [
  { key: "availableFor", title: "Available for" },
  { key: "enforcedFor", title: "Enforced for", info: true },
  { key: "enabledByDefaultFor", title: "Enabled by default for" },
  { key: "strictlyEnabledFor", title: "Strictly enabled for" },
];

type Props = {
  open: boolean;
  memberOptions: MemberOption[];
  personalOnly?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    filters: ScopedViewFilterRow[];
    users: ScopedViewUserBuckets;
    applyToNewUsers: ScopedViewApplyNewUsers;
  }) => void;
};

type MemberOption = {
  id: string;
  email: string;
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="create-scoped-view-modal__steps" aria-label="Form progress">
      {STEPS.map((s) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <div
            key={s.id}
            className={[
              "create-scoped-view-modal__step",
              active ? "create-scoped-view-modal__step--active" : "",
              done ? "create-scoped-view-modal__step--done" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="create-scoped-view-modal__step-dot" aria-hidden>
              {done ? <Check sx={{ fontSize: 14 }} /> : s.id}
            </span>
            <span className="create-scoped-view-modal__step-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function BucketCard({
  title,
  count,
  showInfo,
  tags,
  options,
  onChangeTags,
}: {
  title: string;
  count: number;
  showInfo?: boolean;
  tags: string[];
  options: MemberOption[];
  onChangeTags: (next: string[]) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const labelById = new Map(options.map((option) => [option.id, option.email]));

  const add = (id: string) => {
    if (!tags.includes(id)) onChangeTags([...tags, id]);
    setMenuOpen(false);
  };

  const remove = (id: string) => onChangeTags(tags.filter((t) => t !== id));

  const available = options.filter((o) => !tags.includes(o.id));

  return (
    <div className="create-scoped-view-modal__bucket">
      <div className="create-scoped-view-modal__bucket-header">
        <div className="create-scoped-view-modal__bucket-title">
          {title}
          <span className="create-scoped-view-modal__badge">{count}</span>
          {showInfo ? (
            <span title="Members who must use this scoped view.">
              <InfoOutlined sx={{ fontSize: 16, color: "var(--sv-text-muted)" }} />
            </span>
          ) : null}
        </div>
      </div>
      <div className="create-scoped-view-modal__bucket-body">
        <div className="create-scoped-view-modal__tags">
          {tags.length === 0 ? (
            <span className="create-scoped-view-modal__tag-empty">
              No members in this bucket yet.
            </span>
          ) : (
            tags.map((id) => {
              const label = labelById.get(id) ?? id;
              return (
                <span key={id} className="create-scoped-view-modal__tag" title={id}>
                  <span className="max-w-[180px] truncate">{label}</span>
                  <button
                    type="button"
                    className="create-scoped-view-modal__tag-remove"
                    aria-label={`Remove ${label}`}
                    onClick={() => remove(id)}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </button>
                </span>
              );
            })
          )}
        </div>
        <div className="create-scoped-view-modal__add-menu" ref={menuRef}>
          <button
            type="button"
            className="create-scoped-view-modal__add-btn"
            disabled={available.length === 0}
            onClick={() => setMenuOpen((o) => !o)}
          >
            + Add
          </button>
          {menuOpen && available.length > 0 ? (
            <div className="create-scoped-view-modal__add-dropdown" role="listbox">
              {available.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  className="create-scoped-view-modal__add-option"
                  title={option.id}
                  onClick={() => add(option.id)}
                >
                  {option.email}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function CreateScopedViewDrawer({
  open,
  memberOptions,
  personalOnly = false,
  onClose,
  onSubmit,
}: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [filters, setFilters] = useState<ScopedViewFilterRow[]>([]);
  const [users, setUsers] = useState<ScopedViewUserBuckets>(emptyUserBuckets);
  const applyToNewUsers: ScopedViewApplyNewUsers = DEFAULT_APPLY_NEW_USERS;

  const resetForm = useCallback(() => {
    setStep(1);
    setName("");
    setFilters([]);
    setUsers(emptyUserBuckets());
  }, []);

  useEffect(() => {
    if (!open) return;
    resetForm();
  }, [open, resetForm]);

  const canNext = step === 1 ? name.trim().length > 0 : true;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      filters,
      users,
      applyToNewUsers,
    });
    handleClose();
  };

  const updateFilter = (id: string, patch: Partial<ScopedViewFilterRow>) => {
    setFilters((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  if (!open) return null;

  return (
    <div
      className="create-scoped-view-modal"
      role="presentation"
      onClick={handleClose}
    >
      <div className="create-scoped-view-modal__backdrop">
        <div
          className="create-scoped-view-modal__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-scoped-view-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="create-scoped-view-modal__header">
            <h2 id="create-scoped-view-title" className="create-scoped-view-modal__title">
              Create scoped view
            </h2>
            <button
              type="button"
              className="create-scoped-view-modal__close"
              aria-label="Close"
              onClick={handleClose}
            >
              <Close />
            </button>
          </header>

          <StepIndicator current={step} />

          <div className="create-scoped-view-modal__body">
            {step === 1 ? (
              <>
                <label className="create-scoped-view-modal__label" htmlFor="sv-name">
                  View name
                </label>
                <input
                  id="sv-name"
                  className="create-scoped-view-modal__input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Team A"
                />

                <h3 className="create-scoped-view-modal__section-title create-scoped-view-modal__section-title--spaced">
                  Filters
                </h3>
                {filters.length === 0 ? (
                  <p className="create-scoped-view-modal__empty mb-3">
                    No filters yet. Add a filter or dataset row to scope cost data.
                  </p>
                ) : (
                  <div className="mb-3">
                    {filters.map((row) => (
                      <div key={row.id} className="create-scoped-view-modal__filter-card">
                        <div className="create-scoped-view-modal__filter-grid">
                          <label className="create-scoped-view-modal__filter-field">
                            <span>Dataset</span>
                            <input
                              className="create-scoped-view-modal__input"
                              value={row.dataset}
                              onChange={(e) =>
                                updateFilter(row.id, { dataset: e.target.value })
                              }
                            />
                          </label>
                          <label className="create-scoped-view-modal__filter-field">
                            <span>Field</span>
                            <input
                              className="create-scoped-view-modal__input"
                              value={row.field}
                              onChange={(e) =>
                                updateFilter(row.id, { field: e.target.value })
                              }
                              placeholder="namespace"
                            />
                          </label>
                          <label className="create-scoped-view-modal__filter-field">
                            <span>Operator</span>
                            <select
                              className="create-scoped-view-modal__input"
                              value={row.operator}
                              onChange={(e) =>
                                updateFilter(row.id, { operator: e.target.value })
                              }
                            >
                              {FILTER_OPERATORS.map((op) => (
                                <option key={op} value={op}>
                                  {op}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="create-scoped-view-modal__filter-field">
                            <span>Value</span>
                            <input
                              className="create-scoped-view-modal__input"
                              value={row.value}
                              onChange={(e) =>
                                updateFilter(row.id, { value: e.target.value })
                              }
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          className="create-scoped-view-modal__remove-filter"
                          onClick={() =>
                            setFilters((f) => f.filter((r) => r.id !== row.id))
                          }
                        >
                          Remove filter
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="create-scoped-view-modal__dashed-btn"
                    onClick={() => setFilters((f) => [...f, newFilterRow()])}
                  >
                    + Add filter
                  </button>
                  <button
                    type="button"
                    className="create-scoped-view-modal__dashed-btn"
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
              </>
            ) : null}

            {step === 2 ? (
              <>
                <p className="create-scoped-view-modal__desc">
                  {personalOnly
                    ? `This scoped view will be assigned only to ${
                        memberOptions[0]?.email ?? "your signed-in user"
                      }.`
                    : "Assign users to each bucket."}
                </p>
                {personalOnly
                  ? null
                  : USER_BUCKETS.map(({ key, title, info }) => (
                      <BucketCard
                        key={key}
                        title={title}
                        count={users[key].length}
                        showInfo={info}
                        tags={users[key]}
                        options={memberOptions}
                        onChangeTags={(next) =>
                          setUsers((u) => ({ ...u, [key]: next }))
                        }
                      />
                    ))}
              </>
            ) : null}

          </div>

          <footer className="create-scoped-view-modal__footer">
            <div className="create-scoped-view-modal__footer-left">
              {step > 1 ? (
                <button
                  type="button"
                  className="create-scoped-view-modal__btn create-scoped-view-modal__btn--ghost"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              <span className="create-scoped-view-modal__step-counter">
                Step {step} of 2
              </span>
            </div>
            <div className="create-scoped-view-modal__footer-right">
              <button
                type="button"
                className="create-scoped-view-modal__btn create-scoped-view-modal__btn--ghost"
                onClick={handleClose}
              >
                Cancel
              </button>
              {step < 2 ? (
                <button
                  type="button"
                  className="create-scoped-view-modal__btn create-scoped-view-modal__btn--primary"
                  disabled={!canNext}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="create-scoped-view-modal__btn create-scoped-view-modal__btn--primary"
                  disabled={!canNext}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
