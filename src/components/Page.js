import { useLocation } from "react-router";
import { Theme } from "@carbon/react";
import { SidebarNav } from "./Nav/SidebarNav";
import { useTheme } from "../context/ThemeContext";

const Page = (props) => {
  const { pathname } = useLocation();
  const { theme } = useTheme();

  return (
    <Theme theme={theme}>
      <div
        style={{
          display: "flex",
          overflowY: "auto",
          margin: "0px",
          height: "100vh",
          backgroundColor: "var(--cds-layer)",
          color: "var(--cds-text-primary)",
        }}
      >
        <SidebarNav active={pathname} />
        <div
          style={{
            display: "flex",
            flexFlow: "column",
            flexGrow: 1,
            marginLeft: 256,
            backgroundColor: "var(--cds-background)",
          }}
        >
          <div
            style={{
              position: "relative",
              flexGrow: 1,
              overflow: "auto",
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
    </Theme>
  );
};

export default Page;
