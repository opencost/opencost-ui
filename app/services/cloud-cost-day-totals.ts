import { parseFilters } from "~/lib/legacy-util";
import client from "./api-client";

const costMetricToPropName: Record<string, string> = {
  AmortizedNetCost: "amortizedNetCost",
  NetCost: "netCost",
  ListCost: "listCost",
  InvoicedCost: "invoicedCost",
};

function formatItemsForCost({
  data,
  costType,
}: {
  data: any;
  costType?: string;
}) {
  return data.sets.map(({ cloudCosts, window }: any) => ({
    date: window.start,
    cost: Object.values(cloudCosts).reduce(
      (acc: number, costs: any) =>
        acc + costs[costType || "amortizedNetCost"].cost,
      0,
    ),
  }));
}

class CloudCostDayTotalsService {
  async fetchCloudCostData(
    window: string,
    aggregate: string,
    costMetric: string,
    filters: { property: string; value: string }[],
  ) {
    if (aggregate.includes("item")) {
      const resp = await client.get("/cloudCost", {
        params: { window, costMetric, filter: parseFilters(filters) },
      });
      const costMetricProp = costMetricToPropName[costMetric];
      return {
        data: formatItemsForCost({ data: resp.data.data, costType: costMetricProp }),
      };
    }
    return [];
  }
}

export default new CloudCostDayTotalsService();
