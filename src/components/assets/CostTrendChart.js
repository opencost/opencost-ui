import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { LineChart } from "@carbon/charts-react";
import { Toggle, Tile } from "@carbon/react";

/**
 * CostTrendChart - Line chart showing cost over time by category
 * Features cumulative toggle and multiple cost categories
 */
const CostTrendChart = ({ data, currency = "USD", isLoading = false }) => {
    const [isCumulative, setIsCumulative] = useState(false);
    const [chartTheme, setChartTheme] = useState("g100"); // Default to dark theme

    // Detect theme changes by watching the data-theme attribute on html element
    useEffect(() => {
        // Function to get current theme from html element
        const getCurrentTheme = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            return theme === 'light' ? 'white' : 'g100';
        };

        // Set initial theme
        setChartTheme(getCurrentTheme());

        // Watch for theme changes using MutationObserver
        const observer = new MutationObserver(() => {
            setChartTheme(getCurrentTheme());
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    // Format currency for tooltips
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Process data for cumulative view if enabled
    const processedData = React.useMemo(() => {
        if (!isCumulative || !data || data.length === 0) {
            return data;
        }

        // Group data by date and accumulate values
        const dateMap = new Map();

        data.forEach(item => {
            const dateKey = new Date(item.date).getTime();
            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { date: item.date, values: {} });
            }
            const dateEntry = dateMap.get(dateKey);
            dateEntry.values[item.group] = (dateEntry.values[item.group] || 0) + item.value;
        });

        // Convert back to array format
        const result = [];
        Array.from(dateMap.values()).forEach(dateEntry => {
            Object.entries(dateEntry.values).forEach(([group, value]) => {
                result.push({
                    date: dateEntry.date,
                    group: group,
                    value: value
                });
            });
        });

        return result;
    }, [data, isCumulative]);

    // Chart options
    const options = {
        title: "Cost Over Time",
        axes: {
            bottom: {
                title: "",
                mapsTo: "date",
                scaleType: "time",
            },
            left: {
                title: "",
                mapsTo: "value",
                scaleType: "linear",
                ticks: {
                    formatter: (value) => `$${value}`,
                },
            },
        },
        curve: "curveNatural",
        height: "320px",
        tooltip: {
            valueFormatter: (value) => formatCurrency(value),
        },
        legend: {
            alignment: "center",
            position: "bottom",
            clickable: true,
        },
        color: {
            scale: {
                "Cloud": "#ee5396",
                "ClusterManagement": "#878d96",
                "Disk": "#33b1ff",       // Cyan
                "LoadBalancer": "#8a3ffc", // Purple
                "Network": "#08bdba",      // Teal (changed from cyan to make it distinct)
                "Node": "#0f62fe",         // Blue
            },
        },
        points: {
            enabled: true,
            radius: 4,
        },
        toolbar: {
            enabled: false,
        },
        timeScale: {
            addSpaceOnEdges: 1,
        },
        theme: chartTheme, // Dynamically set theme based on system preference
    };

    // Empty state
    if (!data || data.length === 0) {
        return (
            <Tile style={{
                padding: "1.5rem",
                border: "1px solid var(--cds-border-subtle-01)"
            }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>
                            Cost Over Time
                        </h4>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "300px",
                            color: "var(--cds-text-secondary)",
                        }}
                    >
                        {isLoading ? "Loading trend data..." : "No trend data available"}
                    </div>
                </div>
            </Tile>
        );
    }

    return (
        <Tile style={{
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle-01)"
        }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                {/* Header with toggle */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>
                        Cost Over Time
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--cds-text-secondary)" }}>
                            Cumulative
                        </span>
                        <Toggle
                            id="cumulative-toggle"
                            size="sm"
                            toggled={isCumulative}
                            onToggle={(checked) => setIsCumulative(checked)}
                            labelA=""
                            labelB=""
                            hideLabel
                        />
                    </div>
                </div>

                {/* Chart */}
                <LineChart data={processedData} options={options} />
            </div>
        </Tile>
    );
};

CostTrendChart.propTypes = {
    /** Array of data points with date, group, and value */
    data: PropTypes.arrayOf(
        PropTypes.shape({
            date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
                .isRequired,
            group: PropTypes.string.isRequired,
            value: PropTypes.number.isRequired,
        })
    ),
    /** Currency code for formatting */
    currency: PropTypes.string,
    /** Loading state */
    isLoading: PropTypes.bool,
};

CostTrendChart.defaultProps = {
    data: [],
    currency: "USD",
    isLoading: false,
};

export default CostTrendChart;
