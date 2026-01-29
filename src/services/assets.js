import client from "./api_client";
import { getMockAssets } from "./assets.mock";

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

class AssetsService {
    async fetchAssets(options = {}) {
        const { type } = options;
        const params = {};
        if (type) {
            params.type = type;
        }

        try {
            // Assuming a standard endpoint structure or as defined in the request
            // The issue description mentioned "assets API", usually exposed at /model/assets
            const result = await client.get("/model/assets", { params });
            return result.data;
        } catch (error) {
            console.warn("AssetsService Error:", error.message);
            // Fallback to mock data aggressively for development if backend fails
            if (USE_MOCK_DATA || process.env.NODE_ENV === "development" || error) {
                console.warn("Falling back to mock data.");
                return getMockAssets(type);
            }
            throw error;
        }
    }
}

export default new AssetsService();
