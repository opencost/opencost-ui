import * as React from "react";
import { Drawer, List } from "@mui/material";
import { NavItem } from "./NavItem";
import { BarChart, Cloud, Storage } from "@mui/icons-material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme } from "../../context/ThemeContext";

const logo = new URL("../../images/logo.png", import.meta.url).href;

const DRAWER_WIDTH = 200;

const SidebarNav = ({ active }) => {
  const { colors, isDark, toggleTheme } = useTheme();

  const top = [
    { name: "Cost Allocation", href: "/allocation", icon: <BarChart /> },
    { name: "Assets", href: "/assets", icon: <Storage /> },
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
          backgroundColor: colors.background,
          border: 0,
          width: DRAWER_WIDTH,
          paddingTop: "2.5rem",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        },
      }}
      variant="permanent"
    >
      <img
        src={logo}
        alt="OpenCost"
        style={{
          flexShrink: 0,
          padding: "1rem",
          filter: isDark ? "brightness(1.2)" : "none"
        }}
      />
      <List style={{ flexGrow: 1, overflow: "auto" }}>
        {top.map((l) => (
          <NavItem active={active === `${l.href}`} key={l.name} {...l} />
        ))}
      </List>

      {/* Theme Toggle - Fixed at bottom */}
      <div
        style={{
          padding: "1rem",
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: colors.background,
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.backgroundSecondary,
            color: colors.text,
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontSize: "0.875rem",
          }}
        >
          {isDark ? (
            <>
              <LightModeIcon fontSize="small" style={{ color: "#fbbf24" }} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <DarkModeIcon fontSize="small" style={{ color: "#6b7280" }} />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </Drawer>
  );
};

export { SidebarNav };
