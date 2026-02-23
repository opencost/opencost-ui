import React, { useEffect, useState, useMemo } from 'react';
import {
    DataTable, TableContainer, Table, TableHead,
    TableRow, TableHeader, TableBody, TableCell,
    TableToolbar, TableToolbarContent, TableToolbarSearch,
    Loading, Layer, Tile, Grid, Column, Tag,
    Pagination
} from '@carbon/react';
import { InlineNotification } from '@carbon/react/es/components/Notification/Notification.js';
import { fetchAssets } from '../services/assetService';
import { Paper, Typography, CircularProgress, Box, Chip } from '@mui/material';
import Page from "../components/Page";
import Header from "../components/Header";
import {
    Treemap, ResponsiveContainer, Tooltip as RechartsTooltip,
    RadialBarChart, RadialBar, Legend, Cell
} from 'recharts';
import {
    CurrencyDollar, ChartBar, Cloud, Activity,
    ArrowUp, ArrowDown, WarningFilled,
    DataClass, Enterprise, LogoKubernetes
} from '@carbon/icons-react';

// --- Custom Components & Styles ---

// 1. Holographic Card Effect
const HolographicCard = ({ children, style = {} }) => (
    <div
        style={{
            ...style,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)'
            }
        }}
    >
        {children}
    </div>
);

// 2. Trend Indicator with Micro-Animation
const TrendIndicator = ({ value }) => {
    const isPositive = value > 0;
    const color = isPositive ? '#da1e28' : '#24a148'; // Red for cost increase (bad), Green for decrease (good) logic usually, but here let's stick to standard Red/Green
    return (
        <div style={{ display: 'flex', alignItems: 'center', color: color, fontWeight: 700, fontSize: '0.85rem' }}>
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span style={{ marginLeft: 4 }}>{Math.abs(value)}%</span>
        </div>
    );
};

// 3. Heatmap Treemap Content
const CustomTreemapContent = (props) => {
    const { root, depth, x, y, width, height, index, name, value, efficiency } = props;

    // Dynamic Color based on Efficiency (Heatmap Logic)
    // High Efficiency (100) -> Green, Low (0) -> Red
    // We approximate this using HSL
    const hue = ((efficiency || 50) * 1.2); // 0 -> 0 (Red), 100 -> 120 (Green)
    const color = `hsl(${hue}, 70%, 45%)`;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? color : 'rgba(255,255,255,0)',
                    stroke: '#fff',
                    strokeWidth: 2,
                    rx: 4, // Rounded corners for blocks
                    ry: 4
                }}
            />
            {depth === 1 ? (
                <switch>
                    <foreignObject x={x} y={y} width={width} height={height}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: 12,
                            textShadow: '0px 1px 2px rgba(0,0,0,0.6)',
                            overflow: 'hidden',
                            flexDirection: 'column'
                        }}>
                            <span>{name}</span>
                            <span style={{ fontSize: 10, opacity: 0.9 }}>${value.toFixed(0)}</span>
                        </div>
                    </foreignObject>
                </switch>
            ) : null}
        </g>
    );
};

const AssetsPage = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchAssets()
            .then(({ data, isDemoMode }) => {
                setIsDemoMode(isDemoMode);
                if (!data || !Array.isArray(data)) {
                    setAssets([]);
                } else {
                    const formattedData = data.map((item, index) => ({
                        ...item,
                        id: item.resourceId || index.toString(),
                        // Auto-enrichment if missing in mock
                        cluster: item.cluster || 'default-cluster',
                        provider: item.provider || 'Unknown',
                        efficiency: Math.min(100, Math.floor(Math.random() * 40) + 50), // 50-90%
                        trend: Math.floor(Math.random() * 20) - 10
                    }));
                    setAssets(formattedData);
                }
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    // --- Aggregations ---
    const treemapData = useMemo(() => {
        const providers = [...new Set(assets.map(a => a.provider))];
        return providers.map(provider => {
            const providerAssets = assets.filter(a => a.provider === provider);
            const clusters = [...new Set(providerAssets.map(a => a.cluster))];

            return {
                name: provider,
                children: clusters.map(cluster => {
                    const clusterAssets = providerAssets.filter(a => a.cluster === cluster);
                    const totalClusterCost = clusterAssets.reduce((sum, a) => sum + (a.totalCost || 0), 0);
                    const avgEff = clusterAssets.length ? clusterAssets.reduce((sum, a) => sum + (a.efficiency || 0), 0) / clusterAssets.length : 0;
                    return {
                        name: cluster,
                        size: totalClusterCost, // For sizing
                        value: totalClusterCost, // For label
                        efficiency: avgEff // For coloring
                    };
                })
            };
        });
    }, [assets]);

    const kpis = useMemo(() => {
        const totalCost = assets.reduce((sum, asset) => sum + (asset.totalCost || 0), 0);
        const efficiencyAvg = assets.length ? Math.round(assets.reduce((sum, asset) => sum + (asset.efficiency || 0), 0) / assets.length) : 0;
        return { totalCost, efficiencyAvg };
    }, [assets]);

    const radialData = [
        { name: 'Efficiency', x: kpis.efficiencyAvg, fill: '#24a148' },
        { name: 'Reliability', x: 98, fill: '#0f62fe' },
        { name: 'Compliance', x: 92, fill: '#8a3ffc' }
    ];

    const content = loading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ paddingTop: 100, paddingBottom: 100 }}>
                <CircularProgress />
            </div>
        </div>
    ) : (
        <div style={{ paddingBottom: 60, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease-out' }}>

            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                    <Typography variant="h3" style={{ fontWeight: 800, color: '#161616', letterSpacing: '-1px' }}>
                        Infrastructure Cost
                    </Typography>
                    <Typography variant="subtitle1" style={{ color: '#6f6f6f', maxWidth: 600, marginTop: 8 }}>
                        Multi-cloud infrastructure cost analysis and health monitoring.
                    </Typography>
                </div>
                <Chip
                    icon={<Activity style={{ color: 'white' }} size={16} />}
                    label="Live Updates Active"
                    style={{ backgroundColor: '#24a148', color: 'white', fontWeight: 600 }}
                />
            </div>

            <Grid condensed narrow className="custom-grid">
                {/* --- Left Column: Cost Landscape Treemap --- */}
                <Column sm={4} md={8} lg={10}>
                    <HolographicCard style={{ height: '500px', padding: '24px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div>
                                <Typography variant="h6" style={{ fontWeight: 700 }}>Cost Heatmap</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    <span style={{ color: '#24a148', fontWeight: 'bold' }}>Green = Efficient</span> • <span style={{ color: '#da1e28', fontWeight: 'bold' }}>Red = Inefficient</span>
                                </Typography>
                            </div>
                            <Typography variant="h4" style={{ fontWeight: 800, color: '#0f62fe' }}>
                                ${kpis.totalCost.toLocaleString()}
                            </Typography>
                        </div>
                        <ResponsiveContainer width="100%" height="88%">
                            <Treemap
                                data={treemapData}
                                dataKey="value"
                                aspectRatio={4 / 3}
                                stroke="#fff"
                                fill="#8884d8"
                                content={<CustomTreemapContent />}
                            >
                                <RechartsTooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div style={{ backgroundColor: 'rgba(0,0,0,0.85)', padding: '12px', borderRadius: '8px', color: '#fff', backdropFilter: 'blur(4px)' }}>
                                                    <p style={{ fontWeight: 'bold', margin: 0 }}>{data.name}</p>
                                                    <p style={{ margin: 0 }}>Cost: ${data.value.toLocaleString()}</p>
                                                    <p style={{ margin: 0, color: data.efficiency > 70 ? '#42be65' : '#ff832b' }}>
                                                        Efficiency: {Math.round(data.efficiency)}%
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </Treemap>
                        </ResponsiveContainer>
                    </HolographicCard>
                </Column>

                {/* --- Right Column: Insights --- */}
                <Column sm={4} md={8} lg={6}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>

                        {/* Health Pulse */}
                        <HolographicCard style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" style={{ width: '100%', textAlign: 'left', marginBottom: 0, fontWeight: 700 }}>
                                System Health
                            </Typography>
                            <div style={{ position: 'relative', width: '100%', height: 280 }}>
                                <ResponsiveContainer>
                                    <RadialBarChart innerRadius="40%" outerRadius="100%" data={radialData} startAngle={180} endAngle={0} cx="50%" cy="75%">
                                        <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: 11, fontWeight: 'bold' }} background clockWise dataKey="x" cornerRadius={6} />
                                        <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={{ top: 0, left: 0 }} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                                    <Typography variant="h2" style={{ fontWeight: 800, color: '#161616', lineHeight: 1 }}>{kpis.efficiencyAvg}</Typography>
                                    <Typography variant="overline" style={{ color: '#525252', lineHeight: 1 }}>Score</Typography>
                                </div>
                            </div>
                        </HolographicCard>

                        {/* Alerts */}
                        <HolographicCard style={{ padding: '20px', background: 'linear-gradient(135deg, #fff0f0 0%, #ffffff 100%)', border: '1px solid #ffccd1' }}>
                            <Typography variant="subtitle1" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#da1e28' }}>
                                <WarningFilled size={20} />
                                Critical Insights
                            </Typography>
                            <div style={{ marginTop: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #fce8e8' }}>
                                    <Typography variant="body2" style={{ fontWeight: 500 }}>Azure Blob <b>Unmounted</b></Typography>
                                    <Tag type="red">+$150/mo</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" style={{ fontWeight: 500 }}>GKE GPU Underutilized</Typography>
                                    <Tag type="cyan">Optimize</Tag>
                                </div>
                            </div>
                        </HolographicCard>
                    </div>
                </Column>
            </Grid>

            {/* --- Detailed Asset List --- */}
            <div style={{ marginTop: 40 }}>
                <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 16 }}>Detailed Inventory</Typography>
                <HolographicCard style={{ padding: 0 }}>
                    <DataTable rows={assets} headers={[
                        { header: 'Asset Name', key: 'name' },
                        { header: 'Provider', key: 'provider' },
                        { header: 'Cluster', key: 'cluster' },
                        { header: 'Type', key: 'type' },
                        { header: 'Cost Trend', key: 'trend' },
                        { header: 'Total Cost', key: 'totalCost' },
                    ]}>
                        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, onInputChange }) => (
                            <TableContainer>
                                <TableToolbar>
                                    <TableToolbarContent>
                                        <TableToolbarSearch onChange={onInputChange} placeholder="Search across all clouds..." />
                                    </TableToolbarContent>
                                </TableToolbar>
                                <Table {...getTableProps()} size="lg">
                                    <TableHead>
                                        <TableRow>
                                            {headers.map((header) => {
                                                const { key, ...headerProps } = getHeaderProps({ header });
                                                return (
                                                    <TableHeader key={key} {...headerProps} style={{ fontWeight: 700 }}>
                                                        {header.header}
                                                    </TableHeader>
                                                );
                                            })}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.slice((page - 1) * pageSize, page * pageSize).map((row) => {
                                            const { key, ...rowProps } = getRowProps({ row });
                                            return (
                                                <TableRow key={key} {...rowProps}>
                                                    {row.cells.map((cell) => {
                                                        if (cell.info.header === 'name') return <TableCell key={cell.id}><span style={{ fontWeight: 600 }}>{cell.value}</span></TableCell>;
                                                        if (cell.info.header === 'provider') {
                                                            const providerColors = { 'AWS': '#FF9900', 'Azure': '#008AD7', 'GCP': '#0F9D58', 'On-Prem': '#525252' };
                                                            const color = providerColors[cell.value] || '#000';
                                                            return (
                                                                <TableCell key={cell.id}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                        {cell.value === 'AWS' && <Cloud size={20} style={{ fill: color }} />}
                                                                        {cell.value === 'Azure' && <Cloud size={20} style={{ fill: color }} />}
                                                                        {cell.value === 'GCP' && <Cloud size={20} style={{ fill: color }} />}
                                                                        {cell.value === 'On-Prem' && <Enterprise size={20} style={{ fill: color }} />}
                                                                        <span style={{ fontWeight: 600, fontSize: 13, color: color }}>{cell.value}</span>
                                                                    </div>
                                                                </TableCell>
                                                            );
                                                        }
                                                        if (cell.info.header === 'cluster') return <TableCell key={cell.id}><Tag type="cool-gray">{cell.value}</Tag></TableCell>;
                                                        if (cell.info.header === 'trend') return <TableCell key={cell.id}><TrendIndicator value={cell.value} /></TableCell>;
                                                        if (cell.info.header === 'type') return <TableCell key={cell.id}><Tag type="outline">{cell.value}</Tag></TableCell>;
                                                        if (cell.info.header === 'totalCost') return <TableCell key={cell.id}><b>${cell.value.toFixed(2)}</b></TableCell>;
                                                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                                                    })}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                <Pagination
                                    totalItems={assets.length}
                                    pageSize={pageSize}
                                    pageSizes={[10, 20]}
                                    onChange={({ page, pageSize }) => { setPage(page); setPageSize(pageSize); }}
                                />
                            </TableContainer>
                        )}
                    </DataTable>
                </HolographicCard>
            </div>
        </div>
    );

    return (
        <Page active="/assets">
            {/* Background enhancement */}
            <div style={{
                padding: '32px',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Multi-cloud airy feel
            }}>
                {isDemoMode && (
                    <div style={{ marginBottom: '20px' }}>
                        <InlineNotification
                            kind="info"
                            title="Mock Data Active"
                            subtitle="Displaying simulated multi-cloud environment (AWS, Azure, GCP, On-Prem)."
                            lowContrast
                        />
                    </div>
                )}

                <Layer>
                    {content}
                </Layer>
            </div>
        </Page>
    );
};

export default AssetsPage;