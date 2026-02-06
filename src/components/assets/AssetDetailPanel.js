import React from "react";
import PropTypes from "prop-types";
import { Tag } from "@carbon/react";
import { Close } from "@carbon/icons-react";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * AssetDetailPanel - Side panel showing detailed asset information
 * Opens when a table row is clicked, displays all labels and metadata
 */
const AssetDetailPanel = ({ asset, isOpen, onClose, currency = "USD" }) => {
    const { isDarkMode } = useTheme();
    
    if (!isOpen || !asset) return null;

    const rawAsset = asset._rawAsset || {};

    // Format currency values
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value || 0);
    };

    // Format bytes to human readable
    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return "-";
        const gb = bytes / (1024 * 1024 * 1024);
        if (gb >= 1) return `${gb.toFixed(1)} GB`;
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    // Panel styles - lighter overlay in dark mode so content is still visible
    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.5)",
        zIndex: 1300,
        transition: "opacity 0.2s ease",
        backdropFilter: isDarkMode ? "blur(2px)" : "none",
    };

    const panelStyle = {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "400px",
        maxWidth: "90vw",
        backgroundColor: isDarkMode ? "#262626" : "#ffffff",
        boxShadow: "-4px 0 16px rgba(0, 0, 0, 0.2)",
        zIndex: 1400,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "transform 0.2s ease",
        color: isDarkMode ? "#f4f4f4" : "#161616",
    };

    const headerStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
        borderBottom: isDarkMode ? "1px solid #525252" : "1px solid #e0e0e0",
        backgroundColor: isDarkMode ? "#393939" : "#f4f4f4",
    };

    const closeButtonStyle = {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: isDarkMode ? "#f4f4f4" : "#161616",
        borderRadius: "4px",
        transition: "background-color 0.15s ease",
    };

    const contentStyle = {
        padding: "1rem",
        overflowY: "auto",
        flex: 1,
    };

    const sectionStyle = {
        marginBottom: "1.5rem",
    };

    const sectionTitleStyle = {
        fontSize: "0.875rem",
        fontWeight: 600,
        color: isDarkMode ? "#c6c6c6" : "#525252",
        marginBottom: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    };

    const detailRowStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "0.5rem 0",
        borderBottom: isDarkMode ? "1px solid #525252" : "1px solid #e0e0e0",
    };

    const labelStyle = {
        fontSize: "0.875rem",
        color: isDarkMode ? "#c6c6c6" : "#525252",
        flex: "0 0 40%",
    };

    const valueStyle = {
        fontSize: "0.875rem",
        color: isDarkMode ? "#f4f4f4" : "#161616",
        textAlign: "right",
        wordBreak: "break-word",
        flex: "1",
    };

    const labelsGridStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
    };

    // Get labels from raw asset
    const labels = rawAsset.labels || {};
    const properties = rawAsset.properties || {};

    return (
        <>
            {/* Overlay - only in light mode */}
            {!isDarkMode && <div style={overlayStyle} onClick={onClose} />}

            {/* Side Panel */}
            <div style={panelStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                            {asset.name}
                        </h2>
                        <Tag type={asset.type === "Node" ? "blue" : "purple"} size="sm">
                            {asset.type}
                        </Tag>
                    </div>
                    <button
                        style={closeButtonStyle}
                        onClick={onClose}
                        aria-label="Close panel"
                        onMouseOver={(e) => (e.target.style.backgroundColor = "var(--cds-layer-hover)")}
                        onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
                    >
                        <Close size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={contentStyle}>
                    {/* Cost Breakdown */}
                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}>Cost Breakdown</div>
                        <div style={detailRowStyle}>
                            <span style={labelStyle}>Total Cost</span>
                            <span style={{ ...valueStyle, fontWeight: 600, color: "var(--cds-support-error)" }}>
                                {formatCurrency(asset.totalCost)}
                            </span>
                        </div>
                        {asset.cpuCost > 0 && (
                            <div style={detailRowStyle}>
                                <span style={labelStyle}>CPU Cost</span>
                                <span style={valueStyle}>{formatCurrency(asset.cpuCost)}</span>
                            </div>
                        )}
                        {asset.ramCost > 0 && (
                            <div style={detailRowStyle}>
                                <span style={labelStyle}>RAM Cost</span>
                                <span style={valueStyle}>{formatCurrency(asset.ramCost)}</span>
                            </div>
                        )}
                        {rawAsset.gpuCost > 0 && (
                            <div style={detailRowStyle}>
                                <span style={labelStyle}>GPU Cost</span>
                                <span style={valueStyle}>{formatCurrency(rawAsset.gpuCost)}</span>
                            </div>
                        )}
                    </div>

                    {/* Resource Details */}
                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}>Resource Details</div>
                        {asset.cpuCores > 0 && (
                            <div style={detailRowStyle}>
                                <span style={labelStyle}>CPU Cores</span>
                                <span style={valueStyle}>{asset.cpuCores}</span>
                            </div>
                        )}
                        {asset.ramGB > 0 && (
                            <div style={detailRowStyle}>
                                <span style={labelStyle}>RAM</span>
                                <span style={valueStyle}>{asset.ramGB.toFixed(1)} GB</span>
                            </div>
                        )}
                        {rawAsset.bytes > 0 && (
                            <div style={detailRowStyle}>
                                <span style={labelStyle}>Storage</span>
                                <span style={valueStyle}>{formatBytes(rawAsset.bytes)}</span>
                            </div>
                        )}
                        {rawAsset.gpuCount > 0 && (
                            <div style={detailRowStyle}>
                                <span style={labelStyle}>GPU Count</span>
                                <span style={valueStyle}>{rawAsset.gpuCount}</span>
                            </div>
                        )}
                        <div style={detailRowStyle}>
                            <span style={labelStyle}>Pricing Type</span>
                            <span style={valueStyle}>
                                {asset.preemptible === true ? (
                                    <Tag type="cyan" size="sm">Spot</Tag>
                                ) : asset.preemptible === false ? (
                                    <Tag type="gray" size="sm">On-Demand</Tag>
                                ) : (
                                    "-"
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Properties */}
                    {Object.keys(properties).length > 0 && (
                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}>Properties</div>
                            {Object.entries(properties).map(([key, value]) => (
                                <div key={key} style={detailRowStyle}>
                                    <span style={labelStyle}>{key}</span>
                                    <span style={valueStyle}>{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Labels */}
                    {Object.keys(labels).length > 0 && (
                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}>Labels</div>
                            <div style={labelsGridStyle}>
                                {Object.entries(labels).map(([key, value]) => (
                                    <Tag key={key} type="outline" size="sm" title={`${key}: ${value}`}>
                                        {key}: {value}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Time Range */}
                    {(rawAsset.start || rawAsset.end) && (
                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}>Time Range</div>
                            {rawAsset.start && (
                                <div style={detailRowStyle}>
                                    <span style={labelStyle}>Start</span>
                                    <span style={valueStyle}>
                                        {new Date(rawAsset.start).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {rawAsset.end && (
                                <div style={detailRowStyle}>
                                    <span style={labelStyle}>End</span>
                                    <span style={valueStyle}>
                                        {new Date(rawAsset.end).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {rawAsset.minutes > 0 && (
                                <div style={detailRowStyle}>
                                    <span style={labelStyle}>Duration</span>
                                    <span style={valueStyle}>
                                        {(rawAsset.minutes / 60 / 24).toFixed(1)} days
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

AssetDetailPanel.propTypes = {
    /** Asset data to display */
    asset: PropTypes.object,
    /** Whether the panel is open */
    isOpen: PropTypes.bool.isRequired,
    /** Callback to close the panel */
    onClose: PropTypes.func.isRequired,
    /** Currency code for formatting */
    currency: PropTypes.string,
};

AssetDetailPanel.defaultProps = {
    asset: null,
    currency: "USD",
};

export default AssetDetailPanel;
