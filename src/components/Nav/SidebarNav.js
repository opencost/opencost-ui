import * as React from "react";
import { Drawer, List } from "@mui/material";

import { NavItem } from "./NavItem";
import { BarChart, Cloud } from "@mui/icons-material";
// Import the Box icon from Carbon (or another suitable icon)
import { Box } from '@carbon/icons-react';

const logo = new URL("../../images/logo.png", import.meta.url).href;

const DRAWER_WIDTH = 200;

const SidebarNav = ({ active }) => {
  const [init, setInit] = React.useState(false);

  React.useEffect(() => {
    if (!init) {
      setInit(true);
    }
  }, [init]);

  const top = [
    {
      name: "Cost Allocation",
      href: "/allocation",
      icon: <BarChart />,
    },
    { name: "Cloud Costs", href: "/cloud", icon: <Cloud /> },
    { name: "External Costs", href: "/external-costs", icon: <Cloud /> },
    // ADD NEW ITEM:
  {
    name: "Assets",
    path: "/assets",
    icon: <Box />,
  },
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
