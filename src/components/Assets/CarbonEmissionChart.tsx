import React from 'react';
import { Tile } from '@carbon/react';
import { DonutChart } from '@carbon/charts-react';
import { getCategoryColorScale } from '../../utils/chartColors';
import type { ChartProps, ChartDataPoint } from '../../types/assets';

// Import Carbon Charts styles
import '@carbon/charts/styles.css';

import { LoadingState, EmptyState, ErrorState } from '../core';

interface CarbonEmissionChartProps extends ChartProps {
    onRetry?: () => void;
}

const CarbonEmissionChart: React.FC<CarbonEmissionChartProps> = ({
    data = [],
    title = 'Carbon Emission',
    loading = false,
    error = null,
    onRetry,
}) => {
    // Get carbon emission colors from centralized utility
    const categoryColors = getCategoryColorScale();

    // Calculate total for percentage display
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const chartOptions: any = {
        title: '',
        resizable: true,
        height: '300px', // Base height
        donut: {
            alignment: 'center',
            width: 60,
            center: {
                label: '',
                number: '',
            },
        },
        pie: {
            labels: {
                enabled: true,
                formatter: ({ data: d }: { data: ChartDataPoint }) => {
                    const percent = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
                    return `${percent}%`;
                },
            },
        },
        color: {
            scale: categoryColors,
        },
        legend: {
            alignment: 'right',
            position: 'right',
            clickable: false,
        },
        toolbar: {
            enabled: false,
        },
        tooltip: {
            showTotal: false,
            valueFormatter: (value: number) => {
                if (typeof value !== 'number' || isNaN(value)) return '0.00 kg CO₂e';
                return `${value.toFixed(2)} kg CO₂e`;
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
                    title="No emission data"
                    message="No carbon emission data available"
                    onRefresh={onRetry}
                />
            </div>
        );
    }

    return (
        <div className="chart-card-container donut-chart-no-center donut-chart-wrapper">
            <div className="chart-title-large">{title}</div>
            <DonutChart data={data} options={chartOptions} />
        </div>
    );
};

export default React.memo(CarbonEmissionChart);
