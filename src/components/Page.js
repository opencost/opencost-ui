import * as React from "react";
import { useLocation } from "react-router";
import { SidebarNav } from "./Nav/SidebarNav";
import AppHeader from "./AppHeader";

const Page = (props) => {
  const { pathname } = useLocation();
  const [isSideNavExpanded, setIsSideNavExpanded] = React.useState(true);

  const handleSideNavToggle = () => {
    setIsSideNavExpanded((prev) => !prev);
  };

  return (
    <>
      <AppHeader
        isSideNavExpanded={isSideNavExpanded}
        onClickSideNavExpand={handleSideNavToggle}
      />
      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 3rem)",
          paddingTop: "3rem",
          margin: 0,
          backgroundColor: "var(--opencost-background)",
        }}
      >
        <SidebarNav
          active={pathname}
          isSideNavExpanded={isSideNavExpanded}
          onSideNavToggle={handleSideNavToggle}
        />
        <div
          style={{
            display: "flex",
            flexFlow: "column",
            flexGrow: 1,
            marginLeft: isSideNavExpanded ? "16rem" : "0",
            minHeight: "calc(100vh - 3rem)",
            transition: "margin-left 0.2s ease",
            backgroundColor: "var(--opencost-background)",
          }}
        >
          <div
            style={{
              position: "relative",
              flexGrow: 1,
              overflowX: "auto",
              overflowY: "visible",
              paddingLeft: "2rem",
              paddingRight: "2rem",
              paddingTop: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexFlow: "column",
                flexGrow: 1,
              }}
            >
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
