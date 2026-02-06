import React from "react";
import PropTypes from "prop-types";
import { LineChart } from "@carbon/charts-react";

/**
 * CostTrendChart - Line chart showing cost over time
 * Uses Carbon Charts for consistent styling
 */
const CostTrendChart = ({ data, currency = "USD", isLoading = false }) => {
    // Format currency for tooltips
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Chart options
    const options = {
        title: "Cost Trend",
        axes: {
            bottom: {
                title: "Date",
                mapsTo: "date",
                scaleType: "time",
            },
            left: {
                title: `Cost (${currency})`,
                mapsTo: "value",
                scaleType: "linear",
            },
        },
        curve: "curveMonotoneX",
        height: "300px",
        theme: "g100",
        tooltip: {
            valueFormatter: (value) => formatCurrency(value),
        },
        legend: {
            alignment: "center",
            position: "bottom",
        },
        color: {
            scale: {
                "Total Cost": "#0f62fe",
                "CPU Cost": "#8a3ffc",
                "RAM Cost": "#007d79",
                "GPU Cost": "#ee5396",
            },
        },
        points: {
            enabled: true,
            radius: 3,
        },
        toolbar: {
            enabled: false,
        },
    };

    // Empty state
    if (!data || data.length === 0) {
        return (
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
        );
    }

    return <LineChart data={data} options={options} />;
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
