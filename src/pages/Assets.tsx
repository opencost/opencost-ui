import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

// Carbon Design System Components
import {
    Grid,
    Column,
    Theme,
} from '@carbon/react';

// Core Components
import { LoadingState, EmptyState, ErrorState } from '../components/core';

// Page and Footer (legacy JS)
// @ts-ignore
import Page from '../components/Page';
// @ts-ignore
import Footer from '../components/Footer';

// Modular Asset Components
import {
    KPICardRow,
    CostByProviderChart,
    CostByCategoryChart,
    CarbonEmissionChart,
    ResourceBreakdownTable,
    AssetPageHeader,
    CostOverTimeChart,
    CostByServiceChart,
    AssetDetails,
} from '../components/Assets/index';

// Services
import AssetsService from '../services/assets';

// Tokens
import {
    windowOptions,
    assetTypeOptions,
    currencyOptions,
    aggregationOptions,
    serviceBreakdownOptions,
    currencySymbols,
} from '../components/Assets/tokens';

// Types
import type {
    Asset,
    CarbonData,
    RawAsset,
    ChartDataPoint,
    TableRow,
    KPIData,
    DropdownOption,
} from '../types/assets';

// Global styles
import '../css/global.scss';

// ============================================
// Helper Functions
// ============================================

function formatCurrency(value: number, currency: string = 'USD'): string {
    if (typeof value !== 'number' || isNaN(value)) return `${currencySymbols[currency] || '$'}0.00`;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatCarbon(value: number): string {
    if (typeof value !== 'number' || isNaN(value)) return '0.00';
    return value.toFixed(2);
}

function getAssetTotalCost(asset: RawAsset): number {
    if (asset.totalCost !== undefined) return asset.totalCost;
    if (asset.type === 'Node') {
        const baseCost = ((asset.cpuCost || 0) + (asset.ramCost || 0)) * (1 - (asset.discount || 0));
        return baseCost + (asset.gpuCost || 0) + (asset.adjustment || 0);
    }
    return (asset.cost || 0) + (asset.adjustment || 0);
}

function processAssets(responseData: any): Asset[] {
    if (!responseData) return [];
    let assetMap: Record<string, RawAsset> = {};
    try {
        if (responseData.data) {
            const data = responseData.data;
            assetMap = data.Assets || data.assets || data;
        } else if (responseData.Assets) {
            assetMap = responseData.Assets;
        } else if (responseData.assets) {
            assetMap = responseData.assets;
        } else if (typeof responseData === 'object' && !Array.isArray(responseData)) {
            assetMap = responseData;
        }
    } catch {
        return [];
    }
    if (!assetMap || typeof assetMap !== 'object') return [];

    return Object.entries(assetMap).map(([key, asset]) => ({
        id: key,
        key: key,
        type: asset?.type || 'Unknown',
        name: asset?.properties?.name || key,
        cluster: asset?.properties?.cluster || 'N/A',
        category: asset?.properties?.category || 'N/A',
        provider: asset?.properties?.provider || 'N/A',
        providerID: asset?.properties?.providerID || '',
        totalCost: getAssetTotalCost(asset || {}),
        cpuCost: asset?.cpuCost || 0,
        ramCost: asset?.ramCost || 0,
        gpuCost: asset?.gpuCost || 0,
        labels: asset?.labels || {},
        adjustment: asset?.adjustment || 0,
    }));
}

function processCarbonData(responseData: any): CarbonData[] {
    if (!responseData) return [];
    let assetMap: Record<string, RawAsset> = {};
    try {
        if (responseData.data) {
            const data = responseData.data;
            assetMap = data.Assets || data.assets || data;
        } else if (responseData.Assets) {
            assetMap = responseData.Assets;
        } else if (typeof responseData === 'object' && !Array.isArray(responseData)) {
            assetMap = responseData;
        }
    } catch {
        return [];
    }
    if (!assetMap || typeof assetMap !== 'object') return [];

    return Object.entries(assetMap).map(([key, asset]) => ({
        id: key,
        type: asset?.type || 'Unknown',
        name: asset?.properties?.name || key,
        category: asset?.properties?.category || 'N/A',
        provider: asset?.properties?.provider || 'N/A',
        carbonKg: asset?.carbonKg || 0,
        energyKwh: asset?.energyKwh || 0,
    }));
}

// ============================================
// Main Assets Page Component
// ============================================

const AssetsPage: React.FC = () => {
    // State
    const [assets, setAssets] = useState<Asset[]>([]);
    const [carbonData, setCarbonData] = useState<CarbonData[]>([]);
    const [costOverTimeData, setCostOverTimeData] = useState<any[]>([]);
    const [costByServiceData, setCostByServiceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    // URL-based state
    const routerLocation = useLocation();
    const searchParams = new URLSearchParams(routerLocation.search);
    const navigate = useNavigate();

    const win = searchParams.get('window') || '7d';
    const assetType = searchParams.get('type') || 'all';

    // Local filter state
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [selectedAggregation, setSelectedAggregation] = useState('daily');
    const [selectedServiceBreakdown, setSelectedServiceBreakdown] = useState('service');

    // ============================================
    // Fetch data
    // ============================================
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [assetsResponse, carbonResponse, costTrendResponse, serviceResponse] = await Promise.all([
                AssetsService.fetchAssets(win),
                AssetsService.fetchAssetCarbon(win),
                AssetsService.fetchCostOverTime(win),
                AssetsService.fetchCostByService(win, 'service'),
            ]);

            setAssets(processAssets(assetsResponse));
            setCarbonData(processCarbonData(carbonResponse));
            setCostOverTimeData(costTrendResponse.data || []);
            setCostByServiceData(serviceResponse.data || []);
        } catch (err) {
            console.error('Failed to fetch assets:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch asset data');
            setAssets([]);
            setCarbonData([]);
            setCostOverTimeData([]);
            setCostByServiceData([]);
        }

        setLoading(false);
    }, [win]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Re-fetch service data when breakdown changes
    const handleServiceBreakdownChange = useCallback(async (item: DropdownOption) => {
        setSelectedServiceBreakdown(item.id);
        try {
            const serviceResponse = await AssetsService.fetchCostByService(win, item.id);
            setCostByServiceData(serviceResponse.data || []);
        } catch (err) {
            console.error('Failed to fetch service data:', err);
        }
    }, [win]);

    // ============================================
    // Filtered & computed data
    // ============================================
    const filteredAssets = useMemo(() => {
        if (assetType === 'all') return [...assets];
        return assets.filter((a) => a.type === assetType);
    }, [assets, assetType]);

    const assetsWithCarbon = useMemo(() => {
        const carbonMap = new Map<string, CarbonData>();
        carbonData.forEach((c) => carbonMap.set(c.id, c));
        return filteredAssets.map((asset) => ({
            ...asset,
            carbonKg: carbonMap.get(asset.id)?.carbonKg || 0,
        }));
    }, [filteredAssets, carbonData]);

    // ============================================
    // KPI Data 
    // ============================================
    const kpiData = useMemo((): KPIData[] => {
        const totalCost = filteredAssets.reduce((sum, a) => sum + a.totalCost, 0);
        
        // Find dominant class (most common type)
        const typeCounts: Record<string, number> = {};
        filteredAssets.forEach(a => {
            typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
        });
        const dominantType = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Node';
        
        const totalCarbon = carbonData.reduce((sum, c) => sum + c.carbonKg, 0);
        
        // Find cost outlier (highest cost single resource)
        const outlierAsset = filteredAssets.length > 0
            ? filteredAssets.reduce((max, a) => a.totalCost > max.totalCost ? a : max, filteredAssets[0])
            : null;

        return [
            {
                id: 'total-cost',
                title: 'Total Cost',
                value: formatCurrency(totalCost, selectedCurrency),
                subtitle: `${filteredAssets.length} resources`,
                valueColor: 'var(--color-primary-purple)',
            },
            {
                id: 'dominant-class',
                title: 'Dominant Class',
                value: dominantType,
                subtitle: 'Highest presence',
                valueColor: 'var(--chart-category-compute)',
            },
            {
                id: 'carbon-emission',
                title: 'Carbon Emission',
                value: `${formatCarbon(totalCarbon)} kg`,
                subtitle: 'CO₂ equivalent',
                valueColor: 'var(--state-success)',
            },
            {
                id: 'cost-outlier',
                title: 'Cost Outlier',
                value: outlierAsset ? `${outlierAsset.name} - ${formatCurrency(outlierAsset.totalCost, selectedCurrency)}` : 'N/A',
                subtitle: 'Single resource with highest cost impact',
                valueColor: 'var(--color-gray-100)',
                isOutlier: true,
            },
        ];
    }, [filteredAssets, carbonData, selectedCurrency]);

    // ============================================
    // Chart Data
    // ============================================
    const costByProviderData = useMemo((): ChartDataPoint[] => {
        const byProvider: Record<string, number> = {};
        assets.forEach((asset) => {
            byProvider[asset.provider] = (byProvider[asset.provider] || 0) + asset.totalCost;
        });
        return Object.entries(byProvider)
            .map(([group, value]) => ({ group, value: parseFloat(value.toFixed(2)) }))
            .sort((a, b) => b.value - a.value);
    }, [assets]);

    const costByCategoryData = useMemo((): ChartDataPoint[] => {
        const byCategory: Record<string, number> = {
            'Compute': 0, 'Management': 0, 'Storage': 0, 'Network': 0,
        };
        assets.forEach((asset) => {
            if (asset.type === 'Node') byCategory['Compute'] += asset.totalCost;
            else if (asset.type === 'ClusterManagement') byCategory['Management'] += asset.totalCost;
            else if (asset.type === 'Disk') byCategory['Storage'] += asset.totalCost;
            else if (asset.type === 'LoadBalancer' || asset.category === 'Network') byCategory['Network'] += asset.totalCost;
        });
        return Object.entries(byCategory)
            .filter(([, value]) => value > 0)
            .map(([group, value]) => ({ group, value: parseFloat(value.toFixed(2)) }));
    }, [assets]);

    const carbonDistributionData = useMemo((): ChartDataPoint[] => {
        const byCategory: Record<string, number> = {
            'Compute': 0, 'Management': 0, 'Storage': 0, 'Network': 0,
        };
        carbonData.forEach((c) => {
            if (c.type === 'Node') byCategory['Compute'] += c.carbonKg;
            else if (c.type === 'ClusterManagement') byCategory['Management'] += c.carbonKg;
            else if (c.type === 'Disk') byCategory['Storage'] += c.carbonKg;
            else if (c.type === 'LoadBalancer' || c.category === 'Network') byCategory['Network'] += c.carbonKg;
        });
        return Object.entries(byCategory)
            .filter(([, value]) => value > 0)
            .map(([group, value]) => ({ group, value: parseFloat(value.toFixed(2)) }));
    }, [carbonData]);

    // ============================================
    // Table Data
    // ============================================
    const tableRows = useMemo((): TableRow[] => {
        return assetsWithCarbon.map((asset) => ({
            id: asset.id,
            name: asset.name,
            type: asset.type,
            cluster: asset.cluster,
            category: asset.category,
            provider: asset.provider,
            cost: formatCurrency(asset.totalCost, selectedCurrency),
            carbon: formatCarbon(asset.carbonKg || 0),
        }));
    }, [assetsWithCarbon, selectedCurrency]);

    // ============================================
    // Handlers
    // ============================================
    const handleWindowChange = (selectedItem: DropdownOption) => {
        searchParams.set('window', selectedItem.id);
        navigate({ search: `?${searchParams.toString()}` });
    };

    const handleTypeChange = (selectedItem: DropdownOption) => {
        searchParams.set('type', selectedItem.id);
        navigate({ search: `?${searchParams.toString()}` });
    };

    const handleCurrencyChange = (selectedItem: DropdownOption) => {
        setSelectedCurrency(selectedItem.id);
    };

    const handleAggregationChange = (selectedItem: DropdownOption) => {
        setSelectedAggregation(selectedItem.id);
    };

    const handleExport = () => {
        const csvContent = [
            ['Resource Name', 'Kind', 'Cluster', 'Category', 'Provider', 'Cost ($)', 'Carbon (kg)'].join(','),
            ...tableRows.map((row) =>
                [row.name, row.type, row.cluster, row.category, row.provider, row.cost, row.carbon].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `assets-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // ============================================
    // Render
    // ============================================
    return (
        <Page active="/assets">
            <Theme theme="white">
                <div className="assets-page-container">
                   
                    <AssetPageHeader
                        title="Assets Page"
                        dateRangeOptions={windowOptions}
                        selectedDateRange={win}
                        onDateRangeChange={handleWindowChange}
                        currencyOptions={currencyOptions}
                        selectedCurrency={selectedCurrency}
                        onCurrencyChange={handleCurrencyChange}
                        aggregationOptions={aggregationOptions}
                        selectedAggregation={selectedAggregation}
                        onAggregationChange={handleAggregationChange}
                        onRefresh={fetchData}
                    />

                    {/* Loading State */}
                    {loading && <LoadingState />}

                    {/* Error State */}
                    {!loading && error && <ErrorState error={error} onRetry={fetchData} />}

                    {/* Empty State */}
                    {!loading && !error && assets.length === 0 && (
                        <EmptyState onRefresh={fetchData} />
                    )}

                    {/* Main Content */}
                    {!loading && !error && assets.length > 0 && (
                        <>
                            {selectedAsset ? (
                                <AssetDetails
                                    asset={selectedAsset}
                                    onBack={() => setSelectedAsset(null)}
                                />
                            ) : (
                                <>
                                    <div className="margin-bottom-gap-3">
                                        <KPICardRow kpis={kpiData} columnsPerCard={4} />
                                    </div>

                                    <Grid fullWidth narrow className="charts-grid margin-bottom-gap-3">
                                        <Column lg={16} md={8} sm={4}>
                                            <div className="chart-padding-half">
                                                <CostOverTimeChart
                                                    data={costOverTimeData}
                                                    loading={loading}
                                                    error={error}
                                                />
                                            </div>
                                        </Column>
                                    </Grid>

                                    <Grid fullWidth narrow className="charts-grid margin-bottom-gap-3">
                                        <Column lg={8} md={4} sm={4}>
                                            <div className="chart-padding-half">
                                                <CostByProviderChart
                                                    data={costByProviderData}
                                                    title="Cost by Provider"
                                                    onRetry={fetchData}
                                                />
                                            </div>
                                        </Column>
                                        <Column lg={8} md={4} sm={4}>
                                            <div className="chart-padding-half">
                                                <CostByServiceChart
                                                    data={costByServiceData}
                                                    onRetry={fetchData}
                                                    breakdownOptions={serviceBreakdownOptions}
                                                    selectedBreakdown={selectedServiceBreakdown}
                                                    onBreakdownChange={handleServiceBreakdownChange}
                                                />
                                            </div>
                                        </Column>
                                    </Grid>

                                    <Grid fullWidth narrow className="charts-grid margin-bottom-gap-3">
                                        <Column lg={8} md={4} sm={4}>
                                            <div className="chart-padding-half">
                                                <CostByCategoryChart
                                                    data={costByCategoryData}
                                                    title="Cost by Category"
                                                    onRetry={fetchData}
                                                />
                                            </div>
                                        </Column>
                                        <Column lg={8} md={4} sm={4}>
                                            <div className="chart-padding-half">
                                                <CarbonEmissionChart
                                                    data={carbonDistributionData}
                                                    title="Carbon Emission"
                                                    onRetry={fetchData}
                                                />
                                            </div>
                                        </Column>
                                    </Grid>

                                    <div className="margin-top-gap-3">
                                        <ResourceBreakdownTable
                                            rows={tableRows}
                                            typeFilterOptions={assetTypeOptions}
                                            selectedType={assetType}
                                            onTypeChange={handleTypeChange}
                                            onExport={handleExport}
                                            onRowClick={(rowId: string) => {
                                                const found = assets.find(a => a.id === rowId);
                                                if (found) setSelectedAsset(found);
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </Theme>
            <Footer />
        </Page>
    );
};

export default React.memo(AssetsPage);
