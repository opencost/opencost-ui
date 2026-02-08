import client from "./api_client";

class AssetsService {
  async fetchAssets(win, aggregate, accumulate = false, filters = []) {
    const params = {
      window: win,
    };
    
    if (aggregate) {
      params.aggregate = aggregate;
    }
    
    if (accumulate) {
      params.accumulate = accumulate;
    }
    
    if (filters && filters.length > 0) {
      params.filter = filters.map(f => `${f.property}:"${f.value}"`).join("+");
    }

    const result = await client.get("/assets", {
      params,
    });
    
    return result.data;
  }
}

export default new AssetsService();
