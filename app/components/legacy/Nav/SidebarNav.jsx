import * as React from "react";
import { Drawer, List } from "@mui/material";

import { NavItem } from "./NavItem";
import { BarChart, Cloud } from "@mui/icons-material";

const logo = "/logo.png";

const DRAWER_WIDTH = 200;

const SidebarNav = ({ active }) => {
  const [init, setInit] = React.useState(false);

  React.useEffect(() => {
    if (!init) {
      setInit(true);
    }
  }, [init]);

  const isLegacyMode = import.meta.env.VITE_LEGACY_MODE === "true";
  const top = [
    {
      name: "Cost Allocation",
      href: isLegacyMode ? "/" : "/allocation",
      icon: <BarChart />,
    },
    { name: "Cloud Costs", href: "/cloud", icon: <Cloud /> },
    { name: "External Costs", href: "/external-costs", icon: <Cloud /> },
  ];

  return (
    <Drawer
      anchor={"left"}
      open
      sx={{
        flexShrink: 0,
        width: DRAWER_WIDTH,
        "& .MuiDrawer-paper": {
          backgroundColor: "inherit",
          border: 0,
          width: DRAWER_WIDTH,
          paddingTop: "2.5rem",
        },
      }}
      variant="permanent"
    >
      <img
        src={logo}
        alt="OpenCost"
        style={{ flexShrink: 1, padding: "1rem" }}
      />
      <List style={{ flexGrow: 1 }}>
        {top.map((l) => (
          <NavItem active={active === `${l.href}`} key={l.name} {...l} />
        ))}
      </List>
    </Drawer>
  );
};

export { SidebarNav };
