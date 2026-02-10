import React, { useMemo } from 'react';
import { Button, Tile, Grid, Column } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { SimpleBarChart, DonutChart } from '@carbon/charts-react';
import { Asset } from '../../types/assets';
import { getMockAssetDetailsData } from '../../services/assets.mock';
import '@carbon/charts/styles.css';
import { ScaleTypes } from '@carbon/charts/interfaces';

interface AssetDetailsProps {
    asset: Asset;
    onBack: () => void;
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const AssetDetails: React.FC<AssetDetailsProps> = ({ asset, onBack }) => {
    // Generate mock details using service
    const { trendData, breakdownData, compute, usage } = useMemo(() => getMockAssetDetailsData(asset), [asset]);

    const trendOptions = {
        title: '',
        axes: {
            left: {
                mapsTo: 'value',
                ticks: { formatter: (value: any) => { const v = Number(value || 0); return isNaN(v) ? '-' : `$${v.toFixed(2)}`; } }
            },
            bottom: { mapsTo: 'date', scaleType: 'labels' as ScaleTypes }
        },
        height: '300px',
        color: {
            scale: { 'cost': 'var(--color-primary-purple)' }
        },
        toolbar: { enabled: false },
        tooltip: {
            valueFormatter: (value: any) => { const v = Number(value || 0); return isNaN(v) ? '-' : `$${v.toFixed(2)}`; }
        },
        grid: {
            x: { enabled: false },
            y: { enabled: true, color: 'var(--color-gray-20)' },
        },
        theme: 'white',
    };

    const breakdownOptions = {
        title: '',
        resizable: true,
        height: '300px',
        donut: {
            center: {
                label: ''
            }
        },
        color: {
            scale: {
                'CPU': 'var(--chart-category-compute)',
                'RAM': 'var(--chart-category-management)',
                'Storage': 'var(--chart-category-storage)',
                'Network': 'var(--chart-category-network)'
            }
        },
        legend: {
            position: 'right'
        },
        toolbar: { enabled: false },
        theme: 'white',
    };

    return (
        <div className="asset-details-container">
            {/* Header */}
            <div className="asset-page-header margin-bottom-05">
                <div className="header-controls" style={{ display: 'flex', alignItems: 'center' }}>
                    <Button kind="ghost" size="sm" renderIcon={ArrowLeft} onClick={onBack}>
                        Back
                    </Button>
                    <h2 className="header-title" style={{ marginLeft: '1rem', marginBottom: 0 }}>
                        {asset.name}
                    </h2>
                    <span className="cds--tag cds--tag--cool-gray" style={{ marginLeft: '1rem' }}>
                        {asset.type}
                    </span>
                    <span className="cds--tag cds--tag--cyan" style={{ marginLeft: '0.5rem' }}>
                        {asset.cluster}
                    </span>
                </div>
            </div>

            <Grid fullWidth narrow className="charts-grid">
                {/* Row 1: KPI Cards - All in same row */}
                <Column lg={4} md={2} sm={4} className="margin-bottom-gap-3">
                    <Tile className="kpi-card-container">
                        <div className="kpi-title">TOTAL COST</div>
                        <div className="kpi-value" style={{ color: 'var(--color-primary-purple)' }}>
                            {formatter.format(asset.totalCost)}
                        </div>
                    </Tile>
                </Column>
                <Column lg={4} md={2} sm={4} className="margin-bottom-gap-3">
                    <Tile className="kpi-card-container">
                        <div className="kpi-title">CPU COST</div>
                        <div className="kpi-value" style={{ color: 'var(--chart-category-compute)' }}>
                            {formatter.format(compute.cpuCost)}
                        </div>
                    </Tile>
                </Column>
                <Column lg={4} md={2} sm={4} className="margin-bottom-gap-3">
                    <Tile className="kpi-card-container">
                        <div className="kpi-title">RAM COST</div>
                        <div className="kpi-value" style={{ color: 'var(--chart-category-management)' }}>
                            {formatter.format(compute.ramCost)}
                        </div>
                    </Tile>
                </Column>
                <Column lg={4} md={2} sm={4} className="margin-bottom-gap-3">
                    <Tile className="kpi-card-container">
                        <div className="kpi-title">STORAGE COST</div>
                        <div className="kpi-value" style={{ color: 'var(--chart-category-storage)' }}>
                            {formatter.format(compute.storageCost)}
                        </div>
                    </Tile>
                </Column>

                {/* Row 2: Charts */}
                <Column lg={9} md={5} sm={4} className="margin-bottom-gap-3">
                    <div className="chart-card-container" style={{ height: '100%' }}>
                        <div className="chart-title-large">Daily Cost Trend</div>
                        <SimpleBarChart
                            data={trendData}
                            options={trendOptions}
                        />
                    </div>
                </Column>
                <Column lg={7} md={3} sm={4} className="margin-bottom-gap-3">
                    <div className="chart-card-container donut-chart-no-center" style={{ height: '100%' }}>
                        <div className="chart-title-large">Cost Breakdown</div>
                        <DonutChart
                            data={breakdownData}
                            options={breakdownOptions}
                        />
                    </div>
                </Column>

                {/* Row 3: Details */}
                <Column lg={5} md={3} sm={4} className="margin-bottom-gap-3">
                    <div className="chart-card-container" style={{ height: '100%' }}>
                        <div className="chart-title-large">Properties</div>
                        <div className="property-list">
                            <PropertyRow label="Name" value={asset.name} />
                            <PropertyRow label="Type" value={asset.type} />
                            <PropertyRow label="Cluster" value={asset.cluster} />
                            <PropertyRow label="Namespace" value="kubecost" />
                            <PropertyRow label="Project" value="Default" />
                            <PropertyRow label="Product" value={asset.provider} />
                            <PropertyRow label="Category" value={asset.category} />
                        </div>
                    </div>
                </Column>

                {/* Compute Resources */}
                <Column lg={5} md={3} sm={4} className="margin-bottom-gap-3">
                    <div className="chart-card-container" style={{ height: '100%' }}>
                        <div className="chart-title-large">Compute Resources</div>
                        <div className="property-list">
                            <PropertyRow label="CPU Cost" value={formatter.format(compute.cpuCost)} />
                            <PropertyRow label="RAM GiB" value={`${compute.ramGib} GiB`} />
                            <PropertyRow label="RAM Cost" value={formatter.format(compute.ramCost)} />
                            <PropertyRow label="Storage Breakdown" value={formatter.format(compute.storageCost)} />
                            <PropertyRow label="Network Breakdown" value={formatter.format(compute.networkCost)} />
                            <PropertyRow label="Total Cost" value={formatter.format(asset.totalCost)} highlight />
                        </div>
                    </div>
                </Column>

                {/* Usage Metrics */}
                <Column lg={6} md={2} sm={4} className="margin-bottom-gap-3">
                    <div className="chart-card-container" style={{ height: '100%' }}>
                        <div className="chart-title-large">Usage Metrics</div>
                        <div className="property-list">
                            <PropertyRow label="CPU Efficiency" value={`${usage.cpuEfficiency}%`} />
                            <PropertyRow label="RAM Efficiency" value={`${usage.ramEfficiency}%`} />
                            <PropertyRow label="Idle Cost" value={formatter.format(usage.idleCost)} />
                            <PropertyRow label="Shared Cost" value={formatter.format(usage.sharedCost)} />
                        </div>
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: 'var(--color-gray-20)',
                            borderRadius: '4px'
                        }}>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--color-gray-60)',
                                marginBottom: '4px'
                            }}>
                                Recommendation
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--color-gray-100)'
                            }}>
                                Right-size this resource to save ~15%
                            </div>
                        </div>
                    </div>
                </Column>
            </Grid>
        </div>
    );
};

const PropertyRow = ({ label, value, highlight }: { label: string, value: string | number, highlight?: boolean }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid var(--color-gray-20)',
        alignItems: 'center'
    }}>
        <span style={{ color: 'var(--color-gray-100)', fontSize: '14px', opacity: 0.8 }}>{label}</span>
        <span style={{ fontWeight: highlight ? 700 : 500, fontSize: '14px', color: highlight ? 'var(--color-primary-purple)' : 'inherit' }}>{value}</span>
    </div>
);

export default AssetDetails;
