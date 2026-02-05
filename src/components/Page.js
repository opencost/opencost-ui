import { useLocation } from "react-router";
import { SidebarNav } from "./Nav/SidebarNav";

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
