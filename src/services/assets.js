import client from "./api_client";
import { parseDays } from "../utils/assetCalculations";
import { getMockData } from "./assets.mock";

const AssetsService = {
  fetchAssets: async (timeWindow = "30d", options = {}) => {
    try {
      const { aggregate = "type", accumulate = true, ...rest } = options;
      const response = await client.get("/assets", {
        params: { window: timeWindow, aggregate, accumulate, ...rest },
      });

      const days = parseDays(timeWindow);

      return {
        data: response.data || {},
        window: {
          start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
          days,
        },
      };
    } catch (error) {
      throw new Error(`Could not connect to the OpenCost API: ${error.message}`);
    }
  },

  getMockData,
};

export default AssetsService;
