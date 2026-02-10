import React from 'react';
import { StackedBarChart } from '@carbon/charts-react';
import { Dropdown } from '@carbon/react';
import { LoadingState, ErrorState, EmptyState } from '../core';
import type { DropdownOption } from '../../types/assets';
import '@carbon/charts/styles.css';

interface CostByServiceChartProps {
    data: any[];
    title?: string;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    breakdownOptions?: DropdownOption[];
    selectedBreakdown?: string;
    onBreakdownChange?: (item: DropdownOption) => void;
}

const CostByServiceChart: React.FC<CostByServiceChartProps> = ({
    data = [],
    title,
    loading = false,
    error = null,
    onRetry,
    breakdownOptions = [],
    selectedBreakdown = 'service',
    onBreakdownChange,
}) => {
    // Dynamic title based on selected breakdown
    const displayTitle = title || (selectedBreakdown === 'cluster'
        ? 'Daily Cost by Cluster'
        : 'Daily Cost by Service');

    const chartOptions: any = {
        title: '',
        axes: {
            left: {
                mapsTo: 'value',
                stacked: true,
                ticks: {
                    formatter: (value: number) => `$${value}`,
                },
            },
            bottom: {
                mapsTo: 'date',
                scaleType: 'labels',
            }
        },
        height: '300px',
        color: {
            scale: {
                'Node': 'var(--chart-category-compute)',
                'ClusterManagement': 'var(--chart-category-management)',
                'Disk': 'var(--chart-category-storage)',
                'LoadBalancer': 'var(--chart-category-network)',
                // Cluster colors
                'prod-cluster-us-east': 'var(--chart-provider-aws)',
                'staging-cluster-eu': 'var(--chart-provider-azure)',
                'dev-cluster-west': 'var(--chart-provider-gcp)',
                'prod-cluster-phoenix': 'var(--chart-provider-oracle)',
            }
        },
        legend: {
            alignment: 'center',
            position: 'bottom',
            clickable: true,
        },
        bars: {
            maxWidth: 16,
        },
        toolbar: {
            enabled: false,
        },
        grid: {
            x: { enabled: false },
            y: { enabled: true, color: 'var(--color-gray-20)' },
        },
        tooltip: {
            showTotal: true,
            totalLabel: 'Total',
            valueFormatter: (value: any) => `$${Number(value || 0).toFixed(2)}`,
        },
        theme: 'white',
    };

    const handleBreakdownChange = ({ selectedItem }: { selectedItem: DropdownOption }) => {
        if (onBreakdownChange && selectedItem) {
            onBreakdownChange(selectedItem);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="chart-card-container">
                <div className="chart-card-service-header">
                    <span className="chart-title-large">{displayTitle}</span>
                </div>
                <LoadingState minHeight="300px" />
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="chart-card-container">
                <div className="chart-card-service-header">
                    <span className="chart-title-large">{displayTitle}</span>
                </div>
                <ErrorState error={error} onRetry={onRetry} />
            </div>
        );
    }

    // Empty State
    if (!data || data.length === 0) {
        return (
            <div className="chart-card-container">
                <div className="chart-card-service-header">
                    <span className="chart-title-large">{displayTitle}</span>
                </div>
                <EmptyState
                    onRefresh={onRetry}
                    title="No data"
                    message="No service cost data available"
                />
            </div>
        );
    }

    return (
        <div className="chart-card-container">
            <div className="chart-card-service-header">
                <span className="chart-title-large" style={{ marginBottom: 0 }}>{displayTitle}</span>
                {breakdownOptions.length > 0 && (
                    <Dropdown
                        id="service-breakdown-dropdown"
                        titleText=""
                        label="View by"
                        items={breakdownOptions}
                        itemToString={(item: DropdownOption) => item?.text || ''}
                        selectedItem={breakdownOptions.find((o) => o.id === selectedBreakdown)}
                        onChange={handleBreakdownChange}
                        size="sm"
                        className="white-bg-dropdown"
                        style={{ minWidth: '120px', maxWidth: '150px' }}
                    />
                )}
            </div>
            <StackedBarChart data={data} options={chartOptions} />
        </div>
    );
};

export default React.memo(CostByServiceChart);
