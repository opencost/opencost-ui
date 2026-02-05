import { parseFilters } from "../util";
import client from "./api_client";
import { getMockAssets } from "./assets.mock";

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

class AssetsService {
    async fetchAssets(win, aggregate, options = {}) {
        const { accumulate, filters } = options;
        const params = {
            window: win,
            aggregate: aggregate,
        };
        if (typeof accumulate === "boolean") {
            params.accumulate = accumulate;
        }
        if (filters && filters.length > 0) {
            params.filter = parseFilters(filters);
        }

        try {
            const result = await client.get("/assets", {
                params,
            });
            return result.data;
        } catch (error) {
            if (USE_MOCK_DATA && error.message && (error.message.includes("Network Error") || error.message.includes("ECONNREFUSED"))) {
                console.warn("Backend not available, using mock data for assets");
                return getMockAssets(win);
            }
            console.error("Error fetching assets:", error);
            throw error;
        }
    }
}

export default new AssetsService();
