import { SideNav, SideNavLink, SideNavItems } from "@carbon/react";
import {
  ChartColumn,
  CloudDataOps,
  LayersExternal,
  IbmCloudBareMetalServer,
  Asleep,
  Light,
} from "@carbon/icons-react";
import { useTheme } from "../../context/ThemeContext";

const logo = new URL("../../images/logo.png", import.meta.url).href;

const SidebarNav = ({ active }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <SideNav
        isFixedNav
        expanded={true}
        isChildOfHeader={false}
        aria-label="Side navigation"
      >
        <img src={logo} alt="OpenCost" style={{ margin: "10px" }} />
        <SideNavItems>
          {[
            {
              icon: ChartColumn,
              href: "/allocation",
              label: "Cost Allocation",
            },
            {
              icon: CloudDataOps,
              href: "/cloud",
              label: "Cloud Costs",
            },
            {
              icon: LayersExternal,
              href: "/external-costs",
              label: "External Costs",
            },
            {
              icon: IbmCloudBareMetalServer,
              href: "/assets",
              label: "Assets",
            },
          ].map(({ icon, href, label }) => (
            <SideNavLink
              key={href}
              renderIcon={icon}
              href={href}
              aria-current={active === href ? "page" : undefined}
            >
              {label}
            </SideNavLink>
          ))}
          <SideNavLink
            renderIcon={theme === "g10" ? Asleep : Light}
            onClick={toggleTheme}
          >
            {theme === "g10" ? "Dark Mode" : "Light Mode"}
          </SideNavLink>
        </SideNavItems>
      </SideNav>
    </>
  );
};

export { SidebarNav };