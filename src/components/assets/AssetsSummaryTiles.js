import { Tile } from "@carbon/react";
import { toCurrency } from "../../util";

const AssetsSummaryTiles = ({
  assets,
  totalCost,
  assetTypes,
  avgCost,
  currency,
}) => {
  return (
    <div
      className="assets-summary-grid"
      style={{
        display: "flex",
        gap: "24px",
        marginBottom: "32px",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: 1 }}>
        <Tile className="assets-summary-tile assets-summary-tile--primary">
          <div className="assets-summary-tile__label">Total Assets</div>
          <div className="assets-summary-tile__value">{assets}</div>
        </Tile>
      </div>
      <div style={{ flex: 1 }}>
        <Tile className="assets-summary-tile assets-summary-tile--cost">
          <div className="assets-summary-tile__label">Total Cost</div>
          <div className="assets-summary-tile__value">
            {toCurrency(totalCost, currency)}
          </div>
        </Tile>
      </div>
      <div style={{ flex: 1 }}>
        <Tile className="assets-summary-tile assets-summary-tile--types">
          <div className="assets-summary-tile__label">Asset Types</div>
          <div className="assets-summary-tile__value">{assetTypes}</div>
        </Tile>
      </div>
      <div style={{ flex: 1 }}>
        <Tile className="assets-summary-tile assets-summary-tile--avg">
          <div className="assets-summary-tile__label">
            Average Cost Per Asset
          </div>
          <div className="assets-summary-tile__value">
            {toCurrency(avgCost, currency)}
          </div>
        </Tile>
      </div>
    </div>
  );
};

export default AssetsSummaryTiles;
