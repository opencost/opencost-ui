import client from "./api_client";

class AssetsService {
  async fetchAssets(window, options = {}) {
    const params = { window, ...options };
    const result = await client.get("/assets", { params });
    return result.data;
  }
}

export default new AssetsService();
