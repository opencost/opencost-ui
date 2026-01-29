import React, { useEffect, useState } from "react";
import "@carbon/styles/css/styles.css"; // Import compiled Carbon CSS
import "../css/assets.css"; // Import custom overrides
import {
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableContainer,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
    TableToolbarMenu,
    TableToolbarAction,
    Pagination,
    Tile,
    Grid,
    Column,
    Button
} from "@carbon/react";
import { Renew, Settings } from "@carbon/icons-react";
import AssetsService from "../services/assets";
import Header from "../components/Header";
import Page from "../components/Page";
import Footer from "../components/Footer";


// Headers for the DataTable
const headers = [
    { key: "name", header: "Name" },
    { key: "type", header: "Type" },
    { key: "provider", header: "Provider" },
    { key: "cost", header: "Total Cost" },
    { key: "cpuCost", header: "CPU Cost" },
    { key: "ramCost", header: "RAM Cost" },
    { key: "efficiency", header: "Efficiency" },
];

const Assets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [firstRowIndex, setFirstRowIndex] = useState(0);
    const [currentPageSize, setCurrentPageSize] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const data = await AssetsService.fetchAssets();
            // Transform data for DataTable
            const formattedData = data.map((item, index) => ({
                id: item.name || index.toString(),
                name: item.name,
                type: item.type,
                provider: item.properties?.provider || "Unknown",
                cost: item.cost?.total?.toFixed(2),
                cpuCost: item.cost?.cpu?.toFixed(2),
                ramCost: item.cost?.ram?.toFixed(2),
                efficiency: item.usage ? `${((item.usage.cpu + item.usage.ram) / 2 * 100).toFixed(0)}%` : "N/A"
            }));
            setAssets(formattedData);
        } catch (err) {
            console.error("Failed to fetch assets", err);
        } finally {
            setLoading(false);
        }
    }

    const getRowItems = (rows) => {
        return rows.slice(firstRowIndex, firstRowIndex + currentPageSize);
    };

    return (
        <Page active="assets">
            <div className="assets-page-container">
                <div className="assets-header">
                    <h2 style={{ marginBottom: '1rem' }}>Assets</h2>
                    <p>View and manage your infrastructure assets.</p>
                </div>

                <div className="assets-kpi-container">
                    <Tile>
                        <h4>Total Assets</h4>
                        <h2 style={{ marginTop: '1rem' }}>{assets.length}</h2>
                    </Tile>
                    {/* Add more KPI tiles here if needed */}
                </div>

                <div className="assets-table-container">
                    <DataTable rows={getRowItems(assets)} headers={headers}>
                        {({ rows, headers, getHeaderProps, getRowProps, onInputChange }) => (
                            <TableContainer title="Assets Overview" description="Detailed cost and usage breakdown per asset.">
                                <TableToolbar>
                                    <TableToolbarContent>
                                        <TableToolbarSearch onChange={onInputChange} />
                                        <TableToolbarMenu>
                                            <TableToolbarAction onClick={fetchData}>
                                                Refresh
                                            </TableToolbarAction>
                                        </TableToolbarMenu>
                                        <Button onClick={fetchData} renderIcon={Renew}>Refresh</Button>
                                    </TableToolbarContent>
                                </TableToolbar>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {headers.map((header) => (
                                                <TableHeader {...getHeaderProps({ header })}>
                                                    {header.header}
                                                </TableHeader>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row) => (
                                            <TableRow {...getRowProps({ row })}>
                                                {row.cells.map((cell) => (
                                                    <TableCell key={cell.id}>{cell.value}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DataTable>
                    <Pagination
                        totalItems={assets.length}
                        backwardText="Previous page"
                        forwardText="Next page"
                        pageSize={currentPageSize}
                        pageSizes={[10, 20, 30, 40, 50]}
                        itemsPerPageText="Items per page"
                        onChange={({ page, pageSize }) => {
                            if (pageSize !== currentPageSize) {
                                setCurrentPageSize(pageSize);
                            }
                            setFirstRowIndex(pageSize * (page - 1));
                        }}
                    />
                </div>
            </div>
            <Footer />
        </Page>
    );
};

export default Assets;
