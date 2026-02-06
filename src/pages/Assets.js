import React, { useEffect, useState, useMemo } from "react";
import {
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
    TableContainer,
    Dropdown,
    Loading,
    Tile,
    Tag,
    Button,
    Grid,
    Column
} from "@carbon/react";

import { Renew } from "@carbon/icons-react";

import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AssetsService from "../services/assets";
import AssetsChart from "../components/assets/AssetsChart";

// Options for filters
const windowOptions = [
    { id: "today", text: "Today" },
    { id: "yesterday", text: "Yesterday" },
    { id: "7d", text: "Last 7 days" },
    { id: "30d", text: "Last 30 days" },
];

const aggregateOptions = [
    { id: "type", text: "Asset Type" },
    { id: "provider", text: "Provider" },
    { id: "cluster", text: "Cluster" },
    { id: "node", text: "Node" },
];

// Table column headers
const headers = [
    { key: "name", header: "Name" },
    { key: "type", header: "Type" },
    { key: "provider", header: "Provider" },
    { key: "cluster", header: "Cluster" },
    { key: "cpuCost", header: "CPU Cost" },
    { key: "ramCost", header: "RAM Cost" },
    { key: "gpuCost", header: "GPU Cost" },
    { key: "totalCost", header: "Total Cost" },
];

// Helper: Format currency
const toCurrency = (value, currency = "USD") => {
    if (value === undefined || value === null) return " Not Provided ";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(value);
};

const Assets = () => {
    // State
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [assetsData, setAssetsData] = useState([]);

    // Filters
    const [window, setWindow] = useState("7d");
    const [aggregateBy, setAggregateBy] = useState("type");

    // Fetch data on mount and when filters change
    useEffect(() => {
        fetchData();
    }, [window, aggregateBy]);

    async function fetchData() {
        setLoading(true);
        setErrors([]);

        try {
            const response = await AssetsService.fetchAssets(window, aggregateBy);

            if (response.data && response.data.length > 0) {
                // Transform API response to table format
                const assets = Object.entries(response.data[0]).map(([name, asset]) => ({
                    id: name,
                    name: name,
                    type: asset.type || "Unknown",
                    provider: asset.properties?.provider || "-",
                    cluster: asset.properties?.cluster || "-",
                    cpuCost: asset.cpuCost || 0,
                    ramCost: asset.ramCost || 0,
                    gpuCost: asset.gpuCost || 0,
                    totalCost: asset.totalCost || 0,
                }));

                setAssetsData(assets);
            }else{
                setAssetsData([]);
            }
        }catch (err) {
            setErrors([{ primary: "Failed to load assets", secondary: err.message }]);
        }

        setLoading(false);
    }

    // Calculate totals for summary tiles
    const totals = useMemo(() => {
        return assetsData.reduce(
            (acc, asset) => ({
                total: acc.total + asset.totalCost,
                cpu: acc.cpu + asset.cpuCost,
                ram: acc.ram + asset.ramCost,
                gpu: acc.gpu + asset.gpuCost,
            }),
            { total: 0, cpu: 0, ram: 0, gpu: 0 }
        );
    }, [assetsData]);

    // Group data for chart
    const chartData = useMemo(() => {
        const grouped = {};
        assetsData.forEach((asset) => {
            const key = asset.type;
            grouped[key] = (grouped[key] || 0) + asset.totalCost;
        });
        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [assetsData]);

    return (
        <Page active="/assets">
            <Header headerTitle="Assets">
                <Button
                    kind="ghost"
                    renderIcon={Renew}
                    iconDescription="Refresh"
                    onClick={fetchData}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Header>

            {/* Summary Tiles */}
            <Grid className="assets-summary" style={{ marginBottom: "2rem" }}>
                <Column lg={4} md={4} sm={4}>
                    <Tile>
                        <h4>Total Cost</h4>
                        <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
                            {toCurrency(totals.total)}
                        </p>
                    </Tile>
                </Column>
                <Column lg={4} md={4} sm={4}>
                    <Tile>
                        <h4>CPU Cost</h4>
                        <p style={{ fontSize: "1.5rem" }}>{toCurrency(totals.cpu)}</p>
                    </Tile>
                </Column>
                <Column lg={4} md={4} sm={4}>
                    <Tile>
                        <h4>RAM Cost</h4>
                        <p style={{ fontSize: "1.5rem" }}>{toCurrency(totals.ram)}</p>
                    </Tile>
                </Column>
            </Grid>

            {/* Filters */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <Dropdown
                    id="window-dropdown"
                    titleText="Time Range"
                    label="Select time range"
                    items={windowOptions}
                    selectedItem={windowOptions.find((o) => o.id === window)}
                    itemToString={(item) => (item ? item.text : "")}
                    onChange={({ selectedItem }) => {
                        if (selectedItem) {
                            setWindow(selectedItem.id);
                        }
                    }}
                />
                <Dropdown
                    id="aggregate-dropdown"
                    titleText="Group By"
                    label="Select grouping"
                    items={aggregateOptions}
                    selectedItem={aggregateOptions.find((o) => o.id === aggregateBy)}
                    itemToString={(item) => (item ? item.text : "")}
                    onChange={({ selectedItem }) => {
                        if (selectedItem) {
                            setAggregateBy(selectedItem.id);
                        }
                    }}
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                    <Loading description="Loading assets..." withOverlay={false} />
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <Tile style={{ backgroundColor: "#fff1f1", marginBottom: "1rem" }}>
                    {errors.map((err, i) => (
                        <div key={i}>
                            <strong>{err.primary}</strong>
                            <p>{err.secondary}</p>
                        </div>
                    ))}
                </Tile>
            )}

            {/* Chart */}
            {!loading && assetsData.length > 0 && (
                <div style={{ marginBottom: "3rem" }}>
                    <AssetsChart data={chartData} />
                </div>
            )}

            {/* Data Table */}
            {!loading && (
                <div style={{ marginTop: "2rem" }}>
                    <DataTable rows={assetsData} headers={headers}>
                        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                            <TableContainer title="Asset Details">
                                <TableToolbar>
                                    <TableToolbarContent>
                                        <TableToolbarSearch
                                            placeholder="Search assets..."
                                            onChange={() => {}}
                                        />
                                    </TableToolbarContent>
                                </TableToolbar>
                                <Table {...getTableProps()}>
                                    <TableHead>
                                        <TableRow>
                                            {headers.map((header) => (
                                                <TableHeader {...getHeaderProps({ header })} key={header.key}>
                                                    {header.header}
                                                </TableHeader>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row) => (
                                            <TableRow {...getRowProps({ row })} key={row.id}>
                                                {row.cells.map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {cell.info.header === "type" ? (
                                                            <Tag type={getTagType(cell.value)}>{cell.value}</Tag>
                                                        ) : ["cpuCost", "ramCost", "gpuCost", "totalCost"].includes(
                                                            cell.info.header
                                                        ) ? (
                                                            toCurrency(cell.value)
                                                        ) : (
                                                            cell.value
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DataTable>
                </div>
            )}

            <Footer />
        </Page>
    );
};

// Helper: Get tag color based on asset type
function getTagType(assetType) {
    const types = {
        Node: "blue",
        Disk: "green",
        LoadBalancer: "purple",
        Network: "cyan",
        ClusterManagement: "gray",
    };
    return types[assetType] || "gray";
}

export default React.memo(Assets);