import client from "./api_client";

class AssetsCostsService {
    async fetchAssetsGraphCosts( ) {
        const params = {
            window: "7d",
            filters:""//empty for now
        };
        //    console.log("FETCH ASSETS FUNCTION CALLED");
        const result = await client.get(`/assets`, {
            params,
        });
        // console.log(result)
        // console.log("result.data" + result.data)
        // console.log("result.data.data" + result.data.data)
        // let temp = Object.values(result.data)
        // const returnData = Object.values(result.data.data)
        // console.log("return data" + returnData)
        
        return result.data;
    }
}
export default new AssetsCostsService();