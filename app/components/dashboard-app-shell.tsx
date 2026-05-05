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
} from "@mui/icons-material";
import { useDashboard } from "~/components/dashboard-context";
import { useReport } from "~/components/report-context";
import { useTutorialWizardOptional } from "~/components/tutorial-wizard-context";

interface DashboardAppShellProps {
  children: ReactNode;
}

interface SearchEntry {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  keywords?: string[];
}

function NavLinkEntry({
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
  const baseClasses =
    "flex min-h-10 items-center gap-2.5 no-underline rounded px-3 py-2 text-sm font-medium transition-colors";
  const toneClasses = active
    ? "bg-[#edf5ff] text-[#0f62fe]"
    : "text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]";
  const nestedClasses = nested ? "ml-5" : "";
  const tutorialClasses = tutorialPulse
    ? "relative z-[2] shadow-[0_0_0_2px_#0f62fe,0_4px_20px_rgba(15,98,254,0.25)] ring-0"
    : "";

  return (
    <Link
      to={href}
      className={`${baseClasses} ${toneClasses} ${nestedClasses} ${tutorialClasses}`}
      title={collapsed ? label : undefined}
    >
      <span className="inline-flex items-center">{icon}</span>
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  );
}

function NavGroupHeader({
  label,
  icon,
  collapsed = false,
}: {
  label: string;
  icon: ReactNode;
  collapsed?: boolean;
}) {
  return (
    <div
      className="flex min-h-10 items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#393939]"
      title={collapsed ? label : undefined}
    >
      <span className="inline-flex items-center">{icon}</span>
      {!collapsed ? <span>{label}</span> : null}
    </div>
  );
}

export default function DashboardAppShell({ children }: DashboardAppShellProps) {
  const { pathname } = useLocation();
  const { dashboards } = useDashboard();
  const { reports } = useReport();
  const [collapsed, setCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const homeActive = pathname === "/";
  const tutorial = useTutorialWizardOptional();
  const isTutorialActive = tutorial?.isTutorialActive ?? false;
  const navHighlight = tutorial?.navHighlight ?? null;

  useEffect(() => {
    if (navHighlight && collapsed) {
      setCollapsed(false);
    }
  }, [navHighlight, collapsed]);

  const dashboardsActive =
    pathname === "/dashboards" || pathname.startsWith("/dashboard/");
  const reportsActive = pathname === "/reports" || pathname.startsWith("/report/");
  const settingsActive = pathname === "/settings";
  const quickLinks = useMemo<SearchEntry[]>(
    () => [
      {
        id: "home",
        label: "Home",
        icon: <HomeOutlined fontSize="small" />,
        href: "/",
      },
      {
        id: "dashboards",
        label: "Dashboards",
        icon: <DashboardOutlined fontSize="small" />,
        href: "/dashboards",
      },
      {
        id: "reports",
        label: "Reports",
        icon: <DescriptionOutlined fontSize="small" />,
        href: "/reports",
      },
      {
        id: "settings",
        label: "Settings",
        icon: <SettingsOutlined fontSize="small" />,
        href: "/settings",
      },
    ],
    [],
  );
  const dashboardLinks = useMemo<SearchEntry[]>(
    () =>
      dashboards.map((dashboard) => ({
        id: `dashboard-${dashboard.id}`,
        label: `Dashboard: ${dashboard.name}`,
        icon: <DashboardOutlined fontSize="small" />,
        href: `/dashboard/${dashboard.id}`,
        keywords: [dashboard.description, ...dashboard.tags],
      })),
    [dashboards],
  );
  const allSearchEntries = useMemo(
    () => [
      ...quickLinks,
      ...dashboardLinks,
      ...reports.map((report) => ({
        id: `report-${report.id}`,
        label: `Report: ${report.name}`,
        icon: <DescriptionOutlined fontSize="small" />,
        href: `/report/${report.id}`,
        keywords: [report.description, ...report.tags],
      })),
    ],
    [quickLinks, dashboardLinks, reports],
  );
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredSearchEntries = useMemo(() => {
    if (!normalizedSearchTerm) {
      return [];
    }

    return allSearchEntries
      .map((entry) => {
        const searchableText = [entry.label, ...(entry.keywords ?? [])]
          .join(" ")
          .toLowerCase();
        const queryIndex = searchableText.indexOf(normalizedSearchTerm);
        if (queryIndex === -1) {
          return null;
        }

        const startsWithMatch = entry.label
          .toLowerCase()
          .startsWith(normalizedSearchTerm);
        const dashboardHintBoost =
          normalizedSearchTerm.includes("dashboard") &&
          entry.label.toLowerCase().includes("dashboard");

        return {
          entry,
          score: Number(startsWithMatch) * 2 + Number(dashboardHintBoost) + Number(queryIndex === 0),
        };
      })
      .filter((entry): entry is { entry: SearchEntry; score: number } => !!entry)
      .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label))
      .map(({ entry }) => entry)
      .slice(0, 9);
  }, [allSearchEntries, normalizedSearchTerm]);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      );
    };

    const onGlobalKeydown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", onGlobalKeydown);
    return () => {
      window.removeEventListener("keydown", onGlobalKeydown);
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchTerm("");
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 20);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isSearchOpen]);

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  const renderSearchEntry = (entry: SearchEntry) => {
    const baseClasses =
      "flex min-h-10 items-center gap-2 rounded px-3 py-2 text-sm text-[#262626]";
    if (entry.href) {
      return (
        <Link
          key={entry.id}
          to={entry.href}
          className={`${baseClasses} hover:bg-[#f4f4f4]`}
          onClick={closeSearch}
        >
          <span className="inline-flex items-center text-[#525252]">{entry.icon}</span>
          <span>{entry.label}</span>
        </Link>
      );
    }

    return (
      <div key={entry.id} className={`${baseClasses} cursor-default text-[#8d8d8d]`}>
        <span className="inline-flex items-center">{entry.icon}</span>
        <span>{entry.label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="flex min-h-screen">
        <aside
          className={`relative flex min-h-screen flex-shrink-0 flex-col gap-2 border-r border-[#e0e0e0] bg-white px-2 pb-2 pt-2.5 transition-[width] duration-200 ${
            isTutorialActive ? "z-[2]" : ""
          } ${collapsed ? "w-[72px]" : "w-[250px]"}`}
        >
          <div className="flex items-center justify-start px-2 pb-2.5 pt-2">
            <img src="/logo.png" alt="OpenCost" className="h-6 w-auto" />
          </div>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={`mx-1 mb-2 inline-flex h-9 items-center rounded border border-[#d0d0d0] bg-[#f4f4f4] px-2.5 text-left text-xs text-[#6f6f6f] ${
              collapsed ? "w-9 justify-center px-0" : "w-auto justify-start"
            }`}
            title="Search"
          >
            <Search fontSize="small" />
            {!collapsed ? (
              <>
                <span className="ml-2">Search</span>
                <span className="ml-auto text-[11px] text-[#8d8d8d]">/</span>
              </>
            ) : null}
          </button>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
            <NavLinkEntry
              href="/"
              label="Home"
              icon={<HomeOutlined fontSize="small" />}
              active={homeActive}
              collapsed={collapsed}
            />
            <NavGroupHeader
              label="Reporting Engine"
              icon={<DashboardOutlined fontSize="small" />}
              collapsed={collapsed}
            />
            <NavLinkEntry
              href="/dashboards"
              label="Dashboards"
              icon={<DashboardOutlined fontSize="small" />}
              active={dashboardsActive}
              nested
              collapsed={collapsed}
              tutorialPulse={isTutorialActive && navHighlight === "dashboards"}
            />
            <NavLinkEntry
              href="/reports"
              label="Reports"
              icon={<DescriptionOutlined fontSize="small" />}
              active={reportsActive}
              nested
              collapsed={collapsed}
              tutorialPulse={isTutorialActive && navHighlight === "reports"}
            />
            {/* <NavGroupHeader
              label="Resource Utilization"
              icon={<StorageOutlined fontSize="small" />}
              collapsed={collapsed}
            />
            <NavStaticEntry
              label="Compute"
              icon={<DnsOutlined fontSize="small" />}
              nested
              collapsed={collapsed}
            />
            <NavStaticEntry
              label="Database"
              icon={<StorageOutlined fontSize="small" />}
              nested
              collapsed={collapsed}
            />
            <NavStaticEntry
              label="Data Warehouse"
              icon={<DataObjectOutlined fontSize="small" />}
              nested
              collapsed={collapsed}
            />
            <NavStaticEntry
              label="Kubernetes"
              icon={<CloudQueueOutlined fontSize="small" />}
              nested
              collapsed={collapsed}
            />
            <NavStaticEntry
              label="Storage"
              icon={<SaveOutlined fontSize="small" />}
              nested
              collapsed={collapsed}
            /> */}
            {/* <NavStaticEntry
              label="Optimization Hub"
              icon={<InsightsOutlined fontSize="small" />}
              collapsed={collapsed}
            />
            <NavStaticEntry
              label="Anomaly Detection"
              icon={<WarningAmberOutlined fontSize="small" />}
              collapsed={collapsed}
            />
            <NavStaticEntry
              label="Case Management"
              icon={<CasesOutlined fontSize="small" />}
              collapsed={collapsed}
            /> */}
            <NavLinkEntry
              href="/settings"
              label="Settings"
              icon={<SettingsOutlined fontSize="small" />}
              active={settingsActive}
              collapsed={collapsed}
            />
          </nav>
          <button
            className="mx-1 mt-auto inline-flex h-7 w-7 items-center justify-center self-start rounded-full border border-[#e0e0e0] bg-white text-[#525252]"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col">
          {isTutorialActive ? (
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-[#161616]/25"
              aria-hidden
            />
          ) : null}
          <header className="sticky top-0 z-50 flex min-h-12 items-center justify-between gap-4 border-b border-[#e0e0e0] bg-white px-5 py-2">
            <div className="relative z-[2] min-w-0 flex-1">
              <div>
                <p className="m-0 text-sm font-semibold text-[#161616]">OpenCost</p>
                <p className="m-0 mt-0.5 text-xs text-[#6f6f6f]">
                  Kubernetes and cloud cost intelligence
                </p>
              </div>
            </div>
            <div className="relative z-[2] flex flex-shrink-0 items-center gap-2.5">
              {/* <button
                className="inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded border border-[#d0d0d0] bg-[#f4f4f4] px-2.5 text-xs text-[#6f6f6f]"
                disabled
              >
                <CalendarMonthOutlined fontSize="small" />
                <span>03/16/2026 - 04/15/2026</span>
              </button> */}
              {/* <button className="inline-flex h-8 items-center gap-1.5 rounded border border-[#0f62fe] bg-[#0f62fe] px-3 text-xs font-semibold text-white">
                <ShareOutlined fontSize="small" />
                <span>Share</span>
              </button>
              <button className="inline-flex h-8 items-center gap-1.5 border border-transparent px-1 text-xs text-[#393939]">
                <CampaignOutlined fontSize="small" />
                <span>What's New?</span>
              </button>
              <div className="ml-1 flex items-center gap-2 border-l border-[#e0e0e0] pl-3">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f0fe] text-[11px] font-bold text-[#0f62fe]">
                  AL
                </div>
                <p className="m-0 text-xs text-[#393939]">alexander.meijer@ibm.com</p>
              </div> */}
            </div> 
          </header>
          <section className="relative z-[2] min-w-0 flex-1">{children}</section>
        </div>
      </div>
      {isSearchOpen ? (
        <div
          className="fixed inset-0 z-[1200] flex items-start justify-center bg-black/35 px-4 pt-[72px]"
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-[760px] rounded-lg border border-[#e0e0e0] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pb-4 pt-5">
              <h2 className="m-0 text-[34px] font-normal leading-9 text-[#262626]">
                Search OpenCost
              </h2>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded text-[#525252] hover:bg-[#f4f4f4]"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <Close />
              </button>
            </div>
            <div className="px-5 pb-5">
              <div className="flex h-11 items-center rounded border-2 border-[#0f62fe] bg-white px-3">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search..."
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-base text-[#262626] outline-none"
                />
                {searchTerm.length > 0 ? (
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-[#8d8d8d] hover:bg-[#f4f4f4]"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <Close fontSize="small" />
                  </button>
                ) : (
                  <Search fontSize="small" className="text-[#8d8d8d]" />
                )}
              </div>

              <div className="mt-4">
                <p className="m-0 px-1 text-sm text-[#525252]">
                  {normalizedSearchTerm.length === 0 ? "Quick Links" : "Suggested Links"}
                </p>
                {normalizedSearchTerm.length === 0 ? (
                  <div className="mt-2 flex flex-col gap-0.5">{quickLinks.map(renderSearchEntry)}</div>
                ) : filteredSearchEntries.length > 0 ? (
                  <div className="mt-2 max-h-[220px] overflow-y-auto pr-1">
                    <div className="flex flex-col gap-0.5">
                      {filteredSearchEntries.map(renderSearchEntry)}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 rounded border border-dashed border-[#d0d0d0] px-3 py-2.5 text-sm text-[#6f6f6f]">
                    No matches found for "{searchTerm}".
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
