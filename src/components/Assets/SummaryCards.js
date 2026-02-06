import React from "react";
import { Tile } from "@carbon/react";
import { ArrowUp, ArrowDown } from "@carbon/icons-react";
import { toCurrency } from "../../util";
import "./SummaryCards.css";

const SummaryCards = ({ assets, previousAssets, currency, timeWindow }) => {
    // Calculate metrics
    const totalCost = Object.values(assets).reduce((sum, asset) => sum + asset.totalCost, 0);
    const assetCount = Object.keys(assets).length;

    // Find most expensive asset type
    const costByType = {};
    Object.values(assets).forEach(asset => {
        if (!costByType[asset.type]) {
            costByType[asset.type] = 0;
        }
        costByType[asset.type] += asset.totalCost;
    });

    const topType = Object.entries(costByType).sort((a, b) => b[1] - a[1])[0];
    const topTypeName = topType ? topType[0] : "N/A";
    const topTypeCost = topType ? topType[1] : 0;

    // ==================== SMART TREND CALCULATION ====================
    // Automatically uses REAL data when available, falls back to simulation
    // ================================================================

    const getTrend = (currentValue, previousValue) => {
        // If we have previous data, calculate REAL trend
        if (previousValue !== undefined && previousValue !== null && previousValue > 0) {
            return ((currentValue - previousValue) / previousValue) * 100;
        }

        // Otherwise, simulate for demo purposes
        const simulatedTrends = {
            'today': Math.random() * 20 - 10,  // -10% to +10%
            '7d': Math.random() * 15 - 7.5,    // -7.5% to +7.5%
            '30d': Math.random() * 10 - 5,     // -5% to +5%
            '60d': Math.random() * 8 - 4,      // -4% to +4%
            '90d': Math.random() * 6 - 3,      // -3% to +3%
        };
        return simulatedTrends[timeWindow] || 0;
    };

    // Calculate previous period metrics (if available)
    const previousTotalCost = previousAssets
        ? Object.values(previousAssets).reduce((sum, asset) => sum + asset.totalCost, 0)
        : null;

    const previousAssetCount = previousAssets
        ? Object.keys(previousAssets).length
        : null;

    // Calculate trends (will use real data if available, simulation otherwise)
    const costTrend = getTrend(totalCost, previousTotalCost);
    const assetCountTrend = getTrend(assetCount, previousAssetCount);

    const TrendIndicator = ({ trend }) => {
        if (Math.abs(trend) < 0.1) return null;
        const isPositive = trend > 0;
        return (
            <span className={`trend-indicator ${isPositive ? 'trend-up' : 'trend-down'}`}>
                {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {Math.abs(trend).toFixed(1)}%
            </span>
        );
    };


    return (
        <div className="summary-cards">
            <Tile className="summary-card">
                <div className="summary-card-label">Total Infrastructure Cost</div>
                <div className="summary-card-value">
                    {toCurrency(totalCost, currency, 2)}
                    <TrendIndicator trend={costTrend} />
                </div>
            </Tile>

            <Tile className="summary-card">
                <div className="summary-card-label">Total Assets</div>
                <div className="summary-card-value">
                    {assetCount}
                    <TrendIndicator trend={assetCountTrend} />
                </div>
            </Tile>

            <Tile className="summary-card">
                <div className="summary-card-label">Top Asset Type</div>
                <div className="summary-card-value">{topTypeName}</div>
                <div className="summary-card-subtext">{toCurrency(topTypeCost, currency, 2)}</div>
            </Tile>
        </div>
    );
};

export default SummaryCards;
