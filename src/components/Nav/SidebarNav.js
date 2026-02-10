import * as React from "react";
import { Drawer, List } from "@mui/material";

import { NavItem } from "./NavItem";
import { ChartLine, Cloud, Datastore } from "@carbon/icons-react";

const logo = new URL("../../images/logo.png", import.meta.url).href;

const DRAWER_WIDTH = 200;

const SidebarNav = ({ active }) => {
  const top = [
    { name: "Cost Allocation", href: "/allocation", icon: <ChartLine size={20} /> },
    { name: "Cloud Costs", href: "/cloud", icon: <Cloud size={20} /> },
    { name: "External Costs", href: "/external-costs", icon: <Cloud size={20} /> },
    { name: "Assets", href: "/assets", icon: <Datastore size={20} /> },
  ];

  return (
    <Drawer
      anchor={"left"}
      open
      sx={{
        flexShrink: 0,
        width: DRAWER_WIDTH,
        "& .MuiDrawer-paper": {
          backgroundColor: "var(--cds-layer-01, #ffffff)",
          border: 0,
          borderRight: "1px solid var(--cds-border-subtle-01, #e0e0e0)",
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
