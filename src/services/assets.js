import client from "./api_client";
import { getMockAssetData } from "./assets.mock";

class AssetsService {
  async fetchAssets(window) {
    try {
      const result = await client.get("/assets", {
        params: { window },
      });
      return result.data;
    } catch (error) {
      if (
        error.message &&
        (error.message.includes("Network Error") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("404"))
      ) {
        console.warn("Backend not available, using mock asset data");
        return getMockAssetData();
      }
      throw error;
    }
  }
}

export default new AssetsService();
