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
  async fetchCloudCostData(window, aggregate, costMetric, filters) {
    if (aggregate.includes("item")) {
      const resp = await client.get(
        `/cloudCost?window=${window}&costMetric=${costMetric}&filter=${parseFilters(
          filters,
        )}`,
      );
      const costMetricProp = costMetricToPropName[costMetric];

      const result_2 = await resp.data;
      return { data: formatItemsForCost({ data: result_2, costType: costMetricProp }) };
    }

    return [];
  }
}

export default new CloudCostDayTotalsService();
