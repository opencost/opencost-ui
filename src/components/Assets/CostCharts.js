import React, { useMemo } from 'react';
import { Tile } from '@carbon/react';
import { SimpleBarChart, DonutChart } from '@carbon/charts-react';
import { formatCurrency } from '../../utils/assets';
import "@carbon/charts/styles.css";

const CostCharts = ({ metrics, currency }) => {
    // Prepare Chart Data
    const barChartData = useMemo(() => [
        { group: "Compute (Nodes)", value: metrics.nodeCost },
        { group: "Storage (Disks)", value: metrics.diskCost },
        { group: "Network (LB)", value: metrics.lbCost },
    ], [metrics]);

    const donutChartData = useMemo(() => [
        { group: "Nodes", value: metrics.nodeCost },
        { group: "Disks", value: metrics.diskCost },
        { group: "LoadBalancers", value: metrics.lbCost },
    ], [metrics]);

    const barChartOptions = {
        title: "",
        axes: {
            left: {
                mapsTo: "value",
                title: `Cost (${currency})`,
                scaleType: "linear",
            },
            bottom: {
                mapsTo: "group",
                scaleType: "labels"
            },
        },
        bars: {
            maxWidth: 60,
        },
        color: {
            scale: {
                "Compute (Nodes)": "#818cf8", // Soft Indigo (400)
                "Storage (Disks)": "#34d399", // Soft Emerald (400)
                "Network (LB)": "#fbbf24", // Soft Amber (400)
            },
        },
        height: "280px",
        theme: "g10",
    };

    const donutChartOptions = {
        title: "",
        resizable: true,
        donut: {
            center: {
                label: "Total",
                number: metrics.totalCost,
                numberFormatter: (value) => formatCurrency(value, currency),
                numberFontSize: () => 18,
            },
        },
        pie: {
            labels: {
                enabled: false,
            },
        },
        color: {
            scale: {
                Nodes: "#818cf8",
                Disks: "#34d399",
                LoadBalancers: "#fbbf24",
            },
        },
        legend: {
            alignment: "center",
        },
        height: "280px",
        theme: "g10",
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "24px",
                marginBottom: "32px",
            }}
        >
            <Tile
                style={{
                    borderRadius: "24px",
                    padding: "32px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                    background: "rgba(255, 255, 255, 0.8)", // More opaque
                    border: "1px solid rgba(255,255,255,1)",
                    // Removed backdrop-filter
                }}
            >
                <h4 style={{ marginBottom: "16px", fontWeight: 600 }}>Cost by Asset Type</h4>
                <SimpleBarChart data={barChartData} options={barChartOptions} />
            </Tile>
            <Tile
                style={{
                    borderRadius: "24px",
                    padding: "32px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                    background: "rgba(255, 255, 255, 0.8)", // Match Bar Chart
                    border: "1px solid rgba(255,255,255,1)",
                    // Removed backdrop-filter
                }}
            >
                <h4 style={{ marginBottom: "16px", fontWeight: 600 }}>Cost Distribution</h4>
                <DonutChart data={donutChartData} options={donutChartOptions} />
            </Tile>
        </div>
    );
};

export default CostCharts;
