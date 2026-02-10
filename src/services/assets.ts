import client from "./api_client";
import { getMockAssetData, getMockAssetCarbonData, getMockCostOverTimeData, getMockCostByServiceData } from "./assets.mock";

// Flag to enable mock data - forcing true for UI development/testing
const USE_MOCK_DATA = true;

interface FetchOptions {
    filter?: string;
}

interface AssetResponse {
    [key: string]: unknown;
}

/**
 * Assets Service
 * Provides methods to fetch asset cost data from the OpenCost backend
 */
class AssetsService {
    /**
     * Fetch asset cost data for a given time window
     * @param {string} window - Time window (e.g., "7d", "24h", "today", "2024-01-01,2024-01-07")
     * @param {Object} options - Additional options
     * @param {string} options.filter - Optional filter expression (e.g., "type:node", "cluster:prod")
     * @returns {Promise<Object>} - Asset data response
     */
    async fetchAssets(window: string, options: FetchOptions = {}): Promise<AssetResponse> {
        const { filter } = options;

        const params: { window: string; filter?: string } = { window };

        if (filter && filter.trim() !== "") {
            params.filter = filter;
        }

        try {
            const response = await client.get("/assets", { params });
            return response.data;
        } catch (error) {
            // Always use mock data when backend fails if USE_MOCK_DATA is true
            if (USE_MOCK_DATA) {
                console.warn("Backend not available or failed, using mock asset data");
                return getMockAssetData(window, options);
            }
            throw error;
        }
    }

    /**
     * Fetch asset carbon emission estimates
     * @param {string} window - Time window
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Carbon estimates response
     */
    async fetchAssetCarbon(window: string, options: FetchOptions = {}): Promise<AssetResponse> {
        const { filter } = options;

        const params: { window: string; filter?: string } = { window };

        if (filter && filter.trim() !== "") {
            params.filter = filter;
        }

        try {
            const response = await client.get("/assets/carbon", { params });
            return response.data;
        } catch (error) {
            // Always use mock data when backend fails if USE_MOCK_DATA is true
            if (USE_MOCK_DATA) {
                console.warn("Backend not available or failed, using mock carbon data");
                return getMockAssetCarbonData(window, options);
            }
            throw error;
        }
    }

    /**
     * Fetch cost over time data
     * @param {string} window - Time window
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Cost over time response
     */
    async fetchCostOverTime(window: string, options: FetchOptions = {}): Promise<AssetResponse> {
        try {
            const response = await client.get("/assets/costOverTime", { params: { window } });
            return response.data;
        } catch (error) {
            if (USE_MOCK_DATA) {
                console.warn("Backend not available or failed, using mock cost over time data");
                return getMockCostOverTimeData(window);
            }
            throw error;
        }
    }

    /**
     * Fetch cost by service or cluster
     * @param {string} window - Time window
     * @param {string} breakdown - 'service' or 'cluster'
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Cost by service response
     */
    async fetchCostByService(window: string, breakdown: string = 'service', options: FetchOptions = {}): Promise<AssetResponse> {
        try {
            const response = await client.get("/assets/costByService", { 
                params: { window, breakdown } 
            });
            return response.data;
        } catch (error) {
            if (USE_MOCK_DATA) {
                console.warn("Backend not available or failed, using mock cost by service data");
                return getMockCostByServiceData(window, breakdown);
            }
            throw error;
        }
    }
}

export default new AssetsService();
