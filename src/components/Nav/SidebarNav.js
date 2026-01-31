import * as React from "react";
import { SideNav, SideNavItems, SideNavLink } from "@carbon/react";
import { ChartBar, Cloud, CloudServiceManagement, DataTable } from "@carbon/icons-react";
import { useNavigate } from "react-router";

const SidebarNav = ({ active, isSideNavExpanded, onSideNavToggle }) => {
  const navigate = useNavigate();

  const top = [
    {
      name: "Cost Allocation",
      href: "/allocation",
      icon: ChartBar,
    },
    { name: "Cloud Costs", href: "/cloud", icon: Cloud },
    { name: "External Costs", href: "/external-costs", icon: CloudServiceManagement },
    { name: "Assets", href: "/assets", icon: DataTable },
  ];

  const handleNavClick = (href, e) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <SideNav
      aria-label="Side navigation"
      expanded={isSideNavExpanded}
      isFixedNav
      onOverlayClick={onSideNavToggle}
    >
      <SideNavItems>
        {top.map((item) => {
          const IconComponent = item.icon;
          const isActive = active === item.href;
          
          return (
            <SideNavLink
              key={item.name}
              renderIcon={IconComponent}
              href={item.href}
              isActive={isActive}
              onClick={(e) => handleNavClick(item.href, e)}
            >
              {item.name}
            </SideNavLink>
          );
        })}
      </SideNavItems>
    </SideNav>
  );
};

export { SidebarNav };
