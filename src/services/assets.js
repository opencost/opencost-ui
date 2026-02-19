import client from "./api_client";

const AssetsService = {
    fetchAssets: async (window = "7d", aggregate = "type", accumulate = true) => {
        const params = {
            window,
            aggregate,
            accumulate,
        };
        const response = await client.get("/model/assets", { params });
        return response.data;
    },
};

export default AssetsService;
