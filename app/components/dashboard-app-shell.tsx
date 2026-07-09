import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  HomeOutlined,
  ChevronLeft,
  ChevronRight,
  Search,
  Close,
  DashboardOutlined,
  DescriptionOutlined,
  SettingsOutlined,
  LightModeOutlined,
  DarkModeOutlined,
} from "@mui/icons-material";
import { useDashboard } from "~/components/dashboard-context";
import { useReport } from "~/components/report-context";
import { useTutorialWizardOptional } from "~/components/tutorial-wizard-context";
import { useAppTheme } from "~/components/theme-context";

interface DashboardAppShellProps {
  children: ReactNode;
  /** Optional page title shown in the top header breadcrumb */
  pageTitle?: string;
}

interface SearchEntry {
  id: string;
  label: string;
  type: "page" | "dashboard" | "report";
  icon: ReactNode;
  href?: string;
  keywords?: string[];
}

function NavLink({
  href,
  label,
  icon,
  active,
  nested = false,
  collapsed = false,
  tutorialPulse = false,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  nested?: boolean;
  collapsed?: boolean;
  tutorialPulse?: boolean;
}) {
  const activeClass = active ? "v2-nav-item v2-nav-item--active" : "v2-nav-item";
  const nestedClass = nested && !collapsed ? "ml-4" : "";
  const tutorialClass = tutorialPulse
    ? "relative z-[2] shadow-[0_0_0_2px_#0f62fe,0_4px_20px_rgba(15,98,254,0.25)]"
    : "";

  return (
    <Link
      to={href}
      className={`${activeClass} ${nestedClass} ${tutorialClass}`}
      title={collapsed ? label : undefined}
    >
      <span className="inline-flex items-center flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function NavGroupLabel({
  label,
  icon,
  collapsed = false,
}: {
  label: string;
  icon: ReactNode;
  collapsed?: boolean;
}) {
  if (collapsed) return null;
  return (
    <div className="v2-nav-group-label">
      <span className="inline-flex items-center flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/dashboards": "Dashboards",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function DashboardAppShell({
  children,
  pageTitle,
}: DashboardAppShellProps) {
  const { pathname } = useLocation();
  const { dashboards } = useDashboard();
  const { reports } = useReport();
  const { theme, toggleTheme } = useAppTheme();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const homeActive = pathname === "/";
  const tutorial = useTutorialWizardOptional();
  const isTutorialActive = tutorial?.isTutorialActive ?? false;
  const navHighlight = tutorial?.navHighlight ?? null;

  useEffect(() => {
    if (navHighlight && collapsed) setCollapsed(false);
  }, [navHighlight, collapsed]);

  // Responsive sidebar collapse on resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dashboardsActive =
    pathname === "/dashboards" || pathname.startsWith("/dashboard/");
  const reportsActive =
    pathname === "/reports" || pathname.startsWith("/report/");
  const settingsActive = pathname === "/settings";

  // Derive contextual page title
  const resolvedPageTitle =
    pageTitle ??
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/dashboard/") ? "Dashboard" : null) ??
    (pathname.startsWith("/report/") ? "Report" : null) ??
    "OpenCost";

  const quickLinks = useMemo<SearchEntry[]>(
    () => [
      { id: "home", label: "Home", type: "page", icon: <HomeOutlined fontSize="small" />, href: "/" },
      { id: "dashboards", label: "Dashboards", type: "page", icon: <DashboardOutlined fontSize="small" />, href: "/dashboards" },
      { id: "reports", label: "Reports", type: "page", icon: <DescriptionOutlined fontSize="small" />, href: "/reports" },
      { id: "settings", label: "Settings", type: "page", icon: <SettingsOutlined fontSize="small" />, href: "/settings" },
    ],
    [],
  );

  const dashboardLinks = useMemo<SearchEntry[]>(
    () =>
      dashboards.map((d) => ({
        id: `dashboard-${d.id}`,
        label: d.name,
        type: "dashboard" as const,
        icon: <DashboardOutlined fontSize="small" />,
        href: `/dashboard/${d.id}`,
        keywords: [d.description, ...d.tags],
      })),
    [dashboards],
  );

  const allSearchEntries = useMemo(
    () => [
      ...quickLinks,
      ...dashboardLinks,
      ...reports.map((r) => ({
        id: `report-${r.id}`,
        label: r.name,
        type: "report" as const,
        icon: <DescriptionOutlined fontSize="small" />,
        href: `/report/${r.id}`,
        keywords: [r.description, ...r.tags],
      })),
    ],
    [quickLinks, dashboardLinks, reports],
  );

  const normalizedTerm = searchTerm.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    if (!normalizedTerm) return [];
    return allSearchEntries
      .map((entry) => {
        const text = [entry.label, ...(entry.keywords ?? [])].join(" ").toLowerCase();
        const idx = text.indexOf(normalizedTerm);
        if (idx === -1) return null;
        const startsWithLabel = entry.label.toLowerCase().startsWith(normalizedTerm);
        return { entry, score: Number(startsWithLabel) * 2 + Number(idx === 0) };
      })
      .filter((x): x is { entry: SearchEntry; score: number } => !!x)
      .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label))
      .map(({ entry }) => entry)
      .slice(0, 9);
  }, [allSearchEntries, normalizedTerm]);

  const displayEntries = normalizedTerm.length === 0 ? quickLinks : filteredEntries;

  useEffect(() => setSelectedIdx(-1), [searchTerm]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isEditable = (t: EventTarget | null) =>
        t instanceof HTMLElement &&
        (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isEditable(e.target)) {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }
      if (e.key === "Escape") setIsSearchOpen(false);

      if (!isSearchOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, displayEntries.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && selectedIdx >= 0) {
        const entry = displayEntries[selectedIdx];
        if (entry?.href) {
          window.location.href = entry.href;
          setIsSearchOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSearchOpen, displayEntries, selectedIdx]);

  useEffect(() => {
    if (!isSearchOpen) { setSearchTerm(""); return; }
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [isSearchOpen]);

  const closeSearch = () => setIsSearchOpen(false);

  const typeLabel: Record<SearchEntry["type"], string> = {
    page: "Page",
    dashboard: "Dashboard",
    report: "Report",
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--cds-background)" }}
    >
      <div className="flex min-h-screen">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside
          className={`sticky top-0 h-screen flex-shrink-0 flex flex-col gap-1 border-r pb-3 pt-3 transition-[width] duration-200 ${
            isTutorialActive ? "z-[2]" : ""
          } ${collapsed ? "w-[60px]" : "w-[240px]"}`}
          style={{
            background: "var(--cds-layer)",
            borderColor: "var(--cds-border-subtle)",
          }}
        >
          {/* Logo */}
          <div
            className={`flex items-center px-3 pb-3 pt-1 ${
              collapsed ? "justify-center" : "justify-start"
            }`}
          >
            {collapsed ? (
              <div
                className="flex h-7 w-7 items-center justify-center rounded"
                style={{ background: "var(--cds-button-primary)" }}
              >
                <span className="text-[11px] font-bold text-white">OC</span>
              </div>
            ) : (
              <img
                src="/logo.png"
                alt="OpenCost"
                className="h-5 w-auto"
                style={{
                  filter: theme === "g100"
                    ? "brightness(0) invert(1)"
                    : "none",
                  opacity: theme === "g100" ? 0.9 : 1,
                }}
              />
            )}
          </div>

          {/* Search trigger */}
          <div className="px-2 pb-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={`inline-flex h-8 items-center rounded border text-xs transition-colors ${
                collapsed
                  ? "w-full justify-center px-0"
                  : "w-full justify-start gap-2 px-2.5"
              }`}
              style={{
                background: "var(--cds-layer-02)",
                borderColor: "var(--cds-border-subtle)",
                color: "var(--cds-text-placeholder)",
              }}
              title="Search"
            >
              <Search sx={{ fontSize: 14 }} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Search…</span>
                  <span
                    className="ml-auto rounded px-1 text-[10px]"
                    style={{
                      background: "var(--cds-layer-accent)",
                      color: "var(--cds-text-secondary)",
                    }}
                  >
                    /
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pr-1.5">
            <NavLink
              href="/"
              label="Home"
              icon={<HomeOutlined sx={{ fontSize: 16 }} />}
              active={homeActive}
              collapsed={collapsed}
            />
            <NavGroupLabel
              label="Reporting"
              icon={<DashboardOutlined sx={{ fontSize: 16 }} />}
              collapsed={collapsed}
            />
            <NavLink
              href="/dashboards"
              label="Dashboards"
              icon={<DashboardOutlined sx={{ fontSize: 16 }} />}
              active={dashboardsActive}
              nested
              collapsed={collapsed}
              tutorialPulse={isTutorialActive && navHighlight === "dashboards"}
            />
            <NavLink
              href="/reports"
              label="Reports"
              icon={<DescriptionOutlined sx={{ fontSize: 16 }} />}
              active={reportsActive}
              nested
              collapsed={collapsed}
              tutorialPulse={isTutorialActive && navHighlight === "reports"}
            />

            <div
              className="mt-auto"
              style={{ borderTop: "1px solid var(--cds-border-subtle)" }}
            />
            <NavLink
              href="/settings"
              label="Settings"
              icon={<SettingsOutlined sx={{ fontSize: 16 }} />}
              active={settingsActive}
              collapsed={collapsed}
            />
          </nav>

          {/* Collapse toggle */}
          <div className="px-2 pt-1">
            <button
              className="inline-flex h-7 w-7 items-center justify-center rounded border transition-colors"
              style={{
                background: "var(--cds-layer-02)",
                borderColor: "var(--cds-border-subtle)",
                color: "var(--cds-text-secondary)",
              }}
              onClick={() => setCollapsed((p) => !p)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight sx={{ fontSize: 14 }} />
              ) : (
                <ChevronLeft sx={{ fontSize: 14 }} />
              )}
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────── */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {isTutorialActive && (
            <div
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{ background: "rgba(22, 22, 22, 0.25)" }}
              aria-hidden
            />
          )}

          {/* Header */}
          <header
            className="sticky top-0 z-50 flex h-10 min-h-10 items-center justify-between gap-4 border-b px-5"
            style={{
              background: "var(--cds-layer)",
              borderColor: "var(--cds-border-subtle)",
            }}
          >
            {/* Breadcrumb / page title */}
            <div className="relative z-[2] min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--cds-text-secondary)" }}
                >
                  OpenCost
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--cds-border-strong)" }}
                >
                  /
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--cds-text-primary)" }}
                >
                  {resolvedPageTitle}
                </span>
              </div>
            </div>

            {/* Header actions */}
            <div className="relative z-[2] flex flex-shrink-0 items-center gap-1.5">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-7 w-7 items-center justify-center rounded border transition-colors"
                style={{
                  background: "var(--cds-layer-02)",
                  borderColor: "var(--cds-border-subtle)",
                  color: "var(--cds-text-secondary)",
                }}
                title={theme === "g100" ? "Switch to light mode" : "Switch to dark mode"}
                aria-label="Toggle theme"
              >
                {theme === "g100" ? (
                  <LightModeOutlined sx={{ fontSize: 14 }} />
                ) : (
                  <DarkModeOutlined sx={{ fontSize: 14 }} />
                )}
              </button>
            </div>
          </header>

          <section className="relative z-[2] min-w-0 flex-1">{children}</section>
        </div>
      </div>

      {/* ── Search modal ─────────────────────────────────────── */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[1200] flex items-start justify-center px-4 pt-16"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-[680px] overflow-hidden rounded-lg border"
            style={{
              background: "var(--cds-layer)",
              borderColor: "var(--cds-border-subtle)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input row */}
            <div
              className="flex items-center gap-2 border-b px-4 py-3"
              style={{ borderColor: "var(--cds-border-subtle)" }}
            >
              <Search
                sx={{ fontSize: 18, flexShrink: 0 }}
                style={{ color: "var(--cds-text-secondary)" }}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dashboards, reports, pages…"
                className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                style={{ color: "var(--cds-text-primary)" }}
              />
              {searchTerm.length > 0 ? (
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded"
                  style={{
                    background: "var(--cds-layer-hover)",
                    color: "var(--cds-text-secondary)",
                  }}
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <Close sx={{ fontSize: 14 }} />
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex h-6 items-center justify-center rounded px-1.5 text-[10px]"
                  style={{
                    background: "var(--cds-layer-02)",
                    border: "1px solid var(--cds-border-subtle)",
                    color: "var(--cds-text-secondary)",
                  }}
                  onClick={closeSearch}
                >
                  ESC
                </button>
              )}
            </div>

            {/* Results */}
            <div className="px-2 py-2">
              <p
                className="px-2 pb-1 text-xs font-medium"
                style={{ color: "var(--cds-text-secondary)" }}
              >
                {normalizedTerm.length === 0 ? "Quick Links" : "Results"}
              </p>

              {displayEntries.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  {displayEntries.map((entry, i) => {
                    const isSelected = i === selectedIdx;
                    if (entry.href) {
                      return (
                        <Link
                          key={entry.id}
                          to={entry.href}
                          className="flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors"
                          style={{
                            background: isSelected
                              ? "var(--cds-layer-selected)"
                              : "transparent",
                            color: isSelected
                              ? "var(--cds-text-primary)"
                              : "var(--cds-text-secondary)",
                          }}
                          onClick={closeSearch}
                          onMouseEnter={() => setSelectedIdx(i)}
                        >
                          <span className="inline-flex items-center flex-shrink-0">
                            {entry.icon}
                          </span>
                          <span style={{ color: "var(--cds-text-primary)" }}>
                            {entry.label}
                          </span>
                          <span className="ml-auto text-xs" style={{ color: "var(--cds-text-secondary)" }}>
                            {typeLabel[entry.type]}
                          </span>
                        </Link>
                      );
                    }
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2.5 rounded px-3 py-2 text-sm"
                        style={{ color: "var(--cds-text-secondary)" }}
                      >
                        <span className="inline-flex items-center">{entry.icon}</span>
                        <span>{entry.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : normalizedTerm.length > 0 ? (
                <div
                  className="rounded border border-dashed px-3 py-4 text-center text-sm"
                  style={{
                    borderColor: "var(--cds-border-subtle)",
                    color: "var(--cds-text-placeholder)",
                  }}
                >
                  No results for &ldquo;{searchTerm}&rdquo;
                </div>
              ) : null}
            </div>

            {/* Footer hint */}
            <div
              className="flex items-center gap-3 border-t px-4 py-2"
              style={{
                borderColor: "var(--cds-border-subtle)",
                background: "var(--cds-layer-02)",
              }}
            >
              {[
                ["↑↓", "Navigate"],
                ["↵", "Open"],
                ["Esc", "Close"],
              ].map(([key, label]) => (
                <span
                  key={key}
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "var(--cds-text-secondary)" }}
                >
                  <kbd
                    className="rounded px-1 text-[10px]"
                    style={{
                      background: "var(--cds-layer)",
                      border: "1px solid var(--cds-border-subtle)",
                    }}
                  >
                    {key}
                  </kbd>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
