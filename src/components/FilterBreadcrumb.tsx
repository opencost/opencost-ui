import * as React from "react";
import { Breadcrumb, BreadcrumbItem } from "@carbon/react";

const FilterBreadcrumb = ({ filters, onNavigate }) => {
  if (!filters || filters.length === 0) {
    return null;
  }

  const hierarchy = ["namespace", "controllerKind", "controllerName", "pod", "container"];
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
    <Breadcrumb noTrailingSlash style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
      {breadcrumbItems.map((item, index) => {
        const key = `${item.level}-${item.label}-${index}`;
        const isCurrentPage = index === breadcrumbItems.length - 1;
        
        return (
          <BreadcrumbItem
            key={key}
            href="#"
            isCurrentPage={isCurrentPage}
            onClick={(e) => {
              if (item.isClickable) {
                handleClick(e, item);
              } else {
                e.preventDefault();
              }
            }}
            style={{
              cursor: item.isClickable ? "pointer" : "default",
            }}
          >
            {item.label}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default React.memo(FilterBreadcrumb);

