import React, { useMemo } from 'react';
import { Tile, DataTable, Tag } from '@carbon/react';
import { typeColors } from '../../utils/assets';
import { ServerDns, Cube, CloudApp, VirtualMachine } from '@carbon/icons-react';

const getTypeIcon = (type) => {
    switch (type) {
        case "Node": return <ServerDns size={20} />;
        case "Disk": return <Cube size={20} />;
        case "LoadBalancer": return <CloudApp size={20} />;
        default: return <VirtualMachine size={20} />;
    }
};

const headers = [
    { key: "name", header: "Name" },
    { key: "type", header: "Type" },
    { key: "category", header: "Category" },
    { key: "provider", header: "Provider" },
    { key: "service", header: "Service" },
    { key: "efficiency", header: "Efficiency" },
    { key: "co2", header: "Est. CO2e (kg)" },
    { key: "totalCost", header: "Total Cost" },
];

const AssetTable = ({ filteredData, totalCount, onSearch }) => {
    return (
        <Tile
            className="asset-table-tile"
            style={{
                borderRadius: "24px",
                padding: "0",
                background: "rgba(255, 255, 255, 0.8)", // Match CostCharts
                border: "1px solid rgba(255,255,255,1)", // Match CostCharts
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                overflow: "hidden",
            }}
        >
            <DataTable rows={filteredData} headers={headers} isSortable>
                {({ rows, headers, getHeaderProps, getRowProps, getTableProps, onInputChange }) => (
                    <div style={{ padding: "24px" }}>
                        {/* Header & Search */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div>
                                <h4 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#1f2937" }}>Asset Inventory</h4>
                                <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Showing {filteredData.length} of {totalCount} assets</p>
                            </div>
                            <div style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    onChange={(e) => {
                                        onInputChange(e);
                                        onSearch(e.target.value);
                                    }}
                                    style={{
                                        background: "#f3f4f6",
                                        border: "none",
                                        borderRadius: "12px",
                                        padding: "10px 16px 10px 40px",
                                        fontSize: "14px",
                                        width: "240px",
                                        outline: "none",
                                        color: "#374151",
                                        fontWeight: 500
                                    }}
                                />
                                <svg
                                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                                >
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                        </div>

                        {/* Custom Clean Table */}
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }} {...getTableProps()}>
                            <thead>
                                <tr>
                                    {headers.map((header) => (
                                        <th key={header.key} {...getHeaderProps({ header })} style={{
                                            textAlign: "left",
                                            padding: "0 0 16px 0",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            color: "#9ca3af",
                                            letterSpacing: "0.05em",
                                            borderBottom: "1px solid #e5e5e5",
                                            cursor: "pointer"
                                        }}>
                                            {header.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id} style={{ transition: "background 0.2s" }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.5)"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                        {row.cells.map((cell) => (
                                            <td key={cell.id} style={{ padding: "16px 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px", color: "#374151" }}>
                                                {cell.info.header === "type" ? (
                                                    <span style={{
                                                        backgroundColor: typeColors[cell.value]?.bg || "#e5e7eb",
                                                        color: typeColors[cell.value]?.text || "#374151",
                                                        border: `1px solid ${typeColors[cell.value]?.border || "#d1d5db"}`,
                                                        padding: "4px 12px",
                                                        borderRadius: "9999px",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        lineHeight: 1
                                                    }}>
                                                        {getTypeIcon(cell.value)}
                                                        {cell.value}
                                                    </span>
                                                ) : cell.info.header === "efficiency" ? (
                                                    <Tag type={cell.value.color} size="sm">
                                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                            {cell.value.icon}
                                                            {cell.value.label}
                                                        </span>
                                                    </Tag>
                                                ) : cell.info.header === "totalCost" ? (
                                                    <span style={{ fontWeight: 600, color: "#0f766e" }}>{cell.value}</span>
                                                ) : cell.info.header === "name" ? (
                                                    <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 500 }}>{cell.value}</span>
                                                ) : (
                                                    cell.value
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DataTable>
        </Tile>
    );
};

export default AssetTable;
