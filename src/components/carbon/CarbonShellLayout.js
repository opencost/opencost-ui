import React from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
} from "@carbon/react";
import {
  Sun,
  Moon,
  Notification,
  Home,
  ChartColumn,
  Cloud,
  Money,
  DataTable,
} from "@carbon/icons-react";

const logoSrc = new URL("../../images/logo.png", import.meta.url).href;
const brandGreen = "#013927";

const navItems = [
  { id: "overview", label: "Overview", path: "/", icon: Home },
  { id: "allocation", label: "Cost Allocation", path: "/allocation", icon: ChartColumn },
  { id: "cloud", label: "Cloud Costs", path: "/cloud", icon: Cloud },
  { id: "external-costs", label: "External Costs", path: "/external-costs", icon: Money },
  { id: "assets", label: "Assets", path: "/assets", icon: DataTable },
];

const getActiveIdFromPathname = (pathname) => {
  if (pathname === "/") {
    return "overview";
  }

  const match = navItems.find((item) =>
    pathname.startsWith(item.path) && item.path !== "/",
  );

  return match ? match.id : "overview";
};

const CarbonShellLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeId = getActiveIdFromPathname(location.pathname);

  const [theme, setTheme] = React.useState(() => {
    if (typeof window === "undefined") {
      return "g10";
    }
    const stored = window.localStorage.getItem("opencost-theme");
    if (stored === "g10" || stored === "g90") {
      return stored;
    }
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "g90"
      : "g10";
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("opencost-theme", theme);
    }
  }, [theme]);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    // Apply theme at the document root so Carbon theme selectors work reliably.
    document.documentElement.setAttribute("data-carbon-theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((current) => (current === "g10" ? "g90" : "g10"));
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <SkipToContent />
      <Header aria-label="OpenCost">
        <HeaderName prefix="">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <img
              src={logoSrc}
              alt="OpenCost"
              style={{ height: 24, width: "auto", display: "block" }}
            />
          </span>
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Toggle light and dark theme"
            onClick={handleToggleTheme}
          >
            {theme === "g10" ? (
              <Moon size={20} style={{ color: brandGreen }} />
            ) : (
              <Sun size={20} style={{ color: brandGreen }} />
            )}
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="end">
            <Notification size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <SideNav aria-label="OpenCost navigation" expanded>
        <SideNavItems>
          {navItems.map((item) => (
            // eslint-disable-next-line react/jsx-key
            <SideNavLink
              key={item.id}
              className="opencost-sidenav-link"
              isActive={item.id === activeId}
              onClick={(event) => {
                event.preventDefault();
                if (location.pathname !== item.path) {
                  navigate(item.path);
                }
              }}
              href={item.path}
            >
              {item.icon ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: item.id === activeId ? brandGreen : "inherit",
                  }}
                >
                  <item.icon
                    size={16}
                    style={{
                      color: item.id === activeId ? brandGreen : "inherit",
                    }}
                  />
                  <span>{item.label}</span>
                </span>
              ) : (
                item.label
              )}
            </SideNavLink>
          ))}
        </SideNavItems>
      </SideNav>
      <Content id="main-content">{children}</Content>
    </div>
  );
};

export default CarbonShellLayout;

