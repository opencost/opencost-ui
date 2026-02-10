import React from 'react';
import { Tile } from '@carbon/react';
import { DonutChart } from '@carbon/charts-react';
import { getCategoryColorScale } from '../../utils/chartColors';
import type { CostByCategoryChartProps, ChartDataPoint } from '../../types/assets';

// Import Carbon Charts styles
import '@carbon/charts/styles.css';

import { LoadingState, EmptyState, ErrorState } from '../core';

interface ExtendedCostByCategoryChartProps extends CostByCategoryChartProps {
    onRetry?: () => void;
}

const CostByCategoryChart: React.FC<ExtendedCostByCategoryChartProps> = ({
    data = [],
    title = 'Cost by Category',
    loading = false,
    error = null,
    valueFormatter,
    onRetry,
}) => {
    // Get category colors from centralized utility
    const categoryColors = getCategoryColorScale();

    // Calculate total for percentage display
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const chartOptions: any = {
        title: '',
        resizable: true,
        height: '300px', // base height
        donut: {
            alignment: 'center',
            width: 60,
            center: {
                label: '',
                number: '',
            },
        },
        pie: {
            innerRadius: 0, // Should be ignored if donut is set, but sometimes used
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
            valueFormatter: valueFormatter || ((value: number) => {
                if (typeof value !== 'number' || isNaN(value)) return '$0.00';
                return `$${value.toFixed(2)}`;
            }),
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
                    title="No category data"
                    message="No category data available"
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

export default React.memo(CostByCategoryChart);
