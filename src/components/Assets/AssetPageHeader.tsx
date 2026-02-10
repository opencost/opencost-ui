import React from 'react';
import { Button, Dropdown } from '@carbon/react';
import { Renew } from '@carbon/react/icons';
import type { DropdownOption } from '../../types/assets';

interface AssetPageHeaderProps {
    title?: string;
    dateRangeOptions?: DropdownOption[];
    selectedDateRange?: string;
    onDateRangeChange?: (item: DropdownOption) => void;
    currencyOptions?: DropdownOption[];
    selectedCurrency?: string;
    onCurrencyChange?: (item: DropdownOption) => void;
    aggregationOptions?: DropdownOption[];
    selectedAggregation?: string;
    onAggregationChange?: (item: DropdownOption) => void;
    onRefresh?: () => void;
}

/**
 * AssetPageHeader - Page header with title and controls
 * Includes dropdowns for date range, currency, and aggregation
 */
const AssetPageHeader: React.FC<AssetPageHeaderProps> = ({
    title = 'Assets Costs',
    dateRangeOptions = [],
    selectedDateRange,
    onDateRangeChange,
    currencyOptions = [],
    selectedCurrency,
    onCurrencyChange,
    aggregationOptions = [],
    selectedAggregation,
    onAggregationChange,
    onRefresh,
}) => {

    const handleDropdownChange = (handler?: (item: DropdownOption) => void) =>
        ({ selectedItem }: { selectedItem: DropdownOption }) => {
            if (handler && selectedItem) handler(selectedItem);
        };

    return (
        <div className="asset-page-header">
            <h1 className="header-title">{title}</h1>
            <div className="header-controls">
                {/* Date Range */}
                <span className="date-label">Date range</span>
                <Dropdown
                    id="date-range-dropdown"
                    titleText=""
                    label="Select period"
                    items={dateRangeOptions}
                    itemToString={(item: DropdownOption) => item?.text || ''}
                    selectedItem={dateRangeOptions.find((o) => o.id === selectedDateRange)}
                    onChange={handleDropdownChange(onDateRangeChange)}
                    size="sm"
                    style={{ minWidth: '140px' }}
                />

                {/* Currency */}
                {currencyOptions.length > 0 && (
                    <>
                        <span className="date-label">Currency</span>
                        <Dropdown
                            id="currency-dropdown"
                            titleText=""
                            label="Currency"
                            items={currencyOptions}
                            itemToString={(item: DropdownOption) => item?.text || ''}
                            selectedItem={currencyOptions.find((o) => o.id === selectedCurrency)}
                            onChange={handleDropdownChange(onCurrencyChange)}
                            size="sm"
                            style={{ minWidth: '110px' }}
                        />
                    </>
                )}

                {/* Aggregation */}
                {aggregationOptions.length > 0 && (
                    <>
                        <span className="date-label">Aggregation</span>
                        <Dropdown
                            id="aggregation-dropdown"
                            titleText=""
                            label="Aggregation"
                            items={aggregationOptions}
                            itemToString={(item: DropdownOption) => item?.text || ''}
                            selectedItem={aggregationOptions.find((o) => o.id === selectedAggregation)}
                            onChange={handleDropdownChange(onAggregationChange)}
                            size="sm"
                            style={{ minWidth: '140px' }}
                        />
                    </>
                )}

                {/* Refresh */}
                <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Renew}
                    onClick={onRefresh}
                    hasIconOnly
                    iconDescription="Refresh data"
                    tooltipPosition="bottom"
                />
            </div>
        </div>
    );
};

export default React.memo(AssetPageHeader);
