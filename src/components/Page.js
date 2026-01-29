import { useLocation } from "react-router";
import { SidebarNav } from "./Nav/SidebarNav";
import { useTheme } from "../context/ThemeContext";

const Page = (props) => {
  const { pathname } = useLocation();
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        overflowY: "scroll",
        margin: "0px",
        backgroundColor: colors.background,
      }}
    >
      <SidebarNav active={pathname} />
      <div
        style={{
          display: "flex",
          flexFlow: "column",
          flexGrow: 1,
          backgroundColor: colors.background,
        }}
      >
        <div
          style={{
            position: "relative",
            height: "100vh",
            flexGrow: 1,
            overflowX: "auto",
            paddingLeft: "2rem",
            paddingRight: "1rem",
            paddingTop: "2.5rem",
            backgroundColor: colors.background,
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
