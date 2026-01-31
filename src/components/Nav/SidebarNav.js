import React from "react";
import {
  SideNav,
  SideNavItems,
  SideNavLink,
} from "@carbon/react";
import {
  ChartBar,
  Cloud,
  CloudServiceManagement,
  DataTable,
} from "@carbon/icons-react";
import { useLocation, useNavigate } from "react-router";

const links = [
  { name: "Cost Allocation", href: "/allocation", icon: ChartBar },
  { name: "Cloud Costs", href: "/cloud", icon: Cloud },
  { name: "External Costs", href: "/external-costs", icon: CloudServiceManagement },
  { name: "Assets", href: "/assets", icon: DataTable },
];

const SidebarNav = ({ isSideNavExpanded, onToggleSideNav }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <SideNav
      aria-label="Side navigation"
      expanded={isSideNavExpanded}
      isFixedNav
      onOverlayClick={onToggleSideNav}
    >
      <SideNavItems>
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <SideNavLink
              key={item.name}
              href={item.href}
              isActive={active}
              renderIcon={Icon}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              large
            >
              {item.name}
            </SideNavLink>
          );
        })}
      </SideNavItems>
    </SideNav>
  );
};

export default SidebarNav;
