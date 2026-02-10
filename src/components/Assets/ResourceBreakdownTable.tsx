import React, { useState, useMemo } from 'react';
import {
    DataTable,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Pagination,
    Button,
    Dropdown,
    DataTableSkeleton,
    InlineNotification,
    Search,
} from '@carbon/react';
import {
    Export,
    Cube,
    StorageRequest,
    NetworkOverlay,
    Settings,
    Help,
} from '@carbon/react/icons';
import { LoadingState, EmptyState, ErrorState } from '../core';
import type { ResourceBreakdownTableProps, TableHeader as AssetTableHeader, DropdownOption } from '../../types/assets';

const ResourceBreakdownTable: React.FC<ResourceBreakdownTableProps> = ({
    rows = [],
    onExport,
    typeFilterOptions = [],
    selectedType = 'all',
    onTypeChange,
    loading = false,
    error = null,
    onRowClick,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Table headers configuration
    const headers: AssetTableHeader[] = [
        { key: 'name', header: 'Resource Name' },
        { key: 'type', header: 'Type' },
        { key: 'cluster', header: 'Cluster' },
        { key: 'category', header: 'Category' },
        { key: 'provider', header: 'Provider' },
        { key: 'cost', header: 'Cost ($)' },
        { key: 'carbon', header: 'Carbon (kg)' },
    ];

    // Filter rows based on search query
    const filteredRows = useMemo(() => {
        if (!searchQuery.trim()) return rows;

        const query = searchQuery.toLowerCase();
        return rows.filter(
            (row) =>
                row.name?.toLowerCase().includes(query) ||
                row.type?.toLowerCase().includes(query) ||
                row.cluster?.toLowerCase().includes(query) ||
                row.category?.toLowerCase().includes(query) ||
                row.provider?.toLowerCase().includes(query)
        );
    }, [rows, searchQuery]);

    // Paginate filtered rows
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, currentPage, pageSize]);

    // Format rows for DataTable
    const tableRows = paginatedRows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        cluster: row.cluster,
        category: row.category,
        provider: row.provider,
        cost: row.cost,
        carbon: row.carbon,
    }));

    const handleTypeDropdownChange = ({ selectedItem }: { selectedItem: DropdownOption }) => {
        if (onTypeChange && selectedItem) {
            onTypeChange(selectedItem);
            setCurrentPage(1);
        }
    };

    const handleSearchChange = (e: any) => {
        const value = typeof e === 'string' ? e : (e?.target?.value || '');
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handlePaginationChange = ({ page, pageSize: newPageSize }: { page: number; pageSize: number }) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
    };

    // Helper to get icon for type
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Node': return <Cube size={16} />;
            case 'Disk': return <StorageRequest size={16} />;
            case 'LoadBalancer': return <NetworkOverlay size={16} />;
            case 'ClusterManagement': return <Settings size={16} />;
            default: return <Help size={16} />;
        }
    };

    // Helper to get category class
    const getCategoryClass = (cat: string) => {
        const lower = cat.toLowerCase();
        if (lower.includes('compute')) return 'cell-category--compute';
        if (lower.includes('storage')) return 'cell-category--storage';
        if (lower.includes('network')) return 'cell-category--network';
        if (lower.includes('management')) return 'cell-category--management';
        return 'cell-category--other';
    };

    // Loading State
    if (loading) {
        return (
            <div className="resource-table-container">
                <div className="chart-title-large">Resource-Level Breakdown</div>
                <LoadingState minHeight="300px" />
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="resource-table-container">
                <div className="chart-title-large">Resource-Level Breakdown</div>
                <ErrorState error={error} />
            </div>
        );
    }

    return (
        <div>
            {/* Header Section */}
            <div className="margin-bottom-05">
                <div className="chart-title-large">Resource-Level Breakdown</div>
            </div>

            {/* Controls Row: Search + Actions */}
            <div className="table-controls">
                {/* Search Box - Reduced Width */}
                <div className="search-container-width">
                    <Search
                        size="lg"
                        labelText="Search resources"
                        placeholder="Search resources"
                        onChange={handleSearchChange}
                        value={searchQuery}
                        className="white-bg-input"
                    />
                </div>

                {/* Actions: Filter & Export on the right */}
                <div className="actions-container">
                    {/* Type Filter */}
                    {typeFilterOptions.length > 0 && (
                        <Dropdown
                            id="type-filter-dropdown"
                            titleText=""
                            label="Type"
                            items={typeFilterOptions}
                            itemToString={(item: DropdownOption) => item?.text || ''}
                            selectedItem={typeFilterOptions.find((o) => o.id === selectedType)}
                            onChange={onTypeChange ? (e) => e.selectedItem && onTypeChange(e.selectedItem) : undefined}
                            size="md"
                            className="white-bg-dropdown dropdown-min-width"
                        />
                    )}
                    <Button
                        kind="ghost"
                        size="md"
                        renderIcon={Export}
                        onClick={onExport}
                        iconDescription="Export"
                        className="white-bg-button button-border"
                    >
                        Export
                    </Button>
                </div>
            </div>

            {/* Table Container */}
            <div className="resource-table-container margin-top-0">
                {rows.length === 0 ? (
                    <EmptyState
                        title="No Resources Found"
                        message="No resource data is available for the selected filters."
                    />
                ) : (
                    <DataTable rows={tableRows} headers={headers} isSortable>
                        {({
                            rows: tableDataRows,
                            headers: tableHeaders,
                            getTableProps,
                            getHeaderProps,
                            getRowProps,
                        }) => (
                            <TableContainer>
                                <Table {...getTableProps()} className="styled-data-table">
                                    <TableHead>
                                        <TableRow>
                                            {tableHeaders.map((header) => (
                                                <TableHeader
                                                    {...getHeaderProps({ header })}
                                                    key={header.key}
                                                    isSortable
                                                >
                                                    {header.header}
                                                </TableHeader>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableDataRows.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={headers.length} className="text-center-padding-24">
                                                    No resources match your search
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            tableDataRows.map((row) => (
                                                <TableRow
                                                    {...getRowProps({ row })}
                                                    key={row.id}
                                                    onClick={() => onRowClick && onRowClick(row.id)}
                                                    className="clickable-row"
                                                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                                >
                                                    {row.cells.map((cell) => {
                                                        // Custom Cell Rendering
                                                        if (cell.info.header === 'type') {
                                                            return (
                                                                <TableCell key={cell.id}>
                                                                    <div className="cell-type">
                                                                        {getTypeIcon(cell.value)}
                                                                        {cell.value}
                                                                    </div>
                                                                </TableCell>
                                                            );
                                                        }
                                                        if (cell.info.header === 'category') {
                                                            return (
                                                                <TableCell key={cell.id}>
                                                                    <span className={`cell-category ${getCategoryClass(cell.value)}`}>
                                                                        {cell.value}
                                                                    </span>
                                                                </TableCell>
                                                            );
                                                        }
                                                        if (cell.info.header === 'cost') {
                                                            return (
                                                                <TableCell key={cell.id} className="cell-cost">
                                                                    {cell.value}
                                                                </TableCell>
                                                            );
                                                        }
                                                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                                                    })}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                                <Pagination
                                    backwardText="Previous page"
                                    forwardText="Next page"
                                    itemsPerPageText="Items per page:"
                                    page={currentPage}
                                    pageNumberText="Page Number"
                                    pageSize={pageSize}
                                    pageSizes={[5, 10, 25, 50]}
                                    totalItems={filteredRows.length}
                                    onChange={handlePaginationChange}
                                />
                            </TableContainer>
                        )}
                    </DataTable>
                )}
            </div>
        </div>
    );
};

export default React.memo(ResourceBreakdownTable);
