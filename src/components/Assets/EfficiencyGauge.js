import React from 'react';
import { Tile, ProgressBar } from '@carbon/react';
import { DonutChart } from '@carbon/charts-react';

const formatPercent = (value) => {
    return `${(value * 100).toFixed(1)}%`;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
};

const EfficiencyGauge = ({ data, totalCost }) => {
    // Calculate aggregated breakdown across all assets
    let totalIdleCpu = 0;
    let totalSystemCpu = 0;
    let totalUserCpu = 0;
    let totalIdleRam = 0;
    let totalSystemRam = 0;
    let totalUserRam = 0;
    let cpuCount = 0;
    let ramCount = 0;

    data.forEach(asset => {
        if (asset.cpuBreakdown) {
            cpuCount++;
            totalIdleCpu += asset.cpuBreakdown.idle || 0;
            totalSystemCpu += asset.cpuBreakdown.system || 0;
            totalUserCpu += asset.cpuBreakdown.user || 0;
        }
        if (asset.ramBreakdown) {
            ramCount++;
            totalIdleRam += asset.ramBreakdown.idle || 0;
            totalSystemRam += asset.ramBreakdown.system || 0;
            totalUserRam += asset.ramBreakdown.user || 0;
        }
        // For Disk assets with generic breakdown
        if (asset.breakdown && !asset.cpuBreakdown && !asset.ramBreakdown) {
            cpuCount++;
            totalIdleCpu += asset.breakdown.idle || 0;
            totalSystemCpu += asset.breakdown.system || 0;
            totalUserCpu += asset.breakdown.user || 0;
        }
    });

    const avgCpuIdle = cpuCount > 0 ? totalIdleCpu / cpuCount : 0;
    const avgCpuSystem = cpuCount > 0 ? totalSystemCpu / cpuCount : 0;
    const avgCpuUser = cpuCount > 0 ? totalUserCpu / cpuCount : 0;

    const avgRamIdle = ramCount > 0 ? totalIdleRam / ramCount : 0;
    const avgRamSystem = ramCount > 0 ? totalSystemRam / ramCount : 0;
    const avgRamUser = ramCount > 0 ? totalUserRam / ramCount : 0;

    const cpuChartData = [
        { group: 'User (Active)', value: avgCpuUser },
        { group: 'System', value: avgCpuSystem },
        { group: 'Idle (Wasted)', value: avgCpuIdle }
    ];

    const ramChartData = [
        { group: 'User (Active)', value: avgRamUser },
        { group: 'System', value: avgRamSystem },
        { group: 'Idle (Wasted)', value: avgRamIdle }
    ];

    const chartOptions = (title) => ({
        title,
        resizable: true,
        donut: {
            center: {
                label: 'Utilization'
            }
        },
        height: '200px',
        legend: {
            alignment: 'center',
            position: 'bottom'
        },
        color: {
            scale: {
                'User (Active)': '#42be65',
                'System': '#78a9ff',
                'Idle (Wasted)': '#fa4d56'
            }
        },
        pie: {
            labels: {
                enabled: false
            }
        }
    });

    const hasData = cpuCount > 0 || ramCount > 0;

    if (!hasData) {
        return (
            <Tile className="efficiency-gauge-tile">
                <h4>Resource Efficiency</h4>
                <p className="no-data-message">
                    No breakdown data available. Enable CPU/RAM mode breakdown in OpenCost to see efficiency metrics.
                </p>
            </Tile>
        );
    }

    // Calculate potential savings
    const avgIdle = ((avgCpuIdle + avgRamIdle) / 2);
    const potentialSavings = totalCost * avgIdle;

    return (
        <Tile className="efficiency-gauge-tile">
            <div className="efficiency-header">
                <h4>Resource Efficiency Analysis</h4>
                <div className="savings-callout">
                    <span className="savings-label">Potential Monthly Savings:</span>
                    <span className="savings-value">{formatCurrency(potentialSavings)}</span>
                </div>
            </div>

            <div className="efficiency-charts">
                {cpuCount > 0 && (
                    <div className="efficiency-chart">
                        <DonutChart
                            data={cpuChartData}
                            options={chartOptions('CPU Utilization')}
                        />
                        <div className="utilization-bar">
                            <span>Active: {formatPercent(avgCpuUser + avgCpuSystem)}</span>
                            <ProgressBar
                                value={(avgCpuUser + avgCpuSystem) * 100}
                                status={avgCpuIdle > 0.7 ? 'error' : avgCpuIdle > 0.4 ? 'active' : 'finished'}
                                hideLabel
                            />
                        </div>
                    </div>
                )}

                {ramCount > 0 && (
                    <div className="efficiency-chart">
                        <DonutChart
                            data={ramChartData}
                            options={chartOptions('RAM Utilization')}
                        />
                        <div className="utilization-bar">
                            <span>Active: {formatPercent(avgRamUser + avgRamSystem)}</span>
                            <ProgressBar
                                value={(avgRamUser + avgRamSystem) * 100}
                                status={avgRamIdle > 0.7 ? 'error' : avgRamIdle > 0.4 ? 'active' : 'finished'}
                                hideLabel
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="efficiency-insight">
                {avgIdle > 0.7 && (
                    <p className="insight-warning">
                        ⚠️ High idle resources detected! Consider right-sizing your infrastructure.
                    </p>
                )}
                {avgIdle <= 0.7 && avgIdle > 0.4 && (
                    <p className="insight-info">
                        💡 Moderate idle capacity. Review node sizing for optimization opportunities.
                    </p>
                )}
                {avgIdle <= 0.4 && (
                    <p className="insight-success">
                        ✅ Good resource utilization! Your infrastructure is well-optimized.
                    </p>
                )}
            </div>
        </Tile>
    );
};

export default EfficiencyGauge;
