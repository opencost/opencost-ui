import { parseFilters } from "../util";
import { costMetricToPropName } from "../components/cloudCost/tokens";
import client from "./api_client";

function formatItemsForCost({ data, costType }) {
  return data.sets.map(({ cloudCosts, window }) => {
    return {
      date: window.start,
      cost: Object.values(cloudCosts).reduce(
        (acc, costs) => acc + costs[costType || "amortizedNetCost"].cost,
        0,
      ),
    };
  });
}

class CloudCostDayTotalsService {
  async fetchCloudCostData(window, aggregate, costMetric, filters, currency) {
    if (aggregate.includes("item")) {
      const itemParams = {
        window,
        costMetric,
        filter: parseFilters(filters),
      };
      if (currency) {
        itemParams.currency = currency;
      }
      const resp = await client.get(`/cloudCost`, {
        params: itemParams,
      });
      const costMetricProp = costMetricToPropName[costMetric];

      const result_2 = await resp.data;
      return { data: formatItemsForCost(result_2, costMetricProp) };
    }

    return [];
  }
}

export default new CloudCostDayTotalsService();
