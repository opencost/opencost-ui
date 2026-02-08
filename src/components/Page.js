import { useLocation } from "react-router";
import { SidebarNav } from "./Nav/SidebarNav";

const Page = (props) => {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        display: "flex",
        margin: "0px",
        backgroundColor: "f3f3f3",
        minHeight: "100vh",
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
            flexGrow: 1,
            paddingLeft: "2rem",
            paddingRight: "2rem",
            paddingTop: "2.5rem",
            paddingBottom: "2rem",
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
