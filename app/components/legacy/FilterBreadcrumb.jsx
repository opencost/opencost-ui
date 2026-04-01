import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const FilterBreadcrumb = ({ filters, onNavigate }) => {
  if (!filters || filters.length === 0) {
    return null;
  }

  const hierarchy = [
    "namespace",
    "controllerKind",
    "controllerName",
    "pod",
    "container",
  ];
  const hierarchyLabels = {
    namespace: "Namespace",
    controllerKind: "Controller Kind",
    controllerName: "Controller",
    pod: "Pod",
    container: "Container",
  };

  const breadcrumbItems = [
    {
      label: "All Results",
      level: -1,
      isClickable: true,
    },
  ];

  // Build breadcrumb items from filters
  filters.forEach((filter, index) => {
    const property = filter.property;
    const value = filter.value;
    const level = hierarchy.indexOf(property);

    if (level >= 0) {
      breadcrumbItems.push({
        label: value,
        level: index,
        property: property,
        isClickable: index < filters.length - 1, // Last item is not clickable
      });
    }
  });

  const handleClick = (event, item) => {
    event.preventDefault();
    if (item.isClickable && onNavigate) {
      onNavigate(item.level);
    }
  };

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="filter breadcrumb"
      sx={{ marginTop: 1, marginBottom: 1 }}
    >
      {breadcrumbItems.map((item, index) => {
        const key = `${item.level}-${item.label}-${index}`;
        if (item.isClickable) {
          return (
            <Link
              key={key}
              component="button"
              variant="body2"
              onClick={(e) => handleClick(e, item)}
              sx={{
                cursor: "pointer",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {item.label}
            </Link>
          );
        } else {
          return (
            <Typography key={key} variant="body2" color="text.primary">
              {item.label}
            </Typography>
          );
        }
      })}
    </Breadcrumbs>
  );
};

export default React.memo(FilterBreadcrumb);
