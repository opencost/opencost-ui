import { SideNav, SideNavLink } from "@carbon/react";
import { ChartColumn, CloudDataOps, LayersExternal, IbmCloudBareMetalServer } from "@carbon/icons-react";

const logo = new URL("../../images/logo.png", import.meta.url).href;

const SidebarNav = ({ active }) => (
  <>
    <SideNav isFixedNav expanded={true} isChildOfHeader={false} aria-label="Side navigation">
      <img src={logo} alt="OpenCost" style={{ margin: '10px' }} />
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
    </SideNav>
  </>
);

export { SidebarNav };
