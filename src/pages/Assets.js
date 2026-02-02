import React, { useEffect, useState } from "react";
import {
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    DataTableSkeleton,
    InlineNotification,
} from "@carbon/react";
import Page from "../components/Page";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AssetsService from "../services/assets";
import "@carbon/styles/css/styles.css";

const getKeyAttribute = (asset) => {
    if (!asset || !asset.type || !asset.properties) {
        return "N/A";
    }

    switch (asset.type) {
        case "Node":
            if (asset.properties.cpuCores) {
                return `${asset.properties.cpuCores} CPU cores`;
            }
            return "Node";

        case "Disk":
            if (asset.properties.size) {
                return `${asset.properties.size}`;
            }
            return "Disk";

        case "LoadBalancer":
            return asset.properties.provider || "LoadBalancer";

        case "Network":
            return asset.properties.provider || "Network";

        default:
            return asset.properties.provider || "N/A";
    }
};


const AssetsPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await AssetsService.fetchAssets();

                // The Assets API returns an object keyed by asset type when aggregated by type.
                const assetsData = response.data || {};

                // Transform the object into an array for the DataTable
                const rows = Object.entries(assetsData).map(([key, asset]) => ({
                    id: key,
                    type: asset.type || "Unknown",
                    totalCost: asset.totalCost ? `$${asset.totalCost.toFixed(2)}` : "$0.00",
                    keyAttribute: getKeyAttribute(asset),
                }));

                setData(rows);
            } catch (err) {
                console.error("Failed to fetch assets:", err);
                setError("Failed to load assets data. Please ensure the OpenCost API is accessible.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const headers = [
        { key: "type", header: "Asset Type" },
        { key: "totalCost", header: "Total Cost" },
        { key: "keyAttribute", header: "Key Attribute" },
    ];

    return (
        <Page active="/assets">
            <Header headerTitle="Assets" />
            <div style={{ padding: "1rem" }}>
                <p style={{ marginBottom: "1rem", color: "#666" }}>
                    Infrastructure-level cost breakdown
                </p>

                {error && (
                    <InlineNotification
                        kind="error"
                        title="Error"
                        subtitle={error}
                        hideCloseButton
                    />
                )}

                {loading ? (
                    <DataTableSkeleton rowCount={5} columnCount={3} />
                ) : data.length === 0 && !error ? (
                    <p>No asset data found for the selected period.</p>
                ) : (
                    <DataTable rows={data} headers={headers}>
                        {({
                            rows,
                            headers,
                            getTableProps,
                            getHeaderProps,
                            getRowProps,
                        }) => (
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
                                        <TableRow {...getRowProps({ row })}>
                                            {row.cells.map((cell) => (
                                                <TableCell key={cell.id}>{cell.value}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </DataTable>
                )}
            </div>
            <Footer />
        </Page>
    );
};

export default AssetsPage;
