import React, { useEffect, useState } from "react";
import { Grid, Column, Button, SkeletonText, Dropdown } from "@carbon/react";
import { Renew } from "@carbon/icons-react";
import AssetService from "../services/asset";
import AssetsTable from "../components/Assets/AssetsTable";
import SummaryCards from "../components/Assets/SummaryCards";
import CostDistributionChart from "../components/Assets/CostDistributionChart";
import EmptyState from "../components/Assets/EmptyState";
import Page from "../components/Page";
import "./Assets.css";

const TIME_WINDOWS = [
    { id: "today", label: "Today" },
    { id: "7d", label: "Last 7 days" },
    { id: "30d", label: "Last 30 days" },
    { id: "60d", label: "Last 60 days" },
    { id: "90d", label: "Last 90 days" },
];

const AssetsPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [timeWindow, setTimeWindow] = useState(TIME_WINDOWS[1]); // Default to 7d
    const [selectedAssetType, setSelectedAssetType] = useState({ id: "all", label: "All Types" });

    const loadData = async (window = timeWindow.id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await AssetService.fetchAssets(window, "type");
            setData(result.data);
        } catch (err) {
            setError(err.message || "Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Get unique asset types for filter
    const assetTypes = data ? [
        { id: "all", label: "All Types" },
        ...Array.from(new Set(Object.values(data).map(a => a.type)))
            .map(type => ({ id: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))
    ] : [{ id: "all", label: "All Types" }];

    // Filter assets by selected type
    const filteredAssets = data && selectedAssetType.id !== "all"
        ? Object.fromEntries(
            Object.entries(data).filter(([_, asset]) => asset.type === selectedAssetType.id)
        )
        : data;

    const hasAssets = filteredAssets && Object.keys(filteredAssets).length > 0;

    const handleTimeWindowChange = ({ selectedItem }) => {
        setTimeWindow(selectedItem);
        loadData(selectedItem.id);
    };

    return (
        <Page active="assets">
            <div className="assets-page-container">
                <div className="assets-header">
                    <div>
                        <h1>Assets</h1>
                        <p className="assets-subtitle">
                            View infrastructure costs by individual asset (Nodes, Disks, Load Balancers, etc.)
                        </p>
                    </div>
                    <div className="assets-controls">
                        <Dropdown
                            id="time-window-selector"
                            titleText="Time Window"
                            label="Select time range"
                            items={TIME_WINDOWS}
                            itemToString={(item) => (item ? item.label : "")}
                            selectedItem={timeWindow}
                            onChange={handleTimeWindowChange}
                            size="md"
                        />
                        <Dropdown
                            id="asset-type-filter"
                            titleText="Asset Type"
                            label="Filter by type"
                            items={assetTypes}
                            itemToString={(item) => (item ? item.label : "")}
                            selectedItem={selectedAssetType}
                            onChange={({ selectedItem }) => setSelectedAssetType(selectedItem)}
                            size="md"
                        />
                    </div>
                </div>

                {loading && (
                    <div className="loading-container">
                        <SkeletonText heading paragraph lineCount={4} />
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <h4>Unable to Load Assets</h4>
                        <p>{error}</p>
                        <Button
                            kind="tertiary"
                            renderIcon={Renew}
                            onClick={() => loadData()}
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {!loading && !error && !hasAssets && <EmptyState />}

                {!loading && !error && hasAssets && (
                    <>
                        <SummaryCards
                            assets={filteredAssets}
                            previousAssets={undefined}
                            currency="USD"
                            timeWindow={timeWindow.id}
                        />

                        <Grid>
                            <Column lg={16} md={8} sm={4}>
                                <CostDistributionChart assets={filteredAssets} currency="USD" />
                            </Column>
                        </Grid>

                        <Grid>
                            <Column lg={16} md={8} sm={4}>
                                <AssetsTable assets={filteredAssets} currency="USD" />
                            </Column>
                        </Grid>
                    </>
                )}
            </div>
        </Page>
    );
};

export default AssetsPage;
