import { SideNavLink, SideNavMenuItem } from "@carbon/react";
import { Link as RouterLink } from "react-router";

const NavItem = ({ active, href, name, onClick, secondary, title, icon }) => {
  const Icon = icon;
  
  if (href && !active) {
    return (
      <RouterLink to={href} style={{ textDecoration: "none" }}>
        <SideNavLink
          renderIcon={Icon ? () => Icon : undefined}
          isActive={active}
          onClick={(e) => {
            if (onClick) {
              onClick();
              e.stopPropagation();
            }
          }}
          title={title}
        >
          {name}
        </SideNavLink>
      </RouterLink>
    );
  }

  return (
    <SideNavLink
      renderIcon={Icon ? () => Icon : undefined}
      isActive={active}
      onClick={(e) => {
        if (onClick) {
          onClick();
          e.stopPropagation();
        }
      }}
      title={title}
    >
      {name}
    </SideNavLink>
  );
};

export { NavItem };
