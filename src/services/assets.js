import client from "./api_client";

class AssetsService {
  async fetchAssets(window) {
    const params = {
      window: window,
    };

    try {
      const result = await client.get("/assets", {
        params,
      });
      return result.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AssetsService();
