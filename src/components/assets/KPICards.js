import PropTypes from "prop-types";
import { Tile } from "@carbon/react";
import { Money, WarningAlt, ChartBar, Folder } from "@carbon/icons-react";
import {
  getTotalCost,
  getTotalWastedCost,
  calculateEfficiencyScore,
  formatCurrency,
} from "../../utils/assetCalculations";

function windowLabel(timeWindow) {
  const days = parseInt(timeWindow) || 30;
  if (days <= 7) return "Last 7 days";
  if (days <= 14) return "Last 14 days";
  if (days <= 30) return "Last 30 days";
  if (days <= 60) return "Last 60 days";
  return `Last ${days} days`;
}

const KPICards = ({ assets, timeWindow }) => {
  const totalCost = getTotalCost(assets);
  const wastedCost = getTotalWastedCost(assets);
  const efficiencyScore = calculateEfficiencyScore(assets);
  const assetCount = assets.length;

  const getEfficiencyColor = (score) => {
    if (score >= 80) return "var(--cds-support-success)";
    if (score >= 50) return "var(--cds-support-warning)";
    return "var(--cds-support-error)";
  };

  const period = windowLabel(timeWindow);

  return (
    <div className="kpi-cards-container">
      <Tile className="kpi-card">
        <div className="kpi-icon">
          <Money size={24} aria-label="Cost" />
        </div>
        <div className="kpi-label">Total Storage Cost</div>
        <div className="kpi-value">{formatCurrency(totalCost)}</div>
        <div className="kpi-subtitle">{period}</div>
      </Tile>

      <Tile className="kpi-card kpi-waste">
        <div className="kpi-icon">
          <WarningAlt size={24} aria-label="Warning" />
        </div>
        <div className="kpi-label">Wasted Cost</div>
        <div className="kpi-value" style={{ color: "var(--cds-support-error)" }}>
          {formatCurrency(wastedCost)}
        </div>
        <div className="kpi-subtitle">From idle storage</div>
      </Tile>

      <Tile className="kpi-card">
        <div className="kpi-icon">
          <ChartBar size={24} aria-label="Efficiency" />
        </div>
        <div className="kpi-label">Efficiency Score</div>
        <div
          className="kpi-value"
          style={{ color: getEfficiencyColor(efficiencyScore) }}
        >
          {efficiencyScore}%
        </div>
        <div className="kpi-subtitle">
          {efficiencyScore >= 80
            ? "Excellent"
            : efficiencyScore >= 50
            ? "Good"
            : "Needs Review"}
        </div>
      </Tile>

      <Tile className="kpi-card">
        <div className="kpi-icon">
          <Folder size={24} aria-label="Assets" />
        </div>
        <div className="kpi-label">Total Assets</div>
        <div className="kpi-value">{assetCount}</div>
        <div className="kpi-subtitle">Nodes & PVCs</div>
      </Tile>
    </div>
  );
};

KPICards.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      totalCost: PropTypes.number,
      bytes: PropTypes.number,
      breakdown: PropTypes.shape({
        idle: PropTypes.number,
        system: PropTypes.number,
        user: PropTypes.number,
        other: PropTypes.number,
      }),
    })
  ).isRequired,
  timeWindow: PropTypes.string,
};

export default KPICards;
