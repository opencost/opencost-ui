import React from "react";
import AssetsSelectWindow from "./AssetsSelectWindow";
import AssetsSelectType from "./AssetsSelectType";

const AssetsFilters = ({
  window,
  setWindow,
  assetType,
  setAssetType,
  assetTypeOptions,
}) => {
  return (
    <div className="assets-filters">
      <AssetsSelectWindow window={window} setWindow={setWindow} />
      <AssetsSelectType
        assetType={assetType}
        setAssetType={setAssetType}
        assetTypeOptions={assetTypeOptions}
      />
    </div>
  );
};

export default AssetsFilters;
