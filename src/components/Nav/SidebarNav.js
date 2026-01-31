import * as React from "react";
import { Drawer, List, useTheme } from "@mui/material";

import { NavItem } from "./NavItem";
import { BarChart, Dns , Cloud } from "@mui/icons-material";

const logo = new URL("../../images/logo.png", import.meta.url).href;

const DRAWER_WIDTH = 230;

const SidebarNav = ({ active }) => {
  const [init, setInit] = React.useState(false);
  const theme = useTheme();

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
    { name: "Assets", href: "/assets", icon: <Dns /> },
  ];

  return (
    <Drawer
      anchor={"left"}
      open
      sx={{
        flexShrink: 0,
        width: DRAWER_WIDTH,
        "& .MuiDrawer-paper": {
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
          border: 0,
          borderRight: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          width: DRAWER_WIDTH,
          paddingTop: "2.5rem",
          boxShadow: theme.palette.mode === 'dark' 
            ? '2px 0 8px rgba(0, 0, 0, 0.5)' 
            : '2px 0 8px rgba(0, 0, 0, 0.1)',
        },
      }}
      variant="permanent"
    >
      <img
        src={logo}
        alt="OpenCost"
        style={{ 
          flexShrink: 1, 
          padding: "1rem",
          filter: theme.palette.mode === 'dark' ? 'brightness(0.9)' : 'none'
        }}
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
