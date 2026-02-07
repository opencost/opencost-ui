import React from "react";
import { Dropdown } from "@carbon/react";
import { windowOptions, assetTypeOptions, categoryOptions } from "./tokens";

const AssetsControls = ({
  window,
  setWindow,
  assetType,
  setAssetType,
  category,
  setCategory,
}) => {
  return (
    <div className="assets-controls">
      <Dropdown
        id="assets-window-select"
        titleText="Time Range"
        label="Select time range"
        items={windowOptions}
        itemToString={(item) => (item ? item.name : "")}
        selectedItem={
          windowOptions.find((o) => o.value === window) || windowOptions[6]
        }
        onChange={({ selectedItem }) => setWindow(selectedItem.value)}
        size="md"
      />
      <Dropdown
        id="assets-type-filter"
        titleText="Asset Type"
        label="Filter by type"
        items={assetTypeOptions}
        itemToString={(item) => (item ? item.name : "")}
        selectedItem={
          assetTypeOptions.find((o) => o.value === assetType) ||
          assetTypeOptions[0]
        }
        onChange={({ selectedItem }) => setAssetType(selectedItem.value)}
        size="md"
      />
      <Dropdown
        id="assets-category-filter"
        titleText="Category"
        label="Filter by category"
        items={categoryOptions}
        itemToString={(item) => (item ? item.name : "")}
        selectedItem={
          categoryOptions.find((o) => o.value === category) ||
          categoryOptions[0]
        }
        onChange={({ selectedItem }) => setCategory(selectedItem.value)}
        size="md"
      />
    </div>
  );
};

export default React.memo(AssetsControls);
