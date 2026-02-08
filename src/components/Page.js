import { useLocation } from "react-router";
import { SidebarNav } from "./Nav/SidebarNav";

const Page = (props) => {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        margin: "0px",
        backgroundColor: "#f3f3f3",
      }}
    >
      <SidebarNav active={pathname} />
      <div
        style={{
          display: "flex",
          flexFlow: "column",
          flexGrow: 1,
          height: "100%",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "relative",
            flexGrow: 1,
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            paddingLeft: "2rem",
            paddingRight: "2rem",
            paddingTop: "2.5rem",
            paddingBottom: "2rem"
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
