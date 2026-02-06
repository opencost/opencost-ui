import client from "./api_client"

class AssetsService {
    async fetchAssets (window, aggregate, options = {}){
        const  { accumulate = true } = options;  // if options.accumulate is undefined, default to true
        const params = {
            window,
            aggregate,
            accumulate,
        };

        try {
            const result = await client.get("/assets", {params})
            return result.data;
        }catch (error){
            // For development, return mock data
            console.warn("Using mock assets data");
            return this.getMockData()
        }
    }

    getMockData() {
        // mock data for testing purposes...
        return {
            data: [{
                "aws-node-1": {
                    type: "Node",
                    properties: { provider: "AWS", cluster: "production", node: "aws-node-1" },
                    totalCost: 125.50,
                    cpuCost: 75.30,
                    ramCost: 40.20,
                    gpuCost: 10.00
                },
                "gcp-node-1": {
                    type: "Node",
                    properties: { provider: "GCP", cluster: "staging", node: "gcp-node-1" },
                    totalCost: 89.25,
                    cpuCost: 50.00,
                    ramCost: 39.25,
                    gpuCost: 0
                },
                "pv-disk-1": {
                    type: "Disk",
                    properties: { provider: "AWS", cluster: "production", name: "pv-disk-1" },
                    totalCost: 25.00
                },
                "load-balancer-1": {
                    type: "LoadBalancer",
                    properties: { provider: "AWS", cluster: "production", name: "api-lb" },
                    totalCost: 35.75
                }
            }]
        };
    }
}

export default new AssetsService();

