import React from 'react';
import { StackedAreaChart } from '@carbon/charts-react';
import { LoadingState, ErrorState, EmptyState } from '../core';
import '@carbon/charts/styles.css';

interface CostOverTimeChartProps {
    data: any[];
    loading?: boolean;
    error?: string | null;
    height?: string;
}

const CostOverTimeChart: React.FC<CostOverTimeChartProps> = ({
    data = [],
    loading = false,
    error = null,
    height = '340px'
}) => {
    // Convert string dates to Date objects for time scale
    const processedData = data.map((item: any) => {
        if (item.date instanceof Date) return item;
        // Parse 'Jan 1' style labels into Date objects
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const parts = String(item.date).split(' ');
        if (parts.length === 2) {
            const monthIdx = monthNames.indexOf(parts[0]);
            const day = parseInt(parts[1], 10);
            if (monthIdx >= 0 && !isNaN(day)) {
                const year = new Date().getFullYear();
                return { ...item, date: new Date(year, monthIdx, day) };
            }
        }
        return item;
    });

    const options: any = {
        title: '',
        axes: {
            left: {
                mapsTo: 'value',
                stacked: true,
                title: '',
                ticks: {
                    formatter: (value: number) => `$${value}`,
                },
            },
            bottom: {
                mapsTo: 'date',
                scaleType: 'time',
                ticks: {
                    formatter: (date: Date) => {
                        if (!(date instanceof Date) || isNaN(date.getTime())) return '';
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return `${monthNames[date.getMonth()]} ${date.getDate()}`;
                    },
                },
            }
        },
        height,
        curve: 'curveMonotoneX',
        color: {
            scale: {
                'Node': 'var(--chart-category-compute)',
                'ClusterManagement': 'var(--chart-category-management)',
                'Disk': 'var(--chart-category-storage)',
                'LoadBalancer': 'var(--chart-category-network)',
            }
        },
        legend: {
            alignment: 'center',
            position: 'bottom',
            clickable: true,
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
            totalLabel: 'Daily',
            groupLabel: '',
            customHTML: (dataItems: any[], html: string) => {
                if (!dataItems || dataItems.length === 0) return '';
                // Get the date from the first item
                const rawDate = dataItems[0]?.date || dataItems[0]?.label || '';
                let dateStr = rawDate;
                if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    dateStr = `${monthNames[rawDate.getMonth()]} ${rawDate.getDate()}`;
                }
                // Calculate daily total
                const total = dataItems.reduce((sum: number, item: any) => sum + (item.value || 0), 0);

                let rows = '';
                dataItems.forEach((item: any) => {
                    const name = item.group || item.datasetLabel || '';
                    const val = typeof item.value === 'number' ? item.value : 0;
                    const colorClass = item.color || '#8a3ffc';
                    rows += `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;gap:16px;">
                            <div style="display:flex;align-items:center;gap:6px;">
                                <span style="width:8px;height:8px;border-radius:50%;background:${colorClass};display:inline-block;"></span>
                                <span style="font-size:12px;color:#525252;">${name}</span>
                            </div>
                            <span style="font-size:12px;font-weight:600;color:#161616;">$${val.toFixed(2)}</span>
                        </div>`;
                });

                return `
                    <div style="background:#fff;border:1px solid #e0e0e0;border-radius:4px;padding:10px 14px;box-shadow:0 2px 8px rgba(0,0,0,0.12);min-width:170px;">
                        <div style="font-size:11px;color:#6f6f6f;margin-bottom:2px;">${dateStr}</div>
                        <div style="font-size:14px;font-weight:600;color:#161616;margin-bottom:8px;border-bottom:1px solid #e0e0e0;padding-bottom:6px;">Daily: $${total.toFixed(2)}</div>
                        ${rows}
                    </div>`;
            },
        },
        points: {
            enabled: true,
            radius: 3,
        },
        timeScale: {
            addSpaceOnEdges: 0,
        },
        theme: 'white',
    };

    // Loading State
    if (loading) {
        return (
            <div className="chart-card-container">
                <div className="chart-title-large">Cost Over Time</div>
                <LoadingState minHeight={height} />
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="chart-card-container">
                <div className="chart-title-large">Cost Over Time</div>
                <ErrorState error={error} />
            </div>
        );
    }

    // Empty State
    if (!data || data.length === 0) {
        return (
            <div className="chart-card-container">
                <div className="chart-title-large">Cost Over Time</div>
                <EmptyState title="No Data" message="No cost trend data available" />
            </div>
        );
    }

    return (
        <div className="chart-card-container cost-over-time-wrapper cost-over-time-gradient">
            <div className="chart-title-large">Cost Over Time</div>
            <StackedAreaChart data={processedData} options={options} />
        </div>
    );
};

export default React.memo(CostOverTimeChart);
