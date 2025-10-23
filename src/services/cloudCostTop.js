import { formatSampleItemsForGraph, parseFilters } from "../util";
import client from "./api_client";

class CloudCostTopService {
  BASE_URL = process.env.BASE_URL || "{PLACEHOLDER_BASE_URL}";

  async fetchCloudCostData(window, aggregate, costMetric, filters) {
    if (this.BASE_URL.includes("PLACEHOLDER_BASE_URL")) {
      this.BASE_URL = `http://localhost:9090/model`;
    }

    const params = {
      window,
      aggregate,
      costMetric,
      filter: parseFilters(filters ?? []),
      limit: 1000,
    };

    if (aggregate.includes("item")) {
      const resp = await client.get(
        `${
          this.BASE_URL
        }/cloudCost?window=${window}&costMetric=${costMetric}&filter=${parseFilters(
          filters
        )}`
      );
      const result_2 = await resp.data;

      return formatSampleItemsForGraph(result_2, costMetric);
    }

    const tableView = await client.get(`${this.BASE_URL}/cloudCost/view/table`, {
      params,
    });
    const totalsView = await client.get(
      `${this.BASE_URL}/cloudCost/view/totals`,
      {
        params,
      }
    );
    const graphView = await client.get(`${this.BASE_URL}/cloudCost/view/graph`, {
      params,
    });

    const status = await client.get(`${this.BASE_URL}/cloudCost/status`);

    return {
      tableRows: tableView.data.data,
      graphData: graphView.data.data,
      tableTotal: totalsView.data.data.combined,
      cloudCostStatus: status.data.data,
    };
  }
}

export default new CloudCostTopService();
