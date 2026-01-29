import { useLocation } from "react-router";
import { SidebarNav } from "./Nav/SidebarNav";

const Page = (props) => {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        display: "flex",
        overflowY: "auto",
        margin: "0px",
        backgroundColor: "f3f3f3",
      }}
    >
      <SidebarNav active={pathname} />
      <div
        style={{
          display: "flex",
          flexFlow: "column",
          flexGrow: 1,
          marginLeft: 256,
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
  );
};

export default Page;
