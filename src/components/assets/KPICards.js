import React from "react";
import PropTypes from "prop-types";
import { Tile } from "@carbon/react";
import {
  getTotalCost,
  getTotalWastedCost,
  calculateEfficiencyScore,
  formatCurrency,
  getTotalProvisioned,
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
  const totalProvisioned = getTotalProvisioned(assets);
  const assetCount = assets.length;

  const getEfficiencyColor = (score) => {
    if (score >= 80) return "#24a148";
    if (score >= 50) return "#ff832b";
    return "#da1e28";
  };

  const period = windowLabel(timeWindow);

  return (
    <div className="kpi-cards-container">
      <Tile className="kpi-card">
        <div className="kpi-icon">💰</div>
        <div className="kpi-label">Total Storage Cost</div>
        <div className="kpi-value">{formatCurrency(totalCost)}</div>
        <div className="kpi-subtitle">{period}</div>
      </Tile>

      <Tile className="kpi-card kpi-waste">
        <div className="kpi-icon">⚠️</div>
        <div className="kpi-label">Wasted Cost</div>
        <div className="kpi-value" style={{ color: "#da1e28" }}>
          {formatCurrency(wastedCost)}
        </div>
        <div className="kpi-subtitle">From idle storage</div>
      </Tile>

      <Tile className="kpi-card">
        <div className="kpi-icon">📊</div>
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
        <div className="kpi-icon">📦</div>
        <div className="kpi-label">Total Provisioned</div>
        <div className="kpi-value">{totalProvisioned.toFixed(1)} GB</div>
        <div className="kpi-subtitle">Allocated storage</div>
      </Tile>

      <Tile className="kpi-card">
        <div className="kpi-icon">🗂️</div>
        <div className="kpi-label">Total Assets</div>
        <div className="kpi-value">{assetCount}</div>
        <div className="kpi-subtitle">Nodes & PVCs</div>
      </Tile>

      <Tile className="kpi-card kpi-savings">
        <div className="kpi-icon">💵</div>
        <div className="kpi-label">Potential Savings</div>
        <div className="kpi-value" style={{ color: "#24a148" }}>
          {formatCurrency(wastedCost)}
        </div>
        <div className="kpi-subtitle">If optimized</div>
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
