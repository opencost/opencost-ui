import React, { useEffect, useState } from "react";
import {
    Loading,
    DataTable,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Accordion,
    AccordionItem,
    ClickableTile,
    Column,
    Grid,
    Stack,
    Theme,
    Layer,
    Heading,
    Tag,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch
} from "@carbon/react";
import { Information, Cube, Cloud, Network_4 } from "@carbon/icons-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Page from "../components/Page";
import Header from "../components/Header";
import AssetsService from "../services/assets";
import { toCurrency } from "../util";

interface Asset {
    id: string;
    type: string;
    totalCost: number;
    name: string;
    providerID: string;
    [key: string]: any;
}

const COLORS = ['#0062ff', '#24a148', '#a2191f', '#6929c4', '#1192e8', '#b28600'];

const Assets: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [summary, setSummary] = useState({ total: 0, count: 0, topType: "" });
    const [chartData, setChartData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            try {
                const response = await AssetsService.fetchAssets("7d", "type", { accumulate: true });
                // Normalize data: sometimes it's wrapped in { data: [...] }, sometimes it's just [...]
                const rawData = response?.data || (Array.isArray(response) ? response : null);

                if (rawData && Array.isArray(rawData)) {
                    const flattened: Asset[] = rawData.flatMap((set: any) => {
                        if (!set || typeof set !== 'object') return [];
                        return Object.entries(set).map(([id, val]: [string, any]) => ({
                            id,
                            ...(val && typeof val === 'object' ? val : {})
                        }));
                    });

                    // Defensive data processing
                    const validAssets = flattened.filter(a => a && a.type && a.id);
                    setAssets(validAssets);

                    const totalCostValue = validAssets.reduce((acc, curr) => acc + (Number(curr.totalCost) || 0), 0);
                    const types = validAssets.reduce((acc: Record<string, number>, curr) => {
                        const t = curr.type || "Other";
                        acc[t] = (acc[t] || 0) + (Number(curr.totalCost) || 0);
                        return acc;
                    }, {});

                    const chartRaw = Object.entries(types).map(([name, value]) => ({ name, value }));
                    setChartData(chartRaw);

                    const sortedTypes = Object.entries(types).sort((a, b) => b[1] - a[1]);
                    const topTypeValue = sortedTypes[0]?.[0] || "None";
                    setSummary({ total: totalCostValue, count: validAssets.length, topType: topTypeValue });
                    setError(null); // Clear any previous error
                } else {
                    throw new Error("Invalid data structure received from Assets API");
                }
            } catch (err) {
                setError("Failed to fetch assets data. Please ensure the backend is reachable.");
                console.error("Assets Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    const headers = [
        { key: "name", header: "Name" },
        { key: "providerID", header: "Provider ID" },
        { key: "totalCost", header: "7d Cost" },
    ];

    const getTypeIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t === 'node') return <Cube size={20} />;
        if (t === 'disk') return <Cloud size={20} />;
        if (t === 'network') return <Network_4 size={20} />;
        return <Information size={20} />;
    };

    const groupedAssets = assets.reduce((acc: Record<string, Asset[]>, curr) => {
        acc[curr.type] = acc[curr.type] || [];
        acc[curr.type].push(curr);
        return acc;
    }, {});

    return (
        <Page active="/assets">
            <Theme theme="g10">
                <div className="assets-container">
                    <Header headerTitle="Assets Ecosystem" />

                    <div style={{ marginTop: '2rem' }}>
                        {loading ? (
                            <Loading withOverlay={false} />
                        ) : error ? (
                            <div className="assets-error-wrapper">{error}</div>
                        ) : (
                            <Stack gap={8}>
                                <Grid className="assets-summary-grid">
                                    <Column lg={8} md={8} sm={4}>
                                        <div className="assets-viz-card">
                                            <Heading className="viz-heading">Cost Distribution by Asset Type</Heading>
                                            <div style={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer>
                                                    <PieChart>
                                                        <Pie
                                                            data={chartData}
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            nameKey="name"
                                                        >
                                                            {chartData.map((_entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value: number) => toCurrency(value, "USD")} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </Column>
                                    <Column lg={4} md={4} sm={4}>
                                        <Stack gap={4}>
                                            <ClickableTile className="summary-tile-mini">
                                                <Stack gap={1}>
                                                    <p className="summary-label">Total Ecosystem Cost</p>
                                                    <Heading className="summary-value">{toCurrency(summary.total, "USD")}</Heading>
                                                    <Tag type="blue" size="sm">7D Accumulate</Tag>
                                                </Stack>
                                            </ClickableTile>
                                            <ClickableTile className="summary-tile-mini">
                                                <Stack gap={1}>
                                                    <p className="summary-label">Primary Driver</p>
                                                    <Heading className="summary-value">{summary.topType}</Heading>
                                                    <Tag type="magenta" size="sm">Action Recommended</Tag>
                                                </Stack>
                                            </ClickableTile>
                                        </Stack>
                                    </Column>
                                </Grid>

                                <Layer>
                                    <Accordion align="start" className="assets-accordion">
                                        {Object.entries(groupedAssets).map(([type, list]) => (
                                            <AccordionItem
                                                title={
                                                    <div className="accordion-title-wrapper">
                                                        {getTypeIcon(type)}
                                                        <span className="type-title">{type} Assets</span>
                                                        <Tag type="gray" size="sm" className="count-tag">{list.length} Items</Tag>
                                                    </div>
                                                }
                                                key={type}
                                            >
                                                <DataTable rows={list} headers={headers}>
                                                    {({
                                                        rows,
                                                        headers,
                                                        getTableProps,
                                                        getHeaderProps,
                                                        getRowProps,
                                                        getTableContainerProps,
                                                        onInputChange,
                                                    }) => (
                                                        <TableContainer {...getTableContainerProps()}>
                                                            <TableToolbar>
                                                                <TableToolbarContent>
                                                                    <TableToolbarSearch
                                                                        persistent
                                                                        onChange={onInputChange}
                                                                        placeholder={`Search ${type} assets...`}
                                                                    />
                                                                </TableToolbarContent>
                                                            </TableToolbar>
                                                            <Table {...getTableProps()} size="lg" useZebraStyles>
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
                                                                                <TableCell key={cell.id}>
                                                                                    {cell.info.header === "totalCost"
                                                                                        ? <span className="cost-cell">{toCurrency(cell.value as number, "USD")}</span>
                                                                                        : (cell.value || "N/A")}
                                                                                </TableCell>
                                                                            ))}
                                                                        </TableRow>
                                                                    ))}
                                                                    {rows.length === 0 && (
                                                                        <TableRow>
                                                                            <TableCell colSpan={headers.length}>No matching assets found.</TableCell>
                                                                        </TableRow>
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    )}
                                                </DataTable>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </Layer>
                            </Stack>
                        )}
                    </div>
                </div>
            </Theme>
        </Page>
    );
};

export default Assets;
