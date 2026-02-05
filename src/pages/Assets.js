import React, { useEffect, useState } from "react";
import {
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableContainer,
    Pagination,
    Dropdown,
    Loading,
} from "@carbon/react";
import AssetsService from "../services/assets";
import Header from "../components/Header";
import { SidebarNav } from "../components/Nav/SidebarNav";
import Footer from "../components/Footer";
import { toCurrency } from "../util";

const headerData = [
    { header: "Name", key: "name" },
    { header: "Type", key: "type" },
    { header: "Cluster", key: "cluster" },
    { header: "Provider ID", key: "providerID" },
    { header: "Cost", key: "cost" },
    { header: "Total Cost", key: "totalCost" },
];

const windows = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "7d", label: "Last 7 days" },
    { id: "30d", label: "Last 30 days" },
];

const Assets = () => {
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState([]);
    const [window, setWindow] = useState(windows[2]); // Default to 7d
    const [firstRowIndex, setFirstRowIndex] = useState(0);
    const [currentPageSize, setCurrentPageSize] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await AssetsService.fetchAssets(window.id, "type", { accumulate: true });
                // The API returns an array of AssetSets, usually length 1 if accumulated
                const assetList = data.length > 0 ? Object.values(data[0]) : [];

                const formattedAssets = assetList.map((asset, index) => ({
                    id: `${index}`,
                    name: asset.name || "N/A",
                    type: asset.type || "N/A",
                    cluster: asset.properties?.cluster || "N/A",
                    providerID: asset.properties?.providerID || "N/A",
                    cost: toCurrency(asset.cost || 0),
                    totalCost: toCurrency(asset.totalCost || 0),
                }));

                setAssets(formattedAssets);
            } catch (error) {
                console.error("Failed to fetch assets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [window]);

    const pagedRows = assets.slice(firstRowIndex, firstRowIndex + currentPageSize);

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <SidebarNav active="/assets" />
            <div style={{ flex: 1, padding: "2rem", marginLeft: "200px" }}>
                <Header headerTitle="Assets" />

                <div style={{ marginBottom: "1rem", width: "300px" }}>
                    <Dropdown
                        id="window-select"
                        label="Select Window"
                        items={windows}
                        selectedItem={window}
                        onChange={({ selectedItem }) => setWindow(selectedItem)}
                    />
                </div>

                {loading ? (
                    <Loading />
                ) : (
                    <TableContainer title="Cloud Assets" description="Overview of backing cost data broken down by individual assets.">
                        <DataTable rows={pagedRows} headers={headerData}>
                            {({ rows, headers, getHeaderProps, getTableProps }) => (
                                <Table {...getTableProps()}>
                                    <TableHead>
                                        <TableRow>
                                            {headers.map((header) => {
                                                const { key, ...headerProps } = getHeaderProps({ header });
                                                return (
                                                    <TableHeader key={key} {...headerProps}>
                                                        {header.header}
                                                    </TableHeader>
                                                );
                                            })}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row.cells.map((cell) => (
                                                    <TableCell key={cell.id}>{cell.value}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </DataTable>
                        <Pagination
                            backwardText="Previous page"
                            forwardText="Next page"
                            itemsPerPageText="Items per page:"
                            page={firstRowIndex / currentPageSize + 1}
                            pageSize={currentPageSize}
                            pageSizes={[10, 20, 30, 40, 50]}
                            totalItems={assets.length}
                            onChange={({ page, pageSize }) => {
                                if (pageSize !== currentPageSize) {
                                    setCurrentPageSize(pageSize);
                                }
                                setFirstRowIndex(pageSize * (page - 1));
                            }}
                        />
                    </TableContainer>
                )}
                <Footer />
            </div>
        </div>
    );
};

export default Assets;
