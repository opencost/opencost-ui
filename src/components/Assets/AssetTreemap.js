import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { Tile } from '@carbon/react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
};

// Color palette by category
const categoryColors = {
    'Compute': '#8a3ffc',
    'Storage': '#0072c3',
    'Network': '#009d9a',
    'Management': '#9f1853',
    'default': '#6f6f6f'
};

// Custom content renderer for treemap cells
const CustomizedContent = ({ x, y, width, height, name, category, totalCost, onClick }) => {
    if (width < 40 || height < 30) {
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: categoryColors[category] || categoryColors.default,
                        stroke: '#262626',
                        strokeWidth: 2,
                        cursor: 'pointer'
                    }}
                    onClick={onClick}
                />
            </g>
        );
    }

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: categoryColors[category] || categoryColors.default,
                    stroke: '#262626',
                    strokeWidth: 2,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                }}
                onClick={onClick}
                onMouseEnter={(e) => e.target.style.opacity = 0.8}
                onMouseLeave={(e) => e.target.style.opacity = 1}
            />
            <text
                x={x + width / 2}
                y={y + height / 2 - 8}
                textAnchor="middle"
                fill="#fff"
                fontSize={Math.min(13, width / 9)}
                fontWeight="400"
                fontFamily="'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif"
                style={{
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                }}
            >
                {name?.length > 12 ? `${name.substring(0, 12)}...` : name}
            </text>
            {width > 60 && height > 50 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 12}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.9)"
                    fontSize={Math.min(11, width / 10)}
                    fontWeight="400"
                    fontFamily="'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif"
                    style={{
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                    }}
                >
                    {formatCurrency(totalCost)}
                </text>
            )}
        </g>
    );
};

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;
        return (
            <div className="treemap-tooltip">
                <p className="tooltip-name">{data.name}</p>
                <p className="tooltip-cost">{formatCurrency(data.totalCost)}</p>
                <p className="tooltip-category">{data.category}</p>
                <p className="tooltip-provider">{data.provider}</p>
            </div>
        );
    }
    return null;
};

const AssetTreemap = ({ data, onAssetClick }) => {
    // Transform data for treemap
    const treemapData = data
        .filter(asset => asset.totalCost > 0)
        .map(asset => ({
            name: asset.name || asset.type || 'Unknown',
            size: asset.totalCost,
            totalCost: asset.totalCost,
            category: asset.properties?.category || 'Other',
            provider: asset.properties?.provider || 'Unknown',
            type: asset.type,
            original: asset
        }))
        .sort((a, b) => b.size - a.size);

    if (treemapData.length === 0) {
        return (
            <Tile className="asset-treemap-tile">
                <h4>Cost Distribution</h4>
                <p className="no-data-message">No cost data available</p>
            </Tile>
        );
    }

    return (
        <Tile className="asset-treemap-tile">
            <div className="treemap-header">
                <h4>Cost Distribution by Asset</h4>
                <div className="treemap-legend">
                    {Object.entries(categoryColors).filter(([key]) => key !== 'default').map(([category, color]) => (
                        <div key={category} className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: color }} />
                            <span className="legend-label">{category}</span>
                        </div>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
                <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#262626"
                    content={<CustomizedContent />}
                    onClick={(node) => {
                        if (onAssetClick && node?.original) {
                            onAssetClick(node.original);
                        }
                    }}
                >
                    <Tooltip content={<CustomTooltip />} />
                </Treemap>
            </ResponsiveContainer>
            <p className="treemap-hint">Click on any asset to filter the table below</p>
        </Tile>
    );
};

export default AssetTreemap;
