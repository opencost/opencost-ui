import React, { useState, useEffect } from "react";
import { Grid, Column } from "@carbon/react";
import WastePercentageGauge from "./WastePercentageGauge";
import ResourceUtilizationCard from "./ResourceUtilizationCard";
import assetsService from "../../services/assets";

const EfficiencyOverview = ({ window = "7d" }) => {
    const [efficiencyData, setEfficiencyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await assetsService.fetchEfficiencyMetrics({ window });
                console.log("[EfficiencyOverview] Received data:", data);
                setEfficiencyData(data);
            } catch (err) {
                console.error("Error fetching efficiency metrics:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [window]);

    if (error && !efficiencyData) {
        return null; // Silently fail if there's an error and no data
    }

    return (
        <Grid narrow>
            <Column lg={8} md={8} sm={4} style={{ marginBottom: "1rem" }}>
                <WastePercentageGauge
                    wastePercentage={efficiencyData?.wastePercentage || 0}
                    idleCost={efficiencyData?.idleCost}
                    isLoading={isLoading}
                />
            </Column>

            <Column lg={4} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                <ResourceUtilizationCard
                    resourceType="CPU"
                    efficiency={efficiencyData?.cpuEfficiency || 0}
                    isLoading={isLoading}
                />
            </Column>

            <Column lg={4} md={4} sm={4} style={{ marginBottom: "1rem" }}>
                <ResourceUtilizationCard
                    resourceType="RAM"
                    efficiency={efficiencyData?.ramEfficiency || 0}
                    isLoading={isLoading}
                />
            </Column>

        </Grid>
    );
};

export default EfficiencyOverview;
