import * as React from "react";
import { Header, HeaderName, HeaderMenuButton, HeaderGlobalBar, HeaderGlobalAction } from "@carbon/react";
import { Notification } from "@carbon/icons-react";
import { useNavigate } from "react-router";

const logo = new URL("../images/logo.png", import.meta.url).href;

const AppHeader = ({ isSideNavExpanded, onClickSideNavExpand }) => {
  const navigate = useNavigate();

  return (
    <Header aria-label="OpenCost">
      <HeaderMenuButton
        aria-label="Open menu"
        onClick={onClickSideNavExpand}
        isActive={isSideNavExpanded}
      />
      <HeaderName href="/" prefix="" onClick={(e) => {
        e.preventDefault();
        navigate("/");
      }}>
        <img
          src={logo}
          alt="OpenCost"
          style={{ height: "20px" }}
        />
      </HeaderName>
      <HeaderGlobalBar>
        <HeaderGlobalAction
          aria-label="Notifications"
          onClick={() => {}}
          tooltipAlignment="end"
        >
          <Notification size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </Header>
  );
};

export default AppHeader;
