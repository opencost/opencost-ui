import { formatSampleItemsForGraph, parseFilters } from "../util";
import client from "./api_client";

class CloudCostTopService {
  async fetchCloudCostData(window, aggregate, costMetric, filters, currency) {
    const params = {
      window,
      aggregate,
      costMetric,
      filter: parseFilters(filters ?? []),
      limit: 1000,
    };
    if (currency) {
      params.currency = currency;
    }

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
      const result_2 = await resp.data;

      return formatSampleItemsForGraph(result_2, costMetric);
    }

    const tableView = await client.get(`/cloudCost/view/table`, {
      params,
    });
    const totalsView = await client.get(`/cloudCost/view/totals`, {
      params,
    });
    const graphView = await client.get(`/cloudCost/view/graph`, {
      params,
    });

    const status = await client.get(`/cloudCost/status`);

    return {
      tableRows: tableView.data.data,
      graphData: graphView.data.data,
      tableTotal: totalsView.data.data.combined,
      cloudCostStatus: status.data.data,
    };
  }
}

export default new CloudCostTopService();
