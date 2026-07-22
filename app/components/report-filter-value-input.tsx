import { useEffect, useId, useMemo, useRef, useState, type FocusEvent } from "react";
import {
  fetchReportFilterAutocomplete,
  supportsReportFilterAutocomplete,
} from "~/services/report-filter-autocomplete";
import type { ReportFilterRule, ReportLayer } from "~/types/report";

const DEBOUNCE_MS = 400;

interface ReportFilterValueInputProps {
  layer: ReportLayer;
  window: string;
  field: string;
  value: string;
  filters: ReportFilterRule[];
  filterIndex: number;
  onChange: (value: string) => void;
  placeholder?: string;
}

function normalizeValue(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.length > 0 ? raw : "";
}

export default function ReportFilterValueInput({
  layer,
  window: reportWindow,
  field,
  value,
  filters,
  filterIndex,
  onChange,
  placeholder = "Value",
}: ReportFilterValueInputProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAutocomplete = supportsReportFilterAutocomplete(layer, field);

  const otherFiltersKey = useMemo(
    () =>
      filters
        .filter((rule, i) => i !== filterIndex && rule.value.trim())
        .map((rule) => `${rule.property}=${rule.value}`)
        .join("&"),
    [filters, filterIndex],
  );

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    setOpen(false);
    setSuggestions([]);
    setError(null);
  }, [field]);

  useEffect(() => {
    if (!open || !hasAutocomplete || !reportWindow) {
      return;
    }

    let active = true;
    const timer = globalThis.setTimeout(() => {
      setLoading(true);
      setError(null);

      void fetchReportFilterAutocomplete({
        layer,
        window: reportWindow,
        field,
        search: draft,
        filters,
        excludeFilterIndex: filterIndex,
      })
        .then((results) => {
          if (active) setSuggestions(results);
        })
        .catch((err: unknown) => {
          if (!active) return;
          setSuggestions([]);
          setError(err instanceof Error ? err.message : "Unable to load suggestions.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      globalThis.clearTimeout(timer);
    };
  }, [open, hasAutocomplete, layer, reportWindow, field, draft, otherFiltersKey, filterIndex]);

  const commit = () => {
    const next = normalizeValue(draft);
    if (next !== value) onChange(next);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && rootRef.current?.contains(next)) return;
    setOpen(false);
    commit();
  };

  const handleSelect = (item: string) => {
    setDraft(item);
    onChange(item);
    setOpen(false);
  };

  const showList = open && hasAutocomplete;

  return (
    <div ref={rootRef} className="relative" onBlur={handleBlur}>
      <input
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        aria-autocomplete={hasAutocomplete ? "list" : undefined}
        aria-controls={hasAutocomplete ? listId : undefined}
        aria-expanded={showList}
        className="h-9 w-full rounded border border-[var(--cds-border-subtle)] bg-[var(--cds-field)] px-2 text-[13px] text-[var(--cds-text-primary)]"
      />

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="z-10 mt-1 max-h-48 list-none overflow-y-auto rounded border border-[var(--cds-border-subtle)] bg-[var(--cds-layer)] p-0 shadow-md"
        >
          {loading ? (
            <li className="px-2 py-1.5 text-xs text-[var(--cds-text-placeholder)]">Loading…</li>
          ) : error ? (
            <li className="px-2 py-1.5 text-xs text-[#da1e28]">{error}</li>
          ) : suggestions.length === 0 ? (
            <li className="px-2 py-1.5 text-xs text-[var(--cds-text-placeholder)]">No matches</li>
          ) : (
            suggestions.map((item) => (
              <li key={item} role="option">
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-left text-[13px] text-[var(--cds-text-primary)] hover:bg-[var(--cds-layer-02)]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(item)}
                >
                  {item}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
