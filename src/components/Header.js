import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useColorMode } from "../contexts/ThemeContext";
import { useTheme } from "@mui/material/styles";

const Header = (props) => {
  const { title, breadcrumbs, headerTitle } = props;
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexFlow: "row",
        width: "100%",
        marginTop: "10px",
        paddingLeft: "0.5rem",
      }}
    >
      <Typography variant="h1" style={{ marginBottom: "10px" }}>
        {headerTitle}
      </Typography>
      <div style={{ flex: "1 0 auto" }}>
        {title && <Typography variant="h4">{title}</Typography>}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs aria-label="breadcrumb">
            {breadcrumbs.slice(0, breadcrumbs.length - 1).map((b) => (
              <Link color="inherit" href={b.href} key={b.name}>
                {b.name}
              </Link>
            ))}
            <Typography color="text.primary">
              {breadcrumbs[breadcrumbs.length - 1].name}
            </Typography>
          </Breadcrumbs>
        )}
      </div>
      <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
        <Tooltip title={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}>
          <IconButton sx={{ ml: 1, mr: 1 }} onClick={toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        {props.children}
      </div>
    </div>
  );
};


export default Header;
