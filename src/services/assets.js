import { assign } from "lodash";
import client from "./api_client";

const AssetsService = {
    fetchAssets: async (window, aggregate, options = {}) => {
        let params = {
            window,
            aggregate,
            accumulate: options.accumulate ?? false,
            filter: options.filters,
            disableAdjustments: false,
            format: "json",
        };

        if (options.limit) {
            params.limit = options.limit;
        }

        if (options.offset) {
            params.offset = options.offset;
        }

        // Pass custom properties if needed
        if (options.params) {
            params = assign(params, options.params);
        }

        // api_client baseURL is already configured
        return client.get("/model/assets", { params }).then(response => response.data);
    }
};

export default AssetsService;
