import React from "react";
import {
  Header,
  HeaderMenuButton,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
} from "@carbon/react";
import { Notification } from "@carbon/icons-react";
import { useNavigate } from "react-router";
import ThemeToggle from "./ThemeToggle";

const logo = new URL("../images/logo.png", import.meta.url).href;

const AppHeader = ({ isSideNavExpanded, onToggleSideNav }) => {
  const navigate = useNavigate();

  return (
    <Header aria-label="OpenCost">
      <HeaderMenuButton
        aria-label="Open menu"
        isActive={isSideNavExpanded}
        onClick={onToggleSideNav}
      />
      <HeaderName
        href="/"
        prefix=""
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
      >
        <img src={logo} alt="OpenCost" style={{ height: "20px" }} />
      </HeaderName>
      <HeaderGlobalBar>
        <ThemeToggle />
        <HeaderGlobalAction
          aria-label="Notifications"
          tooltipAlignment="end"
          onClick={() => {}}
        >
          <Notification size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </Header>
  );
};

export default AppHeader;
