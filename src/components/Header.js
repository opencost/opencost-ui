import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const Header = (props) => {
  const { title, breadcrumbs, headerTitle } = props;

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
      <Typography variant="h3" style={{ marginBottom: "10px", color: "var(--text-primary)" }}>
        {headerTitle}
      </Typography>
      <div style={{ flex: "1 0 auto" }}>
        {title && <Typography variant="h4" style={{ color: "var(--text-primary)" }}>{title}</Typography>}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs aria-label="breadcrumb">
            {breadcrumbs.slice(0, breadcrumbs.length - 1).map((b) => (
              <Link color="inherit" href={b.href} key={b.name} style={{ color: "var(--text-secondary)" }}>
                {b.name}
              </Link>
            ))}
            <Typography style={{ color: "var(--text-primary)" }}>
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
