import axios from "axios";
import { getMockAssets } from "./asset.mock";
import client from "./api_client";

// Use environment variable to toggle mock data, defaults to true for development
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA !== 'false';

export default {
    async fetchAssets(window, aggregate, options = {}) {
        if (USE_MOCK_DATA) {
            console.log("Using Mock Asset Data");
            return getMockAssets(window, aggregate);
        }

        // Real API Implementation
        const params = {
            window,
            aggregate,
            accumulate: true,
            ...options,
        };

        try {
            const response = await client.get("/model/assets", { params });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch assets", error);
            throw error;
        }
    },
};
