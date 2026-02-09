import React from 'react';
import { Grid, Column, Tile } from '@carbon/react';
import {
    Money,
    DataVis_1,
    ChartBubble,
    Activity
} from '@carbon/icons-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

const formatPercent = (value) => {
    return `${(value * 100).toFixed(1)}%`;
};

const AssetMetrics = ({ data }) => {
    // Calculate metrics from asset data
    const totalCost = data.reduce((sum, asset) => sum + (asset.totalCost || 0), 0);
    const assetCount = data.length;

    // Find top spender
    const sortedByC = [...data].sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0));
    const topSpender = sortedByC[0];
    const topSpenderName = topSpender?.name || topSpender?.type || 'N/A';
    const topSpenderCost = topSpender?.totalCost || 0;

    // Calculate efficiency score from CPU/RAM breakdowns
    // Lower idle = higher efficiency
    let totalIdleCpu = 0;
    let totalIdleRam = 0;
    let countWithBreakdown = 0;

    data.forEach(asset => {
        if (asset.cpuBreakdown || asset.ramBreakdown || asset.breakdown) {
            countWithBreakdown++;
            const cpuIdle = asset.cpuBreakdown?.idle || asset.breakdown?.idle || 0;
            const ramIdle = asset.ramBreakdown?.idle || 0;
            totalIdleCpu += cpuIdle;
            totalIdleRam += ramIdle;
        }
    });

    const avgIdleCpu = countWithBreakdown > 0 ? totalIdleCpu / countWithBreakdown : 0;
    const avgIdleRam = countWithBreakdown > 0 ? totalIdleRam / countWithBreakdown : 0;
    const avgIdle = (avgIdleCpu + avgIdleRam) / 2;
    const efficiencyScore = 1 - avgIdle; // Higher is better

    // Potential savings (idle cost)
    const potentialSavings = totalCost * avgIdle;

    const metrics = [
        {
            icon: Money,
            label: 'Total Cost',
            value: formatCurrency(totalCost),
            subtext: 'All assets combined',
            color: '#78a9ff'
        },
        {
            icon: Activity,
            label: 'Efficiency Score',
            value: formatPercent(efficiencyScore),
            subtext: countWithBreakdown > 0
                ? `${formatCurrency(potentialSavings)} potential savings`
                : 'No breakdown data',
            color: efficiencyScore > 0.5 ? '#42be65' : efficiencyScore > 0.2 ? '#f1c21b' : '#fa4d56'
        },
        {
            icon: ChartBubble,
            label: 'Top Cost Driver',
            value: topSpenderName,
            subtext: formatCurrency(topSpenderCost),
            color: '#be95ff'
        },
        {
            icon: DataVis_1,
            label: 'Active Assets',
            value: assetCount.toString(),
            subtext: 'Distinct resources',
            color: '#08bdba'
        }
    ];

    return (
        <Grid narrow className="asset-metrics-grid">
            {metrics.map((metric, index) => (
                <Column key={index} lg={4} md={4} sm={4}>
                    <Tile className="asset-metric-tile">
                        <div className="metric-header">
                            <metric.icon size={24} style={{ color: metric.color }} />
                            <span className="metric-label">{metric.label}</span>
                        </div>
                        <div className="metric-value" style={{ color: metric.color }}>
                            {metric.value}
                        </div>
                        <div className="metric-subtext">
                            {metric.subtext}
                        </div>
                    </Tile>
                </Column>
            ))}
        </Grid>
    );
};

export default AssetMetrics;
