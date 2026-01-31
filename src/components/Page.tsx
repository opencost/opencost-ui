import React from "react";
import AppHeader from "./AppHeader";
import SidebarNav from "./Nav/SidebarNav";

const Page = ({ children }) => {
  const [isSideNavExpanded, setIsSideNavExpanded] = React.useState(true);

  const toggleSideNav = () => setIsSideNavExpanded((prev) => !prev);

  return (
    <>
      <AppHeader
        isSideNavExpanded={isSideNavExpanded}
        onToggleSideNav={toggleSideNav}
      />
      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 3rem)",
          paddingTop: "3rem",
          backgroundColor: "var(--cds-background, #f4f4f4)",
        }}
      >
        <SidebarNav
          isSideNavExpanded={isSideNavExpanded}
          onToggleSideNav={toggleSideNav}
        />
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            marginLeft: isSideNavExpanded ? "16rem" : "0",
            transition: "margin-left 0.2s ease",
            paddingLeft: "2rem",
            paddingRight: "2rem",
            backgroundColor: "var(--cds-background, #f4f4f4)",
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
};

export default Page;
