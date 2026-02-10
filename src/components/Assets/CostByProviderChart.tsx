import React from 'react';
import { Tile } from '@carbon/react';
import { SimpleBarChart } from '@carbon/charts-react';
import { getProviderColorScale } from '../../utils/chartColors';
import type { ChartProps, ChartDataPoint } from '../../types/assets';
import { LoadingState, EmptyState, ErrorState } from '../core';

// Import Carbon Charts styles
import '@carbon/charts/styles.css';

interface CostByProviderChartProps extends ChartProps {
    onRetry?: () => void;
}

const CostByProviderChart: React.FC<CostByProviderChartProps> = ({
    data = [],
    title = 'Cost by Provider',
    loading = false,
    error = null,
    onRetry,
}) => {
    // Get provider colors from centralized utility
    const providerColors = getProviderColorScale();

    const chartOptions: any = {
        title: '',
        axes: {
            left: {
                mapsTo: 'group',
                scaleType: 'labels',
            },
            bottom: {
                mapsTo: 'value',
                title: 'Cost ($)',
                ticks: {
                    formatter: (value: number) => `$${value}`,
                },
            },
        },
        height: '300px', // Base height
        resizable: true,
        color: {
            scale: providerColors,
        },
        bars: {
            maxWidth: 32,
        },
        grid: {
            x: {
                enabled: true,
                color: 'var(--color-gray-20)',
            },
            y: {
                enabled: false,
            },
        },
        toolbar: {
            enabled: false,
        },
        legend: {
            enabled: false,
        },
        tooltip: {
            showTotal: false,
            showTitle: false,
            customHTML: (data: any[]) => {
                if (!data || data.length === 0) return '';
                const item = data[0];
                // Ensure values exist
                const name = item.group || 'Unknown';
                const val = typeof item.value === 'number' ? item.value : 0;

                return `
                   <div class="cds--tooltip-content">
                       <p class="cds--tooltip-content__title">${name}</p>
                       <ul class="cds--tooltip-content__list">
                           <li class="cds--tooltip-content__list-item">
                               <span class="cds--tooltip-content__list-item-label">Cost:</span>
                               <span class="cds--tooltip-content__list-item-value">$${val.toFixed(2)}</span>
                           </li>
                       </ul>
                   </div>
                `;
            },
        },
        theme: 'white',
    };

    // Loading State
    if (loading) {
        return (
            <div className="chart-card-container">
                <div className="chart-title-large">{title}</div>
                <LoadingState minHeight="300px" />
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="chart-card-container">
                <div className="chart-title-large">{title}</div>
                <ErrorState error={error} onRetry={onRetry} />
            </div>
        );
    }

    // Empty State
    if (!data || data.length === 0) {
        return (
            <div className="chart-card-container">
                <div className="chart-title-large">{title}</div>
                <EmptyState
                    onRefresh={onRetry}
                    title="No provider data"
                    message="No provider cost data available"
                />
            </div>
        );
    }

    return (
        <div className="chart-card-container">
            <div className="chart-title-large">{title}</div>
            <SimpleBarChart data={data} options={chartOptions} />
        </div>
    );
};

export default React.memo(CostByProviderChart);
