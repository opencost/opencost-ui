import React, { useState } from 'react';
import {
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableContainer,
    TableExpandRow,
    TableExpandedRow,
    TableExpandHeader,
    DataTableSkeleton,
    Tag,
    ProgressBar
} from '@carbon/react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
};

const formatBytes = (bytes) => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let value = bytes;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }
    return `${value.toFixed(2)} ${units[unitIndex]}`;
};

const formatPercent = (value) => {
    return `${(value * 100).toFixed(1)}%`;
};

// Efficiency badge component
const EfficiencyBadge = ({ idlePercent }) => {
    if (idlePercent === null || idlePercent === undefined) {
        return <Tag type="gray">No data</Tag>;
    }

    if (idlePercent > 0.7) {
        return <Tag type="red">High Idle ({formatPercent(idlePercent)})</Tag>;
    } else if (idlePercent > 0.4) {
        return <Tag type="yellow">Moderate ({formatPercent(idlePercent)})</Tag>;
    } else {
        return <Tag type="green">Efficient ({formatPercent(idlePercent)})</Tag>;
    }
};

// Cost bar component
const CostBar = ({ value, maxValue }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="cost-bar-container">
            <span className="cost-value">{formatCurrency(value)}</span>
            <div className="cost-bar-track">
                <div
                    className="cost-bar-fill"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: percentage > 66 ? '#fa4d56' : percentage > 33 ? '#f1c21b' : '#42be65'
                    }}
                />
            </div>
        </div>
    );
};

const AssetsTable = ({ data, loading, aggregateBy, onRowClick }) => {
    const [expandedRows, setExpandedRows] = useState({});

    const headers = [
        { key: 'name', header: 'Name' },
        { key: 'type', header: 'Type' },
        { key: 'category', header: 'Category' },
        { key: 'provider', header: 'Provider' },
        { key: 'efficiency', header: 'Efficiency' },
        { key: 'totalCost', header: 'Total Cost' },
    ];

    // Find max cost for relative bar sizing
    const maxCost = Math.max(...data.map(a => a.totalCost || 0));

    const getIdlePercent = (asset) => {
        if (asset.cpuBreakdown?.idle !== undefined) {
            return asset.cpuBreakdown.idle;
        }
        if (asset.breakdown?.idle !== undefined) {
            return asset.breakdown.idle;
        }
        return null;
    };

    const getRows = (assets) => {
        return assets.map((asset, index) => {
            const name = asset.name || asset.properties?.name || asset.properties?.cluster || asset.type || `Item ${index}`;
            const idlePercent = getIdlePercent(asset);

            return {
                id: String(index),
                name,
                type: asset.type,
                category: asset.properties?.category || '-',
                provider: asset.properties?.provider || '-',
                efficiency: idlePercent,
                totalCost: asset.totalCost,
                // Extra data for expanded view
                cpuCores: asset.cpuCores,
                ramBytes: asset.ramBytes,
                cpuCost: asset.cpuCost,
                ramCost: asset.ramCost,
                gpuCost: asset.gpuCost,
                cpuBreakdown: asset.cpuBreakdown,
                ramBreakdown: asset.ramBreakdown,
                breakdown: asset.breakdown,
                minutes: asset.minutes,
                original: asset
            };
        });
    };

    if (loading) {
        return (
            <DataTableSkeleton
                columnCount={headers.length + 1}
                rowCount={5}
                headers={headers}
            />
        );
    }

    const rows = getRows(data);

    const renderExpandedContent = (row) => {
        const hasResources = row.cpuCores || row.ramBytes || row.cpuCost || row.ramCost || row.gpuCost;
        const hasBreakdown = row.cpuBreakdown || row.ramBreakdown || row.breakdown;

        return (
            <div className="expanded-row-content">
                {hasResources && (
                    <div className="expanded-section">
                        <h5>Resource Details</h5>
                        <div className="resource-grid">
                            {row.cpuCores && (
                                <div className="resource-item">
                                    <span className="resource-label">CPU Cores</span>
                                    <span className="resource-value">{row.cpuCores}</span>
                                </div>
                            )}
                            {row.ramBytes && (
                                <div className="resource-item">
                                    <span className="resource-label">RAM</span>
                                    <span className="resource-value">{formatBytes(row.ramBytes)}</span>
                                </div>
                            )}
                            {row.cpuCost && (
                                <div className="resource-item">
                                    <span className="resource-label">CPU Cost</span>
                                    <span className="resource-value">{formatCurrency(row.cpuCost)}</span>
                                </div>
                            )}
                            {row.ramCost && (
                                <div className="resource-item">
                                    <span className="resource-label">RAM Cost</span>
                                    <span className="resource-value">{formatCurrency(row.ramCost)}</span>
                                </div>
                            )}
                            {row.gpuCost > 0 && (
                                <div className="resource-item">
                                    <span className="resource-label">GPU Cost</span>
                                    <span className="resource-value">{formatCurrency(row.gpuCost)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {hasBreakdown && (
                    <div className="expanded-section">
                        <h5>Utilization Breakdown</h5>
                        <div className="breakdown-grid">
                            {row.cpuBreakdown && (
                                <div className="breakdown-item">
                                    <span className="breakdown-label">CPU</span>
                                    <div className="breakdown-bars">
                                        <div className="breakdown-bar">
                                            <span>User</span>
                                            <ProgressBar value={(row.cpuBreakdown.user || 0) * 100} status="finished" hideLabel />
                                            <span>{formatPercent(row.cpuBreakdown.user || 0)}</span>
                                        </div>
                                        <div className="breakdown-bar">
                                            <span>System</span>
                                            <ProgressBar value={(row.cpuBreakdown.system || 0) * 100} status="active" hideLabel />
                                            <span>{formatPercent(row.cpuBreakdown.system || 0)}</span>
                                        </div>
                                        <div className="breakdown-bar">
                                            <span>Idle</span>
                                            <ProgressBar value={(row.cpuBreakdown.idle || 0) * 100} status="error" hideLabel />
                                            <span>{formatPercent(row.cpuBreakdown.idle || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {row.ramBreakdown && (
                                <div className="breakdown-item">
                                    <span className="breakdown-label">RAM</span>
                                    <div className="breakdown-bars">
                                        <div className="breakdown-bar">
                                            <span>User</span>
                                            <ProgressBar value={(row.ramBreakdown.user || 0) * 100} status="finished" hideLabel />
                                            <span>{formatPercent(row.ramBreakdown.user || 0)}</span>
                                        </div>
                                        <div className="breakdown-bar">
                                            <span>System</span>
                                            <ProgressBar value={(row.ramBreakdown.system || 0) * 100} status="active" hideLabel />
                                            <span>{formatPercent(row.ramBreakdown.system || 0)}</span>
                                        </div>
                                        <div className="breakdown-bar">
                                            <span>Idle</span>
                                            <ProgressBar value={(row.ramBreakdown.idle || 0) * 100} status="error" hideLabel />
                                            <span>{formatPercent(row.ramBreakdown.idle || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {row.breakdown && !row.cpuBreakdown && !row.ramBreakdown && (
                                <div className="breakdown-item">
                                    <span className="breakdown-label">Storage</span>
                                    <div className="breakdown-bars">
                                        <div className="breakdown-bar">
                                            <span>Used</span>
                                            <ProgressBar value={(row.breakdown.user || 0) * 100} status="finished" hideLabel />
                                            <span>{formatPercent(row.breakdown.user || 0)}</span>
                                        </div>
                                        <div className="breakdown-bar">
                                            <span>System</span>
                                            <ProgressBar value={(row.breakdown.system || 0) * 100} status="active" hideLabel />
                                            <span>{formatPercent(row.breakdown.system || 0)}</span>
                                        </div>
                                        <div className="breakdown-bar">
                                            <span>Idle</span>
                                            <ProgressBar value={(row.breakdown.idle || 0) * 100} status="error" hideLabel />
                                            <span>{formatPercent(row.breakdown.idle || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {row.minutes && (
                    <div className="expanded-section">
                        <p className="duration-info">
                            Duration: {(row.minutes / 60).toFixed(1)} hours ({(row.minutes / 1440).toFixed(1)} days)
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // Create a map of row IDs to original row data for quick lookup inside DataTable
    const rowMap = {};
    rows.forEach(row => {
        rowMap[row.id] = row;
    });

    return (
        <DataTable rows={rows} headers={headers} isSortable>
            {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps,
                getTableContainerProps,
                getExpandedRowProps,
            }) => (
                <TableContainer
                    title="Assets List"
                    description={`Found ${rows.length} assets`}
                    {...getTableContainerProps()}
                >
                    <Table {...getTableProps()}>
                        <TableHead>
                            <TableRow>
                                <TableExpandHeader />
                                {headers.map((header) => {
                                    const { key, ...headerProps } = getHeaderProps({ header });
                                    return (
                                        <TableHeader key={key} {...headerProps}>
                                            {header.header}
                                        </TableHeader>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => {
                                // Get original row data from our rowMap (uses row.id)
                                const originalRow = rowMap[row.id];
                                const { key, ...rowProps } = getRowProps({ row });

                                // Handler to toggle row expansion when clicking anywhere on the row
                                const handleRowClick = (e) => {
                                    // Find and click the expand button in this row
                                    const expandButton = e.currentTarget.querySelector('button[aria-label*="Expand"], button.cds--table-expand__button');
                                    if (expandButton) {
                                        expandButton.click();
                                    }
                                };

                                return (
                                    <React.Fragment key={key}>
                                        <TableExpandRow
                                            {...rowProps}
                                            onClick={handleRowClick}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {row.cells.map((cell) => {
                                                if (cell.info.header === 'totalCost') {
                                                    return (
                                                        <TableCell key={cell.id}>
                                                            <CostBar value={cell.value} maxValue={maxCost} />
                                                        </TableCell>
                                                    );
                                                }
                                                if (cell.info.header === 'efficiency') {
                                                    return (
                                                        <TableCell key={cell.id}>
                                                            <EfficiencyBadge idlePercent={cell.value} />
                                                        </TableCell>
                                                    );
                                                }
                                                return <TableCell key={cell.id}>{cell.value}</TableCell>;
                                            })}
                                        </TableExpandRow>
                                        <TableExpandedRow colSpan={headers.length + 1}>
                                            {originalRow ? renderExpandedContent(originalRow) : null}
                                        </TableExpandedRow>
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </DataTable>
    );
};

export default AssetsTable;
