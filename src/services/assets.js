import client from "./api_client";
import { getAssetsMockData } from "./assets.mock";

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

class AssetsService {
  async fetchAssets(windowStr, aggregate, accumulate, options = {}) {
    const params = {
      window: windowStr || "7d",
      accumulate: accumulate !== undefined ? accumulate : true,
    };

    if (aggregate) {
      params.aggregate = aggregate;
    }

    if (options.filter) {
      params.filter = options.filter;
    }

    if (options.disableAdjustments) {
      params.disableAdjustments = true;
    }

    try {
      const result = await client.get("/assets", { params });
      return result.data;
    } catch (error) {
      if (
        USE_MOCK_DATA ||
        (error.message &&
          (error.message.includes("Network Error") ||
            error.message.includes("ECONNREFUSED"))) ||
        error.response?.status === 404
      ) {
        console.warn(
          "Assets API not available, falling back to mock data. " +
            "Set REACT_APP_USE_MOCK_DATA=true to silence this warning."
        );
        return getAssetsMockData(aggregate, accumulate);
      }
      throw error;
    }
  }
}

export default new AssetsService();
