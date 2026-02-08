import client from "./api_client";

// currently we can depend on the demo site backend for a richer mock data
// simply run the server with:
// BASE_URL=https://demo.infra.opencost.io/model npm run serve

class AssetsService {
  async fetchAssets(win) {
    const params = {
      window: win,
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
