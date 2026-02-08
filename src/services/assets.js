import { parseFilters } from "../util";
import client from "./api_client";
import { getMockAssetsData } from "./assets.mock";

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true" || true; // Default to true for development

class AssetsService {
    async fetchAssets(win, aggregate, options) {
        // Defensive check for hostname to force mock on preview sites
        const isPreview = window.location.hostname.includes('netlify') || window.location.hostname.includes('github.io');

        if (isPreview) {
            console.log("Preview environment detected, using mock assets data.");
            return getMockAssetsData();
        }

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
            // Handle both { data: [...] } and just [...] response formats
            const responseData = result.data;
            if (responseData && (responseData.data || Array.isArray(responseData))) {
                return responseData;
            }
            throw new Error("Unexpected API response format");
        } catch (error) {
            console.warn("Assets API unreachable or invalid response, falling back to mock data.", error);
            return getMockAssetsData();
        }
    }
}

export default new AssetsService();
