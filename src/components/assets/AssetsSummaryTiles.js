import React from "react";
import { toCurrency } from "../../util";
import { assetTypeConfig } from "./tokens";

const AssetsSummaryTiles = ({
  typeSummary,
  grandTotal,
  totalCount,
  activeType,
  onTypeClick,
}) => {
  const types = Object.keys(assetTypeConfig);

  return (
    <div>
      <div className="assets-grand-total">
        <div className="assets-grand-total-label">
          Total Infrastructure Cost
        </div>
        <div className="assets-grand-total-value">
          {toCurrency(grandTotal, "USD")}
        </div>
        <div className="assets-grand-total-count">
          {totalCount} asset{totalCount !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="assets-type-tiles">
        {types.map((type) => {
          const data = typeSummary[type];
          const config = assetTypeConfig[type];
          if (!data) return null;
          const isActive = activeType === type;
          return (
            <div
              key={type}
              className={`assets-type-tile${isActive ? " assets-type-tile--active" : ""}`}
              style={{ borderLeft: `4px solid ${config.color}` }}
              onClick={() => onTypeClick(isActive ? "all" : type)}
            >
              <div className="assets-type-tile-label">{config.label}</div>
              <div className="assets-type-tile-cost">
                {toCurrency(data.totalCost, "USD")}
              </div>
              <div className="assets-type-tile-count">
                {data.count} asset{data.count !== 1 ? "s" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(AssetsSummaryTiles);
