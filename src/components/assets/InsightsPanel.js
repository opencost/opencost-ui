/**
 * InsightsPanel - Display actionable recommendations
 *
 * Shows:
 * - Ranked insights by potential savings
 * - Action items for cost optimization
 * - Confidence levels for each recommendation
 */

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { generateInsights } from "./../../utils/assetInsights";
import { formatCurrency } from "./../../utils/assetCalculations";

const InsightsPanel = ({ assets }) => {
  // Generate insights
  const insights = useMemo(() => {
    return generateInsights(assets);
  }, [assets]);

  if (insights.length === 0) {
    return (
      <div className="insights-panel">
        <h3>Actionable Insights</h3>
        <div className="insights-empty">
          <p>✓ All assets are optimized. No recommendations at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-panel">
      <h3>Actionable Insights</h3>
      <p className="insights-subtitle">
        Ranked by potential monthly savings
      </p>

      <div className="insights-list">
        {insights.map((insight, index) => (
          <div key={insight.id} className={`insight-card insight-${insight.severity}`}>
            <div className="insight-header">
              <div className="insight-rank">#{index + 1}</div>
              <div className="insight-title">{insight.title}</div>
              <div className="insight-savings">
                Save {formatCurrency(insight.savings)}/month
              </div>
            </div>

            <div className="insight-body">
              <p className="insight-subtitle">{insight.subtitle}</p>
              <p className="insight-description">{insight.description}</p>
            </div>

            <div className="insight-footer">
              <div className="insight-meta">
                <span className="meta-item">
                  <strong>{insight.affectedAssets}</strong> asset
                  {insight.affectedAssets > 1 ? "s" : ""} affected
                </span>
                <span className="meta-item">
                  <strong>{insight.confidence}%</strong> confidence
                </span>
              </div>
              <button className="btn-action">{insight.action}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

InsightsPanel.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      totalCost: PropTypes.number,
      bytes: PropTypes.number,
      breakdown: PropTypes.shape({
        idle: PropTypes.number,
      }),
      storageClass: PropTypes.string,
      local: PropTypes.number,
    })
  ).isRequired,
};

InsightsPanel.defaultProps = {
  assets: [],
};

export default InsightsPanel;
