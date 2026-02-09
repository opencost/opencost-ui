
import React, { useEffect, useState, useMemo } from 'react';
import { windowOptions, formatCurrency } from '../utils/assets';
import mockAssets from '../mocks/assets.json';
import { Sprout, WatsonHealthStatusResolved, WarningAltFilled } from "@carbon/icons-react";

// Sustainability ratings logic
const getEfficiencyRating = (cost) => {
    if (cost < 0.5) return { label: "A+", color: "green", icon: <WatsonHealthStatusResolved /> };
    if (cost < 2) return { label: "A", color: "teal", icon: <WatsonHealthStatusResolved /> };
    if (cost < 5) return { label: "B", color: "blue", icon: <Sprout /> };
    return { label: "C", color: "red", icon: <WarningAltFilled /> };
};

const CURRENCY_RATES = {
    "USD": 1,
    "EUR": 0.92,
    "GBP": 0.79
};

const useAssetData = (selectedWindow, searchTerm, currency = "USD") => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Data processing from mock
    const assetsList = useMemo(() => {
        const assetsMap = mockAssets.data || {};
        return Object.entries(assetsMap).map(([id, asset]) => ({
            id,
            ...asset,
            properties: asset.properties || {},
        }));
    }, []);

    useEffect(() => {
        setLoading(true);
        // Simulate API delay
        const timer = setTimeout(() => {
            const multiplier = selectedWindow.multiplier || 1;
            const rate = CURRENCY_RATES[currency] || 1;

            // Single pass transformation
            const formattedData = assetsList.map((item) => {
                // Base cost in USD * time window multiplier * currency rate
                // Add jitter only once per item instantiation (in a real app this would be more stable)
                const baseCostInWindow = item.totalCost * multiplier;
                const adjustedCost = baseCostInWindow * (0.9 + Math.random() * 0.2); // Jitter

                // Apply currency conversion
                const finalCost = adjustedCost * rate;

                const efficiency = getEfficiencyRating(adjustedCost); // Rating based on base USD usually, but cost relative is fine

                return {
                    id: item.id,
                    name: item.properties.name || item.id,
                    type: item.type,
                    category: item.properties.category,
                    provider: item.properties.provider,
                    service: item.properties.service,
                    // Store raw numbers for sorting/calculations
                    rawCost: finalCost,
                    // Pre-format for display if needed, but components can format too.
                    // Sticking to existing pattern of string in table
                    totalCost: formatCurrency(finalCost, currency),
                    actualCost: finalCost,
                    efficiency: efficiency,
                    // CO2 is independent of currency, usually based on usage. 
                    // Usage ~ cost/rate (back to USD base). 
                    // approx: (finalCost / rate) * 0.4
                    co2: ((finalCost / rate) * 0.4).toFixed(2),
                };
            });

            setData(formattedData);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedWindow, assetsList, currency]);

    // Metrics Calculation - Optimized to Single Pass
    const metrics = useMemo(() => {
        const initial = {
            totalCost: 0,
            nodeCost: 0,
            diskCost: 0,
            lbCost: 0,
            carbonFootprint: 0
        };

        return data.reduce((acc, item) => {
            acc.totalCost += item.actualCost;
            acc.carbonFootprint += parseFloat(item.co2 || 0);

            if (item.type === "Node") acc.nodeCost += item.actualCost;
            else if (item.type === "Disk") acc.diskCost += item.actualCost;
            else if (item.type === "LoadBalancer") acc.lbCost += item.actualCost;

            return acc;
        }, initial);
    }, [data]);

    // Filtered Data
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerSearch = searchTerm.toLowerCase();
        return data.filter(
            (item) =>
                item.name.toLowerCase().includes(lowerSearch) ||
                item.type.toLowerCase().includes(lowerSearch) ||
                item.provider.toLowerCase().includes(lowerSearch)
        );
    }, [data, searchTerm]);

    // Recommendations
    const recommendations = useMemo(() => {
        return data
            .filter(item => item.efficiency.label === 'B' || item.efficiency.label === 'C')
            .slice(0, 3) // Top 3
            .map(item => ({
                id: item.id,
                title: `Optimization Opportunity: ${item.name}`,
                subtitle: `Asset efficiency is rated ${item.efficiency.label}. Consider rightsizing to save ${formatCurrency(item.actualCost * 0.3, currency)}/mo.`,
                kind: item.efficiency.label === 'C' ? 'error' : 'warning',
            }));
    }, [data, currency]);

    return {
        data,
        loading,
        metrics,
        filteredData,
        recommendations
    };
};

export default useAssetData;
