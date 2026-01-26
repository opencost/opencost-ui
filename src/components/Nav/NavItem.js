import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link } from "react-router";
import { useTheme } from "../../context/ThemeContext";

const NavItem = ({ active, href, name, onClick, secondary, title, icon }) => {
  const { colors, isDark } = useTheme();

  const renderListItemCore = () => (
    <ListItem
      className={active ? "active" : ""}
      sx={{
        "&.MuiListItem-root:hover": {
          backgroundColor: colors.backgroundSecondary,
        },
        "&.MuiListItem-root.active": {
          backgroundColor: colors.backgroundSecondary,
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
            color: active ? colors.accent : colors.textSecondary,
            minWidth: 36,
          },
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        sx={{
          "& .MuiListItemText-primary": {
            color: active ? colors.accent : colors.text,
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
