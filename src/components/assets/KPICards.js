/**
 * KPICards - Display key performance indicators for asset costs
 *
 * Shows:
 * - Total Storage Cost
 * - Wasted Cost (idle storage)
 * - Efficiency Score
 * - Asset Count
 */

import React from "react";
import PropTypes from "prop-types";
import {
  getTotalCost,
  getTotalWastedCost,
  calculateEfficiencyScore,
  formatCurrency,
  getTotalProvisioned,
} from "./../../utils/assetCalculations";

const KPICards = ({ assets }) => {
  // Calculate KPI values
  const totalCost = getTotalCost(assets);
  const wastedCost = getTotalWastedCost(assets);
  const efficiencyScore = calculateEfficiencyScore(assets);
  const totalProvisioned = getTotalProvisioned(assets);
  const assetCount = assets.length;

  // Get efficiency status color
  const getEfficiencyColor = (score) => {
    if (score >= 80) return "#24a148"; // Green
    if (score >= 50) return "#ff832b"; // Orange
    return "#da1e28"; // Red
  };

  return (
    <div className="kpi-cards-container">
      {/* Total Cost Card */}
      <div className="kpi-card">
        <div className="kpi-icon">💰</div>
        <div className="kpi-label">Total Storage Cost</div>
        <div className="kpi-value">{formatCurrency(totalCost)}</div>
        <div className="kpi-subtitle">Monthly (30 days)</div>
      </div>

      {/* Wasted Cost Card */}
      <div className="kpi-card kpi-waste">
        <div className="kpi-icon">⚠️</div>
        <div className="kpi-label">Wasted Cost</div>
        <div className="kpi-value" style={{ color: "#da1e28" }}>
          {formatCurrency(wastedCost)}
        </div>
        <div className="kpi-subtitle">From idle storage</div>
      </div>

      {/* Efficiency Score Card */}
      <div className="kpi-card">
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
      </div>

      {/* Total Provisioned Card */}
      <div className="kpi-card">
        <div className="kpi-icon">📦</div>
        <div className="kpi-label">Total Provisioned</div>
        <div className="kpi-value">{totalProvisioned.toFixed(1)} GB</div>
        <div className="kpi-subtitle">Allocated storage</div>
      </div>

      {/* Asset Count Card */}
      <div className="kpi-card">
        <div className="kpi-icon">🗂️</div>
        <div className="kpi-label">Total Assets</div>
        <div className="kpi-value">{assetCount}</div>
        <div className="kpi-subtitle">Nodes & PVCs</div>
      </div>

      {/* Savings Potential Card */}
      <div className="kpi-card kpi-savings">
        <div className="kpi-icon">💵</div>
        <div className="kpi-label">Potential Savings</div>
        <div className="kpi-value" style={{ color: "#24a148" }}>
          {formatCurrency(wastedCost)}
        </div>
        <div className="kpi-subtitle">If optimized</div>
      </div>
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
};

KPICards.defaultProps = {
  assets: [],
};

export default KPICards;
