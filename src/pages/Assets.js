import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";

import Page from "../components/Page";
import ThemeToggle from "../components/ThemeToggle";
import AssetsTable from "../components/assets/AssetsTable";
import AssetsChart from "../components/assets/AssetsChart";
import AssetsSummary from "../components/assets/AssetsSummary";
import AssetsService from "../services/assets";
import { currencyCodes } from "../constants/currencyCodes";
import { useTheme } from "../context/ThemeContext";

const windowOptions = [
    { id: "today", text: "Today" },
    { id: "yesterday", text: "Yesterday" },
    { id: "7d", text: "Last 7 days" },
    { id: "14d", text: "Last 14 days" },
    { id: "30d", text: "Last 30 days" },
];

const aggregationOptions = [
    { id: "type", text: "Asset Type" },
    { id: "name", text: "Asset Name" },
    { id: "cluster", text: "Cluster" },
];

const AssetsPage = () => {
    const { colors, isDark } = useTheme();
    const [assetsData, setAssetsData] = useState([]);
    const [totals, setTotals] = useState({});
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const routerLocation = useLocation();
    const searchParams = new URLSearchParams(routerLocation.search);
    const navigate = useNavigate();

    const win = searchParams.get("window") || "7d";
    const aggregateBy = searchParams.get("agg") || "type";
    const currency = searchParams.get("currency") || "USD";

    const selectStyle = {
        backgroundColor: colors.backgroundSecondary,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: "8px",
        padding: "0.6rem 2.5rem 0.6rem 1rem",
        fontSize: "0.875rem",
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(colors.textSecondary)}' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        transition: "border-color 0.15s, box-shadow 0.15s",
        outline: "none",
    };

    const labelStyle = {
        fontSize: "0.7rem",
        color: colors.textSecondary,
        marginBottom: "0.35rem",
        display: "block",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontWeight: "500",
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchData();
    }, [win, aggregateBy]);

    async function fetchData() {
        setLoading(true);
        setErrors([]);

        try {
            const resp = await AssetsService.fetchAssets(win, aggregateBy);
            if (resp.data && resp.data.length > 0) {
                const assets = resp.data[0] || [];
                setAssetsData(assets);

                const calculatedTotals = {
                    totalCost: assets.reduce((sum, a) => sum + (a.totalCost || 0), 0),
                    cpuCost: assets.reduce((sum, a) => sum + (a.cpuCost || 0), 0),
                    ramCost: assets.reduce((sum, a) => sum + (a.ramCost || 0), 0),
                    gpuCost: assets.reduce((sum, a) => sum + (a.gpuCost || 0), 0),
                    assetCount: assets.length,
                };
                setTotals(calculatedTotals);
            } else {
                setAssetsData([]);
                setTotals({});
            }
        } catch (err) {
            let secondary = "Please check your connection.";
            if (err.message && err.message.length > 0) {
                secondary = err.message;
            }
            setErrors([{ primary: "Failed to load assets data", secondary }]);
            setAssetsData([]);
        }

        setLoading(false);
    }

    const formatDateTime = (date) => {
        return (
            date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }) +
            " at " +
            date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZoneName: "short",
            })
        );
    };

    return (
        <Page active="/assets">
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: colors.background,
                    padding: "0",
                    marginTop: "-2.5rem",
                    marginLeft: "-2rem",
                    marginRight: "-1rem",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1.5rem 2rem",
                        background: isDark
                            ? "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)"
                            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                        borderBottom: `1px solid ${colors.border}`,
                    }}
                >
                    <h1
                        style={{
                            color: colors.text,
                            fontSize: "2.25rem",
                            fontWeight: "300",
                            margin: 0,
                            fontFamily: "'Inter', 'Roboto', sans-serif",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Assets
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ color: colors.textMuted, fontSize: "0.8rem" }}>
                            {formatDateTime(currentTime)}
                        </span>
                        <ThemeToggle />
                        <IconButton
                            onClick={() => fetchData()}
                            style={{
                                color: colors.textSecondary,
                                backgroundColor: colors.backgroundSecondary,
                                borderRadius: "8px",
                                padding: "8px",
                            }}
                            title="Refresh data"
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: "1.5rem 2rem" }}>
                    {/* Controls */}
                    <div
                        style={{
                            display: "flex",
                            gap: "1.5rem",
                            marginBottom: "2rem",
                            flexWrap: "wrap",
                            alignItems: "flex-end",
                        }}
                    >
                        <div>
                            <label style={labelStyle}>Time Window</label>
                            <select
                                style={selectStyle}
                                value={win}
                                onChange={(e) => {
                                    searchParams.set("window", e.target.value);
                                    navigate({ search: `?${searchParams.toString()}` });
                                }}
                            >
                                {windowOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Aggregate By</label>
                            <select
                                style={selectStyle}
                                value={aggregateBy}
                                onChange={(e) => {
                                    searchParams.set("agg", e.target.value);
                                    navigate({ search: `?${searchParams.toString()}` });
                                }}
                            >
                                {aggregationOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Currency</label>
                            <select
                                style={selectStyle}
                                value={currency}
                                onChange={(e) => {
                                    searchParams.set("currency", e.target.value);
                                    navigate({ search: `?${searchParams.toString()}` });
                                }}
                            >
                                {currencyCodes.map((code) => (
                                    <option key={code} value={code}>
                                        {code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Errors */}
                    {!loading && errors.length > 0 && (
                        <div
                            style={{
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid #ef4444",
                                borderRadius: "8px",
                                padding: "1rem",
                                marginBottom: "1.5rem",
                                color: "#fca5a5",
                            }}
                        >
                            {errors.map((err, i) => (
                                <div key={i}>
                                    <strong>{err.primary}</strong>
                                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", opacity: 0.8 }}>
                                        {err.secondary}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "4rem",
                                color: colors.textSecondary,
                            }}
                        >
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    border: `3px solid ${colors.border}`,
                                    borderTop: `3px solid ${colors.accent}`,
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                }}
                            />
                            <style>
                                {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                            </style>
                            <p style={{ marginTop: "1rem" }}>Loading assets...</p>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && assetsData.length > 0 && (
                        <>
                            {/* Summary Cards */}
                            <AssetsSummary totals={totals} currency={currency} />

                            {/* Chart and Table */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1.8fr",
                                    gap: "1.5rem",
                                    alignItems: "start",
                                }}
                            >
                                <AssetsChart assets={assetsData} currency={currency} />
                                <AssetsTable assets={assetsData} currency={currency} />
                            </div>
                        </>
                    )}

                    {/* No Data */}
                    {!loading && assetsData.length === 0 && errors.length === 0 && (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "4rem",
                                color: colors.textMuted,
                                backgroundColor: colors.backgroundSecondary,
                                borderRadius: "12px",
                                border: `1px solid ${colors.border}`,
                            }}
                        >
                            <p style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>📊</p>
                            <p>No assets data available</p>
                        </div>
                    )}
                </div>
            </div>
        </Page>
    );
};

export default AssetsPage;
