import React from 'react';
import {
    Select,
    SelectItem,
    Checkbox,
    Search,
    Tag,
    Button
} from '@carbon/react';
import {
    Renew,
    Filter
} from '@carbon/icons-react';

const windowOptions = [
    { text: "Today", value: "today" },
    { text: "Last 24h", value: "24h" },
    { text: "Last 7 days", value: "7d" },
    { text: "Last 30 days", value: "30d" },
];

const aggregationOptions = [
    { text: "Type", value: "type" },
    { text: "Cluster", value: "cluster" },
    { text: "Project", value: "project" },
    { text: "Service", value: "service" },
    { text: "Category", value: "category" },
    { text: "Provider", value: "provider" },
];

const categoryOptions = [
    { text: "Compute", value: "Compute", color: "#8a3ffc" },
    { text: "Storage", value: "Storage", color: "#0072c3" },
    { text: "Network", value: "Network", color: "#009d9a" },
    { text: "Management", value: "Management", color: "#9f1853" },
];

const AssetFilters = ({
    window,
    setWindow,
    aggregateBy,
    setAggregateBy,
    includeIdle,
    setIncludeIdle,
    onSearch,
    selectedCategories = [],
    onCategoryToggle,
    onRefresh
}) => {
    return (
        <div className="asset-filters">
            <div className="filters-row filters-row-primary">
                <div className="filter-group">
                    <Search
                        size="lg"
                        placeholder="Search assets by name, type, or cluster..."
                        labelText="Search"
                        closeButtonLabelText="Clear search input"
                        id="asset-search"
                        onChange={(e) => onSearch(e.target.value)}
                        className="asset-search"
                    />
                </div>

                <div className="filter-group">
                    <Select
                        id="window-select"
                        labelText="Time Window"
                        value={window}
                        onChange={(e) => setWindow(e.target.value)}
                        size="lg"
                    >
                        {windowOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} text={opt.text} />
                        ))}
                    </Select>
                </div>

                <div className="filter-group">
                    <Select
                        id="aggregate-select"
                        labelText="Group By"
                        value={aggregateBy}
                        onChange={(e) => setAggregateBy(e.target.value)}
                        size="lg"
                    >
                        {aggregationOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} text={opt.text} />
                        ))}
                    </Select>
                </div>

                <div className="filter-group filter-checkbox">
                    <Checkbox
                        labelText="Include Idle Costs"
                        id="include-idle"
                        checked={includeIdle}
                        onChange={(e, { checked }) => setIncludeIdle(checked)}
                    />
                </div>

                {onRefresh && (
                    <div className="filter-group">
                        <Button
                            kind="ghost"
                            size="lg"
                            renderIcon={Renew}
                            iconDescription="Refresh data"
                            hasIconOnly
                            onClick={onRefresh}
                            tooltipPosition="bottom"
                        />
                    </div>
                )}
            </div>

            {onCategoryToggle && (
                <div className="filters-row filters-row-secondary">
                    <div className="filter-label">
                        <Filter size={16} />
                        <span>Filter by category:</span>
                    </div>
                    <div className="category-tags">
                        {categoryOptions.map((cat) => {
                            const isSelected = selectedCategories.includes(cat.value);
                            return (
                                <Tag
                                    key={cat.value}
                                    type={isSelected ? "blue" : "gray"}
                                    onClick={() => onCategoryToggle(cat.value)}
                                    className="category-tag"
                                    style={{
                                        cursor: 'pointer',
                                        borderLeft: isSelected ? `3px solid ${cat.color}` : 'none'
                                    }}
                                >
                                    {cat.text}
                                </Tag>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetFilters;
