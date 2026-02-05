import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link } from "react-router";

const NavItem = ({ active, href, name, onClick, secondary, title, icon }) => {
  const renderListItemCore = () => (
    <ListItem
      className={active ? "active" : ""}
      sx={{
        "&.MuiListItem-root:hover": {
          backgroundColor: "var(--sidebar-hover)",
        },
        "&.MuiListItem-root.active": {
          backgroundColor: "var(--sidebar-hover)",
        },
      }}
      onClick={(e) => {
        if (onClick) {
          onClick();
          e.stopPropagation();
        }
      }}
      title={title}
    >
      <ListItemIcon
        sx={{
          "&.MuiListItemIcon-root": {
            color: active ? "var(--sidebar-active)" : "var(--sidebar-text)",
            minWidth: 36,
          },
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        sx={{
          "& .MuiListItemText-primary": {
            color: active ? "var(--sidebar-active)" : "var(--sidebar-text)",
          },
        }}
        primary={name}
        secondary={secondary}
      />
    </ListItem>
  );

  return href && !active ? (
    <Link style={{ textDecoration: "none", color: "var(--sidebar-text)" }} to={`${href}`}>
      {renderListItemCore()}
    </Link>
  ) : (
    renderListItemCore()
  );
};

export { NavItem };
