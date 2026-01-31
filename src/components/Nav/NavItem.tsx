import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link } from "react-router";
import { useTheme } from "@mui/material/styles";

const NavItem = ({ active, href, name, onClick, secondary, title, icon }) => {
  const theme = useTheme();
  
  const renderListItemCore = () => (
    <ListItem
      className={active ? "active" : ""}
      sx={{
        "&.MuiListItem-root:hover": {
          backgroundColor: theme.palette.action.hover,
        },
        "&.MuiListItem-root.active": {
          backgroundColor: theme.palette.action.selected,
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
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            minWidth: 36,
          },
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        sx={{
          "& .MuiListItemText-primary": {
            color: active ? theme.palette.primary.main : "inherit",
          },
        }}
        primary={name}
        secondary={secondary}
      />
    </ListItem>
  );

  return href && !active ? (
    <Link style={{ textDecoration: "none", color: "inherit" }} to={`${href}`}>
      {renderListItemCore()}
    </Link>
  ) : (
    renderListItemCore()
  );
};

export { NavItem };
