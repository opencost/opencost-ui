import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useTheme } from "../context/ThemeContext";

const Header = (props) => {
  const { title, breadcrumbs, headerTitle } = props;
  const { colors } = useTheme();

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexFlow: "row",
        width: "100%",
        marginTop: "10px",
      }}
    >
      <Typography variant="h3" style={{ marginBottom: "10px", color: colors.text }}>
        {headerTitle}
      </Typography>
      <div style={{ flex: "1 0 auto" }}>
        {title && <Typography variant="h4" style={{ color: colors.text }}>{title}</Typography>}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ "& .MuiBreadcrumbs-separator": { color: colors.textSecondary } }}>
            {breadcrumbs.slice(0, breadcrumbs.length - 1).map((b) => (
              <Link color="inherit" href={b.href} key={b.name} sx={{ color: colors.textSecondary }}>
                {b.name}
              </Link>
            ))}
            <Typography sx={{ color: colors.text }}>
              {breadcrumbs[breadcrumbs.length - 1].name}
            </Typography>
          </Breadcrumbs>
        )}
      </div>
      <div style={{ flex: "0 0 auto" }}>{props.children}</div>
    </div>
  );
};

export default Header;
