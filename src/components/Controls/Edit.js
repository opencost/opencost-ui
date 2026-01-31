import React from "react";
import { Dropdown } from "@carbon/react";

const EditControl = ({ label = "", value, onChange, options = [] }) => {
  // Guard against undefined options
  if (!options || options.length === 0) {
    return (
      <div style={{ marginBottom: "1rem", minWidth: "200px" }}>
        <Dropdown
          id={`dropdown-${(label || "control").replace(/\s+/g, "-").toLowerCase()}`}
          titleText={label}
          label="Loading..."
          items={[]}
          disabled={true}
        />
      </div>
    );
  }

  const selectedItem = options.find((opt) => opt.value === value) || options[0];

  return (
    <div style={{ marginBottom: "1rem", minWidth: "200px" }}>
      <Dropdown
        id={`dropdown-${(label || "control").replace(/\s+/g, "-").toLowerCase()}`}
        titleText={label}
        label={label}
        items={options}
        itemToString={(item) => (item ? item.name : "")}
        selectedItem={selectedItem}
        onChange={({ selectedItem }) => {
          if (selectedItem) {
            onChange(selectedItem.value);
          }
        }}
      />
    </div>
  );
};

export default EditControl;
