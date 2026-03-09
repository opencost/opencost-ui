import { formatSampleItemsForGraph, parseFilters } from "~/lib/legacy-util";
import client from "./api-client";

class CloudCostService {
  async fetchCloudCostData(
    window: string,
    aggregate: string,
    costMetric: string,
    filters: { property: string; value: string }[],
  ) {
    const params: Record<string, any> = {
      window,
      aggregate,
      costMetric,
      filter: parseFilters(filters ?? []),
      limit: 1000,
    };

    if (aggregate.includes("item")) {
      const resp = await client.get(
        `/cloudCost?window=${window}&costMetric=${costMetric}&filter=${parseFilters(filters)}`,
      );
      return formatSampleItemsForGraph({ data: resp.data, costMetric });
    }

    const [tableView, totalsView, graphView, status] = await Promise.all([
      client.get("/cloudCost/view/table", { params }),
      client.get("/cloudCost/view/totals", { params }),
      client.get("/cloudCost/view/graph", { params }),
      client.get("/cloudCost/status"),
    ]);

    return {
      tableRows: tableView.data.data,
      graphData: graphView.data.data,
      tableTotal: totalsView.data.data.combined,
      cloudCostStatus: status.data.data,
    };
  }
}

export default new CloudCostService();
