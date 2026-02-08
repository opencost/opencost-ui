import { parseFilters } from "../util";
import client from "./api_client";
import { getMockAssetsData } from "./assets.mock";

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true" || true; // Default to true for development

class AssetsService {
    async fetchAssets(win, aggregate, options) {
        const { accumulate = true, filters } = options;
        const params = {
            window: win,
            aggregate: aggregate,
            accumulate: accumulate,
        };

        if (filters && filters.length > 0) {
            params.filter = parseFilters(filters);
        }

        try {
            const result = await client.get("/assets", {
                params,
            });
            return result.data;
        } catch (error) {
            if (USE_MOCK_DATA) {
                console.warn("Backend not available, using mock assets data");
                return getMockAssetsData();
            }
            throw error;
        }
    }
}

export default new AssetsService();
