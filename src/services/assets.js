import client from "./api_client";
import { getMockData } from "./assets.mock";
import { parseFilters } from "../util";

const fetchAssets = async (window, accumulate, filters = []) => {
  const params = { window, accumulate };
  if (filters.length) params.filter = parseFilters(filters);

  try {
    const res = await client.get("/assets", { params });
    return res.data;
  } catch (err) {
    console.warn("Using mock asset data due to error:", err.message);
    return getMockData();
  }
};

export default { fetchAssets };
