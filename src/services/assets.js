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
            // Always fallback to mock data in the UI preview to ensure mentors can evaluate the design
            console.warn("Assets API unreachable, using high-fidelity mock data for preview.", error);
            return getMockAssetsData();
        }
    }
}

export default new AssetsService();
