import client from "./api_client";
import { getMockAssetsData, getMockAssetsTotals } from "./assets.mock";

// Flag to enable mock data - must be explicitly set via REACT_APP_USE_MOCK_DATA environment variable
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

class AssetsService {
    async fetchAssets(window, aggregate = "type", options = {}) {
        const params = {
            window: window,
            aggregate: aggregate,
        };

        if (options.filter) {
            params.filter = options.filter;
        }

        try {
            const result = await client.get("/assets", { params });
            return result.data;
        } catch (error) {
            // Only use mock data if explicitly enabled via REACT_APP_USE_MOCK_DATA=true
            if (
                USE_MOCK_DATA &&
                error.message &&
                (error.message.includes("Network Error") ||
                    error.message.includes("ECONNREFUSED"))
            ) {
                console.warn(
                    "Backend not available, using mock data (REACT_APP_USE_MOCK_DATA is enabled)"
                );
                return {
                    code: 200,
                    data: [getMockAssetsData(aggregate)],
                    message: "Mock data",
                };
            }
            throw error;
        }
    }

    async fetchAssetsTotals(window) {
        try {
            const result = await client.get("/assets", {
                params: { window, aggregate: "type" },
            });
            // Calculate totals from the response
            const assets = result.data?.data?.[0] || [];
            return {
                totalCost: assets.reduce((sum, a) => sum + (a.totalCost || 0), 0),
                cpuCost: assets.reduce((sum, a) => sum + (a.cpuCost || 0), 0),
                ramCost: assets.reduce((sum, a) => sum + (a.ramCost || 0), 0),
                gpuCost: assets.reduce((sum, a) => sum + (a.gpuCost || 0), 0),
                assetCount: assets.length,
            };
        } catch (error) {
            if (USE_MOCK_DATA) {
                return getMockAssetsTotals();
            }
            throw error;
        }
    }
}

export default new AssetsService();
