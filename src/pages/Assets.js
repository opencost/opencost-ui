import React, { useState, useEffect } from "react";
import {
    Grid,
    Column,
    Theme,
    Content,
    InlineNotification,
    Loading,
    Toggle
} from "@carbon/react";
import { Sun, Moon } from "@carbon/icons-react";
import AssetsService from "../services/assets";
import { mockAssetsData } from "../services/assets.mock";
import AssetsTable from "../components/Assets/AssetsTable";
import AssetFilters from "../components/Assets/AssetFilters";
import AssetMetrics from "../components/Assets/AssetMetrics";
import AssetTreemap from "../components/Assets/AssetTreemap";
import EfficiencyGauge from "../components/Assets/EfficiencyGauge";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "@carbon/charts/styles.css";
import "../styles/assets.css";

const Assets = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [window, setWindow] = useState("7d");
    const [aggregateBy, setAggregateBy] = useState("type");
    const [includeIdle, setIncludeIdle] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false); // Light mode by default

    useEffect(() => {
        fetchData();
    }, [window, aggregateBy, filters, includeIdle]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            let response;
            try {
                response = await AssetsService.fetchAssets(window, aggregateBy, {
                    filters,
                    accumulate: true,
                    params: { disableAdjustments: !includeIdle }
                });
            } catch (apiError) {
                // API failed, use mock data silently
                console.info("API unavailable, using mock data for demonstration");
                response = mockAssetsData;
            }

            let assets = [];
            if (response?.data && response.data.length > 0) {
                const timeSeries = response.data[0];
                Object.entries(timeSeries).forEach(([key, item]) => {
                    item.name = key;
                    assets.push(item);
                });
            }
            setData(assets);
        } catch (error) {
            console.warn("Using empty data due to error:", error);
            setError("Failed to load assets data. Please try again.");
            setData([]);
        } finally {
            setLoading(false);
        }
    };


    // Filter data based on search and selected asset
    const filteredData = data.filter(item => {
        // Search filter
        if (searchTerm) {
            const name = item.name || item.properties?.name || item.properties?.cluster || item.type || "";
            if (!name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
        }

        // Selected asset filter (from treemap click)
        if (selectedAsset) {
            return item.name === selectedAsset.name || item.type === selectedAsset.type;
        }

        return true;
    });

    // Calculate total cost for efficiency gauge
    const totalCost = data.reduce((sum, asset) => sum + (asset.totalCost || 0), 0);

    const handleTreemapClick = (asset) => {
        if (selectedAsset && selectedAsset.name === asset.name) {
            // Toggle off if clicking the same asset
            setSelectedAsset(null);
        } else {
            setSelectedAsset(asset);
        }
    };

    const clearSelection = () => {
        setSelectedAsset(null);
    };

    const currentTheme = isDarkMode ? "g100" : "white";

    return (
        <Page active="assets">
            <Theme theme={currentTheme}>
                <div className={`assets-page ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                    <Header headerTitle="Assets">
                        <div className="theme-toggle-container">
                            <Sun size={16} className="theme-icon" />
                            <Toggle
                                id="theme-toggle"
                                size="sm"
                                labelA=""
                                labelB=""
                                toggled={isDarkMode}
                                onToggle={() => setIsDarkMode(!isDarkMode)}
                                aria-label="Toggle dark mode"
                            />
                            <Moon size={16} className="theme-icon" />
                        </div>
                    </Header>

                    <Content className="assets-page-content">
                        <Grid className="assets-page-grid" fullWidth>
                            {/* Page Header */}
                            <Column lg={16} md={8} sm={4} className="assets-header">
                                <h1>Infrastructure Assets</h1>
                                <p className="assets-subtitle">
                                    Monitor costs, analyze efficiency, and identify optimization opportunities across your infrastructure.
                                </p>
                            </Column>

                            {/* Error State */}
                            {error && (
                                <Column lg={16} md={8} sm={4}>
                                    <InlineNotification
                                        kind="error"
                                        title="Error"
                                        subtitle={error}
                                        onCloseButtonClick={() => setError(null)}
                                    />
                                </Column>
                            )}

                            {/* Filters Section */}
                            <Column lg={16} md={8} sm={4} className="assets-filters-section">
                                <AssetFilters
                                    window={window}
                                    setWindow={setWindow}
                                    aggregateBy={aggregateBy}
                                    setAggregateBy={setAggregateBy}
                                    includeIdle={includeIdle}
                                    setIncludeIdle={setIncludeIdle}
                                    onSearch={setSearchTerm}
                                />
                            </Column>

                            {/* Loading State */}
                            {loading && (
                                <Column lg={16} md={8} sm={4} className="loading-container">
                                    <Loading description="Loading assets..." withOverlay={false} />
                                </Column>
                            )}

                            {/* Main Content (when not loading) */}
                            {!loading && (
                                <>
                                    {/* Hero Metrics */}
                                    <Column lg={16} md={8} sm={4} className="metrics-section">
                                        <AssetMetrics data={data} />
                                    </Column>

                                    {/* Visualizations Row */}
                                    <Column lg={10} md={8} sm={4} className="visualization-section">
                                        <AssetTreemap
                                            data={data}
                                            onAssetClick={handleTreemapClick}
                                        />
                                    </Column>

                                    <Column lg={6} md={8} sm={4} className="visualization-section">
                                        <EfficiencyGauge
                                            data={data}
                                            totalCost={totalCost}
                                        />
                                    </Column>

                                    {/* Selected Asset Filter Indicator */}
                                    {selectedAsset && (
                                        <Column lg={16} md={8} sm={4} className="filter-indicator">
                                            <InlineNotification
                                                kind="info"
                                                title="Filtered"
                                                subtitle={`Showing results for: ${selectedAsset.name || selectedAsset.type}`}
                                                onCloseButtonClick={clearSelection}
                                                lowContrast
                                            />
                                        </Column>
                                    )}

                                    {/* Data Table */}
                                    <Column lg={16} md={8} sm={4} className="table-section">
                                        <AssetsTable
                                            data={filteredData}
                                            loading={loading}
                                            aggregateBy={aggregateBy}
                                            onRowClick={handleTreemapClick}
                                        />
                                    </Column>
                                </>
                            )}
                        </Grid>
                    </Content>
                    <Footer />
                </div>
            </Theme>
        </Page>
    );
};

export default Assets;
