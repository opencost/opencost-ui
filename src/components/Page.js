import { useLocation } from "react-router";
import { SidebarNav } from "./Nav/SidebarNav";
import ThemeToggle from "./ThemeToggle";

const Page = (props) => {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        display: "flex",
        overflowY: "scroll",
        margin: "0px",
        backgroundColor: "var(--bg-primary)",
        minHeight: "100vh",
        transition: "background-color 0.2s ease",
      }}
    >
      <SidebarNav active={pathname} />
      <div
        style={{
          display: "flex",
          flexFlow: "column",
          flexGrow: 1,
        }}
      >
        {/* Theme toggle in top right corner - hidden on assets page */}
        {pathname !== '/assets' && (
          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "2rem",
              zIndex: 100,
            }}
          >
            <ThemeToggle />
          </div>
        )}
        <div
          style={{
            position: "relative",
            height: "100vh",
            flexGrow: 1,
            overflowX: "auto",
            paddingLeft: "2rem",
            paddingRight: "2rem",
            paddingTop: "2.5rem",
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
  );
};

export default Page;
