import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import WarningIcon from "@mui/icons-material/Warning";

const Warnings = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <Paper>
      <List>
        {warnings.map((warn, i) => (
          <ListItem key={i}>
            <ListItemIcon>
              <WarningIcon />
            </ListItemIcon>
            <ListItemText primary={warn.primary} secondary={warn.secondary} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Warnings;
