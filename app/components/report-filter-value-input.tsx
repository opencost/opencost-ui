import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  fetchReportFilterAutocomplete,
  supportsReportFilterAutocomplete,
} from "~/services/report-filter-autocomplete";
import type { ReportFilterRule, ReportLayer } from "~/types/report";

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

const SUGGEST_DEBOUNCE_MS = 400;
const COMMIT_DEBOUNCE_MS = 600;
const MENU_MAX_HEIGHT_PX = 192;
const MENU_GAP_PX = 4;

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
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const autocompleteEnabled = supportsReportFilterAutocomplete(layer, field);
  const filtersKey = useMemo(
    () =>
      JSON.stringify(
        filters.map((rule, index) =>
          index === filterIndex
            ? { property: rule.property }
            : { property: rule.property, value: rule.value },
        ),
      ),
    [filters, filterIndex],
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    setOpen(false);
    setSuggestions([]);
    setFetchError(null);
  }, [field]);

  const commitToParent = useCallback(
    (nextValue: string) => {
      const trimmed = nextValue.trim();
      const normalized = trimmed.length > 0 ? nextValue : "";
      if (normalized !== value) {
        onChange(normalized);
      }
    },
    [onChange, value],
  );

  const scheduleCommit = useCallback(
    (nextValue: string) => {
      if (commitTimerRef.current) {
        globalThis.clearTimeout(commitTimerRef.current);
      }
      if (!nextValue.trim()) {
        commitToParent("");
        return;
      }
      commitTimerRef.current = globalThis.setTimeout(() => {
        commitToParent(nextValue);
      }, COMMIT_DEBOUNCE_MS);
    },
    [commitToParent],
  );

  useEffect(() => {
    return () => {
      if (commitTimerRef.current) {
        globalThis.clearTimeout(commitTimerRef.current);
      }
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!open || !autocompleteEnabled || !field || !reportWindow) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const debounceMs = inputValue.trim() ? SUGGEST_DEBOUNCE_MS : 150;
    const timer = globalThis.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setFetchError(null);

      void fetchReportFilterAutocomplete({
        layer,
        window: reportWindow,
        field,
        search: inputValue,
        filters,
        excludeFilterIndex: filterIndex,
      })
        .then((results) => {
          if (cancelled || controller.signal.aborted) return;
          setSuggestions(results);
        })
        .catch((error: unknown) => {
          if (cancelled || controller.signal.aborted) return;
          setSuggestions([]);
          const message =
            error instanceof Error ? error.message : "Unable to load suggestions.";
          setFetchError(message);
        })
        .finally(() => {
          if (!cancelled && !controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      globalThis.clearTimeout(timer);
    };
  }, [
    open,
    autocompleteEnabled,
    layer,
    reportWindow,
    field,
    inputValue,
    filtersKey,
    filters,
    filterIndex,
  ]);

  const showSuggestions = open && autocompleteEnabled;

  const updateMenuPosition = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    const viewportHeight = globalThis.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - MENU_GAP_PX;
    const spaceAbove = rect.top - MENU_GAP_PX;
    const openUp = spaceBelow < MENU_MAX_HEIGHT_PX && spaceAbove > spaceBelow;
    const maxHeight = Math.min(
      MENU_MAX_HEIGHT_PX,
      Math.max(80, openUp ? spaceAbove : spaceBelow),
    );

    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      maxHeight,
      ...(openUp
        ? { bottom: viewportHeight - rect.top + MENU_GAP_PX }
        : { top: rect.bottom + MENU_GAP_PX }),
    });
  }, []);

  useLayoutEffect(() => {
    if (!showSuggestions) return;

    updateMenuPosition();
    const onReposition = () => updateMenuPosition();
    globalThis.addEventListener("resize", onReposition);
    globalThis.addEventListener("scroll", onReposition, true);
    return () => {
      globalThis.removeEventListener("resize", onReposition);
      globalThis.removeEventListener("scroll", onReposition, true);
    };
  }, [showSuggestions, updateMenuPosition, suggestions.length, loading]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);
    setOpen(true);
    scheduleCommit(nextValue);
  };

  const handleSelect = (suggestion: string) => {
    if (commitTimerRef.current) {
      globalThis.clearTimeout(commitTimerRef.current);
    }
    setInputValue(suggestion);
    commitToParent(suggestion);
    setOpen(false);
  };

  const handleBlur = () => {
    if (commitTimerRef.current) {
      globalThis.clearTimeout(commitTimerRef.current);
    }
    commitToParent(inputValue);
  };

  const suggestionMenu =
    showSuggestions && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="pointer-events-auto overflow-hidden rounded border border-[#d0d0d0] bg-white shadow-lg"
          >
          <ul
            id={listId}
            role="listbox"
            className="m-0 max-h-[inherit] list-none overflow-y-auto p-0"
          >
            {loading ? (
              <li className="px-2 py-1.5 text-xs text-[#6f6f6f]">Loading suggestions...</li>
            ) : null}
            {!loading && fetchError ? (
              <li className="px-2 py-1.5 text-xs text-[#da1e28]">{fetchError}</li>
            ) : null}
            {!loading && !fetchError && suggestions.length === 0 ? (
              <li className="px-2 py-1.5 text-xs text-[#6f6f6f]">No matches</li>
            ) : null}
            {!loading
              ? suggestions.map((suggestion) => (
                  <li key={suggestion} role="option">
                    <button
                      type="button"
                      className="w-full px-2 py-1.5 text-left text-[13px] text-[#262626] hover:bg-[#f4f4f4]"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelect(suggestion)}
                    >
                      {suggestion}
                    </button>
                  </li>
                ))
              : null}
          </ul>
          </div>,
          document.body,
        )
      : null;

  if (!autocompleteEnabled) {
    return (
      <input
        value={inputValue}
        onChange={(event) => {
          const next = event.target.value;
          setInputValue(next);
          scheduleCommit(next);
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="h-9 w-full rounded border border-[#d0d0d0] px-2 text-[13px] text-[#262626]"
      />
    );
  }

  return (
    <div ref={rootRef} className="relative overflow-visible">
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          setOpen(true);
          requestAnimationFrame(() => {
            inputRef.current?.scrollIntoView({ block: "center", inline: "nearest" });
            updateMenuPosition();
          });
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={showSuggestions}
        className="h-9 w-full rounded border border-[#d0d0d0] px-2 text-[13px] text-[#262626]"
      />
      {showSuggestions ? (
        <div aria-hidden className="h-52 shrink-0" />
      ) : null}
      {suggestionMenu}
    </div>
  );
}
