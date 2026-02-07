import * as React from "react";
// import { makeStyles } from "@material-ui/styles";
import { upperFirst } from "lodash";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Typography from "@mui/material/Typography";
import { toVerboseTimeRange } from "../util";

// const useStyles = makeStyles({
//   root: {
//     "& > * + *": {
//       marginTop: 2,
//     },
//   },
//   link: {
//     cursor: "pointer",
//   },
// });

const Subtitle = ({ report, onClick, children }) => {
  // const classes = useStyles();
  const classes = {};

  // If children is provided, just render as simple text
  if (children) {
    return (
      <div className={classes.root}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {children}
        </Typography>
      </div>
    );
  }

  // Otherwise, render breadcrumb from report
  if (!report) return null;

  const { aggregateBy, window } = report;

  return (
    <div className={classes.root}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        onClick={onClick}
      >
        {aggregateBy && aggregateBy.length > 0 ? (
          <Typography>
            {toVerboseTimeRange(window)} by {upperFirst(aggregateBy)}
          </Typography>
        ) : (
          <Typography>{toVerboseTimeRange(window)}</Typography>
        )}
      </Breadcrumbs>
    </div>
  );
};

export default React.memo(Subtitle);
