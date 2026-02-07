import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link } from "react-router";

const NavItem = ({ active, href, name, onClick, secondary, title, icon }) => {
  const renderListItemCore = () => (
    <ListItem
      className={active ? "active" : ""}
      sx={{
        "&.MuiListItem-root:hover": {
          backgroundColor: "var(--cds-layer-hover-01, #ebebeb)",
        },
        "&.MuiListItem-root.active": {
          backgroundColor: "var(--cds-layer-active-01, #e1e1e1)",
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
            color: active ? "var(--cds-interactive, #346ef2)" : "var(--cds-text-secondary, #4e4e4e)",
            minWidth: 36,
          },
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        sx={{
          "& .MuiListItemText-primary": {
            color: active ? "var(--cds-interactive, #346ef2)" : "var(--cds-text-primary, inherit)",
          },
        }}
        primary={name}
        secondary={secondary}
      />
    </ListItem>
  );

  return href && !active ? (
    <Link style={{ textDecoration: "none", color: "var(--cds-text-primary, inherit)" }} to={`${href}`}>
      {renderListItemCore()}
    </Link>
  ) : (
    renderListItemCore()
  );
};

export { NavItem };
